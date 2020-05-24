const server = require("../../api/server");
const request = require("supertest");
const db = require("../../data/dbConfig");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helpers
const dbHasNoUsers = async () => {
  // Verifies that the database has noUsers
  try {
    const users = await find();
    return users && users.length ? false : true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const verifyProperties = (obj, props) => {
  // Verifies that the object has the required properties
  const objKeys = Object.keys(obj);
  return props.every(key => objKeys.includes(key));
};

// Db helpers
const { find } = require("../../api/routes/users/users-model");

// Test user credentials
const defaultPW = "123456";
const hash = bcrypt.hashSync(defaultPW, Number(process.env.HASHES));

const testUser = {
  username: "test User",
  password: hash,
  role: 1,
};

const usernameNotFoundError = {
  message: "Invalid Username",
  validation: ["There was a problem retrieving the username"],
  data: {},
};

const usernameNotUniqueError = {
  message: "Invalid Username",
  validation: ["Username is invalid"], // Don't indicate it already exists for security reasons
  data: {},
};

describe("the auth route", () => {
  describe("/register", () => {
    beforeEach(async done => {
      try {
        await db("users").del();
        done();
      } catch (err) {
        console.log("Unable to del the database", err);
        done(err);
      }
    });

    it("inserts a new user into the db", async () => {
      // Ensure users have been deleted properly
      const noUsers = await dbHasNoUsers();
      expect(noUsers).toBe(true);
      // Test the endpoint
      const res = await request(server).post("/api/register").send(testUser);
      const resUser = res.body.data.user;
      expect(res.statusCode).toBe(201);
      expect(res.type).toBe("application/json");
      expect(verifyProperties(resUser, ["username", "role"])).toBe(true);
      expect(resUser.username).toBe(testUser.username);
      expect(resUser.role).toBe(testUser.role);
    });

    it("doesn't insert an existing user into the database", async done => {
      // Ensure users have been deleted properly
      let noUsers = await dbHasNoUsers();
      expect(noUsers).toBe(true);
      // Test the endpoint by registering a user
      await request(server).post("/api/register").send(testUser);
      noUsers = await dbHasNoUsers();
      expect(noUsers).toBe(false);
      try {
        // Register a second user without truncating the dbase
        const res = await request(server).post("/api/register").send(testUser);
        // It should throw an error
        expect(res.statusCode).toBe(400);
        expect(res.type).toBe("application/json");
        expect(JSON.parse(res.text)).toEqual(usernameNotUniqueError);
        // There should still only be 1 user in the dbase
        const users = await find();
        expect(users).toHaveLength(1);
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  describe("the /login route", () => {
    beforeEach(async done => {
      try {
        await db("users").del();
        done();
      } catch (err) {
        console.log("Unable to del the database", err);
        done(err);
      }
    });

    it("it authenticates a correct username and password", async done => {
      // Ensure users have been deleted properly
      let noUsers = await dbHasNoUsers();
      expect(noUsers).toBe(true);

      try {
        // Register a user so that login can happen
        const regRes = await request(server)
          .post("/api/register")
          .send(testUser);
        expect(regRes.statusCode).toBe(201);
        // Attempt login
        const loginRes = await request(server)
          .post("/api/login")
          .send(testUser);
        expect(loginRes.statusCode).toBe(200);
        expect(loginRes.type).toBe("application/json");
        expect(loginRes.headers["set-cookie"]).toBeDefined(); // token cookie
        expect(loginRes.body.data.user.username).toBe(testUser.username);
        // verify the JWT
        const token = loginRes.body.data.token;
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
          expect(err).toBeNull();
          expect(decoded.role).toBe(testUser.role);
        });
        done();
      } catch (err) {
        console.log(err);
        done(err);
      }
    });

    it("won't attempt to login an invalid username", async done => {
      // Ensure users have been deleted properly
      let noUsers = await dbHasNoUsers();
      expect(noUsers).toBe(true);

      // Insert a new user into the database
      try {
        // Register a user so that login can happen
        const regRes = await request(server)
          .post("/api/register")
          .send(testUser);
        expect(regRes.statusCode).toBe(201);
        // Attempt login
        const loginRes = await request(server)
          .post("/api/login")
          .send({ username: "BadUsername", password: hash });
        expect(loginRes.statusCode).toBe(400);
        expect(loginRes.type).toBe("application/json");
        expect(loginRes.body).toEqual(usernameNotFoundError);
        done();
      } catch (err) {
        console.log(err);
        done(err);
      }
    });

    it("will throw an error if sent invalid login credentials", async done => {
      // Ensure users have been deleted properly
      let noUsers = await dbHasNoUsers();
      expect(noUsers).toBe(true);

      // Insert a new user into the database
      try {
        // Register a user so that login can happen
        const regRes = await request(server)
          .post("/api/register")
          .send(testUser);
        expect(regRes.statusCode).toBe(201);
        // Attempt login
        const loginRes = await request(server)
          .post("/api/login")
          .send({ username: "BadUsername", password: hash });
        expect(loginRes.statusCode).toBe(400);
        expect(loginRes.type).toBe("application/json");
        expect(loginRes.body).toEqual(usernameNotFoundError);
        done();
      } catch (err) {
        done(err);
      }
    });
  });
});
