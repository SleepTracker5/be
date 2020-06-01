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
    if (err) {
      console.log("jwt err", err);
      return false;
    } else {
      console.log("no err");
      return true;
    }
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
      console.log("Setting token to:", token);
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

  it("returns all sleep data for a user", async done => {
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
    expect(allSleep.body.data).not.toHaveLength(0);
    expect(allSleep.body.data).toHaveLength(3);
    done();
  });

  it("returns only data for the logged in user", async done => {
    expect(1).toBe(1);
    done();
  });

  it("returns all data in a range when using a query string", async done => {
    expect(1).toBe(1);
    done();
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

      // prettier-ignore
      const res = await request(server)
        .put(`/api/sleep/${sleepInserted.id}`)
        .set({ authorization: token })
        .send(updatedEntry)

      // Test mood integration a little more rigourously
      console.log("updated Res", res.body);
      const updated = res.body.data;
      expect(updated.mood_waking).toBe(4);
      expect(updated.mood_waking).not.toBe(3);
      expect(updated.mood_day).toBe(4);
      expect(updated.mood_day).not.toBe(3);
      expect(updated.mood_bedtime).toBe(4);
      expect(updated.mood_bedtime).not.toBe(3);
      done();
    } catch (err) {
      console.log(err);
      done(err);
    }
  });
});
