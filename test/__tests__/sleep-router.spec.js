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
// const testAdmin = {
//   username: "testUserSleep",
//   password: hash,
//   role: 1,
// };
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

// const authError = {
//   message: "Invalid credentials",
//   validation: [],
//   data: {},
// };

// Test entry credentials
const sleepEntry = {
  sleep_start: 1608512400000,
  sleep_end: 1608552000000,
  sleep_goal: 8,
  user_id: 1,
  mood_waking: 3,
  mood_day: 3,
  mood_evening: 3,
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

  it("inserts a new sleep entry", async done => {
    try {
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
      console.log("Sending:", sleepEntry)
      const res = await request(server)
        .post("/api/sleep")
        .set({ authorization: token })
        .send(sleepEntry);
      expect(res.statusCode).toBe(201);
      expect(res.type).toBe("application/json");
      const sleep = res.body.data;
      console.log("sleep:", sleep);
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

  // it("updates an existing sleep entry", async done => {
  //   try {
  //     const param = 1;
  //     const updatedEntry = {
  //       sleep_start: 1608549000001,
  //       sleep_end: 1608552000001,
  //       sleep_goal: 16,
  //       user_id: 2,
  //       mood_waking: 4,
  //       mood_day: 4,
  //       mood_bedtime: 4,
  //     };
  //     // prettier-ignore
  //     const res = request(server)
  //       .put(`/api/sleep/${param}`)
  //       .send(updatedEntry)
  //     // Test mood integration a little more rigourously
  //     // since it is a more fragile test
  //     expect(res.mood_waking).toBe(4);
  //     expect(res.mood_waking).not.toBe(3);
  //     expect(res.mood_day).toBe(4);
  //     expect(res.mood_day).not.toBe(3);
  //     expect(res.mood_bedtime).toBe(4);
  //     expect(res.mood_bedtime).not.toBe(3);
  //     done();
  //   } catch (err) {
  //     console.log(err);
  //     done(err);
  //   }
  // });
});
