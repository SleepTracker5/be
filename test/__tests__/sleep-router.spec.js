const server = require("../../api/server");
const request = require("supertest");
const db = require("../../data/dbConfig");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Note: @ts-ignore comments are there due to not using typescript file extensions / interfaces

// Db helpers
const { find } = require("../../api/routes/users/users-model");

// Test helpers
const dbHasDeleted = async () => {
  try {
    const entries = await find();
    return entries && entries.length ? false : true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const isVerifiedJWT = async token => {
  // eslint-disable-next-line no-unused-vars
  return await jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    return err ? false : true;
  });
};

// Test objects

// Test user credentials
const defaultPW = "123456";
const hash = bcrypt.hashSync(defaultPW, Number(process.env.HASHES));
// Regular test user
const testUser = {
  username: "testUserSleep",
  password: hash,
  role: 1,
};
const userLogin = {
  username: "testUserSleep",
  password: hash,
};
// Admin test user
const testAdmin = {
  username: "testAdminSleep",
  password: hash,
  role: 2,
};
// const adminLogin = {
//   username: "testAdminSleep",
//   password: hash,
// };

// Error responses
// const sleepIdNotFoundError = {
//   message: "Invalid Username",
//   validation: ["There was a problem retrieving the username"],
//   data: {},
// };

const authError = {
  message: "Invalid credentials",
  validation: [],
  data: {},
};

// Test entry credentials
const sleepEntry = {
  sleep_start: 1608512400000,
  sleep_end: 1608552000000,
  sleep_goal: 8,
  user_id: 1,
  mood_waking: 3,
  mood_day: 3,
  mood_bedtime: 3,
};

const sleepEntry2 = {
  sleep_start: "1585872000000",
  sleep_end: "1585908000000",
  sleep_goal: 6,
  user_id: 1,
  mood_waking: 4,
  mood_day: 2,
  mood_bedtime: 4,
};

const sleepEntry3 = {
  sleep_start: "1586811600000",
  sleep_end: "1586829600000",
  user_id: 1,
  sleep_goal: 8,
  mood_waking: 4,
  mood_day: 4,
  mood_bedtime: 3,
};

// Integration tests

describe("the sleep route", () => {
  beforeEach(async done => {
    try {
      // Truncate the databases in order so that deletes can cascade
      await db("sleep").truncate();
      await db("users").truncate();

      // Ensure entries have been deleted properly
      const deleted = await dbHasDeleted();
      expect(deleted).toBe(true);

      // Register a user so that login can happen
      // prettier-ignore
      const regRes = await request(server)
        .post("/api/register")
        .send(testUser);
      expect(regRes.statusCode).toBe(201);

      // Continue
      done();
    } catch (err) {
      console.log(err);
      done(err);
    }
  });

  afterEach(async done => {
    try {
      await db("sleep").truncate();
      done();
    } catch (err) {
      console.log("Unable to truncate the database", err);
      done(err);
    }
  });

  // Teardown
  afterAll(async done => {
    try {
      await db("sleep").truncate();
      await db("users").truncate();
      db.destroy();
      done();
    } catch (err) {
      console.log(
        "Unable to truncate and remove a connection to the database",
        err,
      );
      done(err);
    }
  });

  // Add a sleep entry
  it("inserts a new sleep entry", async done => {
    try {
      // It should return a 401 if not logged in
      // prettier-ignore
      const noAuth = await request(server)
        .post("/api/sleep")
        .send(sleepEntry);
      expect(noAuth.statusCode).toBe(401);
      expect(noAuth.type).toBe("application/json");
      expect(noAuth.body).toEqual(authError);

      // Attempt login
      // prettier-ignore
      const loginRes = await request(server)
        .post("/api/login")
        .send(userLogin);
      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.type).toBe("application/json");
      expect(loginRes.headers["set-cookie"]).toBeDefined(); // token cookie
      expect(loginRes.body.data.user.username).toBe(userLogin.username);
      const token = loginRes.body.data.token;
      expect(token).toBeDefined();
      const validJWT = await isVerifiedJWT(token);
      expect(validJWT).toBe(true);

      // prettier-ignore
      const res = await request(server)
        .post("/api/sleep")
        .set({ authorization: token })
        .send(sleepEntry);
      expect(res.statusCode).toBe(201);
      expect(res.type).toBe("application/json");

      // Test that the response has the desired shape and values
      const sleep = res.body.data;
      expect(sleep.sleep_start).toBe(sleepEntry.sleep_start);
      expect(sleep.sleep_end).toBe(sleepEntry.sleep_end);
      expect(sleep.sleep_goal).toBe(sleepEntry.sleep_goal);
      expect(sleep.user_id).toBe(sleepEntry.user_id);

      done();
    } catch (err) {
      console.log(err);
      done(err);
    }
  });

  // Deletes a sleep entry
  it("deletes a new sleep entry", async done => {
    try {
      // It should return a 401 if not logged in
      // prettier-ignore
      const noAuth = await request(server)
        .post("/api/sleep")
        .send(sleepEntry);
      expect(noAuth.statusCode).toBe(401);
      expect(noAuth.type).toBe("application/json");
      expect(noAuth.body).toEqual(authError);

      // Attempt login
      // prettier-ignore
      const loginRes = await request(server)
        .post("/api/login")
        .send(userLogin);
      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.type).toBe("application/json");
      expect(loginRes.headers["set-cookie"]).toBeDefined(); // token cookie
      expect(loginRes.body.data.user.username).toBe(userLogin.username);
      const token = loginRes.body.data.token;
      expect(token).toBeDefined();
      const validJWT = await isVerifiedJWT(token);
      expect(validJWT).toBe(true);

      // prettier-ignore
      const res = await request(server)
        .post("/api/sleep")
        .set({ authorization: token })
        .send(sleepEntry);
      expect(res.statusCode).toBe(201);
      expect(res.type).toBe("application/json");

      // Doesn't delete if not a valid id
      const delFail = await request(server)
        .delete(`/api/sleep/9999999999999`)
        .set({ authorization: token });
      expect(delFail.statusCode).toBe(404);

      // Delete the entry if it's a valid id
      // prettier-ignore
      const del = await request(server)
        .delete(`/api/sleep/${res.body.data.id}`)
        .set({ authorization: token });
      expect(del.statusCode).toBe(200);
      expect(del.type).toBe("application/json");

      done();
    } catch (err) {
      console.log(err);
      done(err);
    }
  });

  it("returns all sleep data for a user", async done => {
    try {
      // Register a user so that the update can change the user_id to this user id
      // prettier-ignore
      const regRes = await request(server)
      .post("/api/register")
      .send(testAdmin);
      expect(regRes.statusCode).toBe(201);

      // Attempt login
      // prettier-ignore
      const loginRes = await request(server)
      .post("/api/login")
      .send(userLogin);
      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.type).toBe("application/json");
      expect(loginRes.headers["set-cookie"]).toBeDefined(); // token cookie
      expect(loginRes.body.data.user.username).toBe(userLogin.username);
      const token = loginRes.body.data.token;
      expect(token).toBeDefined();
      const validJWT = await isVerifiedJWT(token);
      expect(validJWT).toBe(true);

      // Add the first entry
      const res1 = await request(server)
        .post("/api/sleep")
        .set({ authorization: token })
        .send(sleepEntry);
      expect(res1.statusCode).toBe(201);
      expect(res1.type).toBe("application/json");

      // Add the second entry
      const sleepEntry2b = { ...sleepEntry2, user_id: 2 };
      const res2 = await request(server)
        .post("/api/sleep")
        .set({ authorization: token })
        .send(sleepEntry2b);
      expect(res2.statusCode).toBe(201);
      expect(res2.type).toBe("application/json");

      // Add the third entry
      const res3 = await request(server)
        .post("/api/sleep")
        .set({ authorization: token })
        .send(sleepEntry3);
      expect(res3.statusCode).toBe(201);
      expect(res3.type).toBe("application/json");

      // Get all data
      const allSleep = await request(server)
        .get("/api/sleep")
        .set({ authorization: token });
      expect(allSleep.statusCode).toBe(200);
      expect(allSleep.type).toBe("application/json");

      // Test that both entries are in the response
      const sleepArr = allSleep.body.data;
      expect(sleepArr).not.toHaveLength(0);
      expect(sleepArr).toHaveLength(2);

      // Test that the user id is correct on each object
      const userId = loginRes.body.data.user.id;
      const uidFound = sleepArr.every(sleep => {
        return Number(sleep.user_id) === Number(userId);
      });
      expect(uidFound).toBe(true);

      done();
    } catch (err) {
      console.log(err);
      done(err);
    }
  });

  it("returns only data for the logged in user", async done => {
    try {
      // Register a user so that the update can change the user_id to this user id
      // prettier-ignore
      const regRes = await request(server)
      .post("/api/register")
      .send(testAdmin);
      expect(regRes.statusCode).toBe(201);

      // Attempt login
      // prettier-ignore
      const loginRes = await request(server)
      .post("/api/login")
      .send(userLogin);
      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.type).toBe("application/json");
      expect(loginRes.headers["set-cookie"]).toBeDefined(); // token cookie
      expect(loginRes.body.data.user.username).toBe(userLogin.username);
      const token = loginRes.body.data.token;
      expect(token).toBeDefined();
      const validJWT = await isVerifiedJWT(token);
      expect(validJWT).toBe(true);

      // Add the first entry
      const res1 = await request(server)
        .post("/api/sleep")
        .set({ authorization: token })
        .send(sleepEntry);
      expect(res1.statusCode).toBe(201);
      expect(res1.type).toBe("application/json");

      // Add the second entry
      const res2 = await request(server)
        .post("/api/sleep")
        .set({ authorization: token })
        .send(sleepEntry2);
      expect(res2.statusCode).toBe(201);
      expect(res2.type).toBe("application/json");

      // Add the third entry
      const res3 = await request(server)
        .post("/api/sleep")
        .set({ authorization: token })
        .send(sleepEntry3);
      expect(res3.statusCode).toBe(201);
      expect(res3.type).toBe("application/json");

      // Get all data
      const allSleep = await request(server)
        .get("/api/sleep")
        .set({ authorization: token });
      expect(allSleep.statusCode).toBe(200);
      expect(allSleep.type).toBe("application/json");

      // Test that all three entries are in the response
      expect(allSleep.body.data).not.toHaveLength(0);
      expect(allSleep.body.data).toHaveLength(3);
      done();
    } catch (err) {
      console.log(err);
      done(err);
    }
  });

  it("get by Id returns a single entry for a user", async done => {
    try {
      // Register a user so that the update can change the user_id to this user id
      // prettier-ignore
      const regRes = await request(server)
        .post("/api/register")
        .send(testAdmin);
      expect(regRes.statusCode).toBe(201);

      // Attempt login
      // prettier-ignore
      const loginRes = await request(server)
        .post("/api/login")
        .send(userLogin);
      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.type).toBe("application/json");
      expect(loginRes.headers["set-cookie"]).toBeDefined(); // token cookie
      expect(loginRes.body.data.user.username).toBe(userLogin.username);
      const token = loginRes.body.data.token;
      expect(token).toBeDefined();
      const validJWT = await isVerifiedJWT(token);
      expect(validJWT).toBe(true);

      // Add the first entry
      const res1 = await request(server)
        .post("/api/sleep")
        .set({ authorization: token })
        .send(sleepEntry);
      expect(res1.statusCode).toBe(201);
      expect(res1.type).toBe("application/json");

      // Add the first entry
      const res2 = await request(server)
        .post("/api/sleep")
        .set({ authorization: token })
        .send(sleepEntry2);
      expect(res2.statusCode).toBe(201);
      expect(res2.type).toBe("application/json");

      // Add the second entry
      const sleepEntry2b = { ...sleepEntry2, user_id: 2 };
      const res2b = await request(server)
        .post("/api/sleep")
        .set({ authorization: token })
        .send(sleepEntry2b);
      expect(res2b.statusCode).toBe(201);
      expect(res2b.type).toBe("application/json");

      // Get the data
      const sleep = await request(server)
        .get(`/api/sleep/${res1.body.data.id}`)
        .set({ authorization: token });
      expect(sleep.statusCode).toBe(200);
      expect(sleep.type).toBe("application/json");

      // Make sure it only contains one object
      const sleepData = sleep.body.data;
      expect(Array.isArray(sleepData)).toBe(false);

      // Make sure the data is only for this user
      const userId = loginRes.body.data.user.id;
      expect(sleepData.user_id).toBe(userId);

      // Make sure the entry is the correct one
      expect(sleepData).toMatchObject(sleepEntry);
      expect(sleepData).not.toMatchObject(sleepEntry2);
      expect(sleepData).not.toMatchObject(sleepEntry2b);

      done();
    } catch (err) {
      console.log(err);
      done(err);
    }
  });

  // Update a sleep entry
  it("updates an existing sleep entry", async done => {
    try {
      // Register a user so that the update can change the user_id to this user id
      // prettier-ignore
      const regRes = await request(server)
        .post("/api/register")
        .send(testAdmin);
      expect(regRes.statusCode).toBe(201);

      // Attempt login
      // prettier-ignore
      const loginRes = await request(server)
        .post("/api/login")
        .send(userLogin);
      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.type).toBe("application/json");
      expect(loginRes.headers["set-cookie"]).toBeDefined(); // token cookie
      expect(loginRes.body.data.user.username).toBe(userLogin.username);
      const token = loginRes.body.data.token;
      expect(token).toBeDefined();
      const validJWT = await isVerifiedJWT(token);
      expect(validJWT).toBe(true);

      // Add the entry
      const sleep = await request(server)
        .post("/api/sleep")
        .set({ authorization: token })
        .send(sleepEntry);
      const sleepInserted = sleep.body.data;

      // Update the entry
      const updatedEntry = {
        sleep_start: 1608549000001,
        sleep_end: 1608552000001,
        sleep_goal: 16,
        user_id: 2,
        mood_waking: 4,
        mood_day: 4,
        mood_bedtime: 4,
      };

      // It should return a 401 if not logged in
      // prettier-ignore
      const noAuth = await request(server)
        .put(`/api/sleep/${sleepInserted.id}`)
        .send(updatedEntry)
      expect(noAuth.statusCode).toBe(401);
      expect(noAuth.type).toBe("application/json");
      expect(noAuth.body).toEqual(authError);

      // Should return a 404 if id doesn't exist
      // prettier-ignore
      const resFail = await request(server)
        .put(`/api/sleep/99999999999999999999999`)
        .set({ authorization: token })
        .send(updatedEntry)
      expect(resFail.statusCode).toEqual(404);

      // prettier-ignore
      const res = await request(server)
        .put(`/api/sleep/${sleepInserted.id}`)
        .set({ authorization: token })
        .send(updatedEntry)

      // Test that the data returned is correctly updated
      const updated = res.body.data;
      expect(updated.sleep_start).toBe(updatedEntry.sleep_start);
      expect(updated.sleep_end).toBe(updatedEntry.sleep_end);
      expect(updated.sleep_goal).toBe(updatedEntry.sleep_goal);
      expect(updated.user_id).toBe(updatedEntry.user_id);
      expect(updated.mood_waking).toBe(updatedEntry.mood_waking);
      expect(updated.mood_day).toBe(updatedEntry.mood_day);
      expect(updated.mood_bedtime).toBe(updatedEntry.mood_bedtime);

      done();
    } catch (err) {
      console.log(err);
      done(err);
    }
  });
});
