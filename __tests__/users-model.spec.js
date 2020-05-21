const bcrypt = require("bcryptjs");

// Db helpers
const db = require("../data/dbConfig");
const { find, findBy, insert } = require("../api/routes/users/users-model");

// Test helpers
const dbHasDeleted = async () => {
  try {
    const users = await find();
    return users && users.length ? false : true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

// Test objects

// Test user credentials
const defaultPW = "123456";
const hash = bcrypt.hashSync(defaultPW, Number(process.env.HASHES));

const userLogin = {
  username: "test User",
  password: hash,
  role: "1",
};

// Tests

describe("the users model", () => {
  beforeEach(async done => {
    try {
      await db("users").del();
      done();
    } catch (err) {
      console.log("Unable to del the database", err);
      done(err);
    }
  });

  afterAll(async done => {
    try {
      await db.destroy();
      done();
    } catch (err) {
      console.log("Unable to close the database connection", err);
      done(err);
    }
  });

  it("should find all users", async done => {
    // Ensure users have been deleted properly
    const deleted = await dbHasDeleted();
    expect(deleted).toBe(true);

    try {
      let users = await find();
      expect(users).toHaveLength(0);
      await insert(userLogin);
      users = await find(); // add a user
      expect(users).not.toHaveLength(0);
      expect(users).toHaveLength(1);
      done();
    } catch (err) {
      console.log(err);
      done(err);
    }
  });

  it("should insert the provided user into the db", async done => {
    // Ensure users have been deleted properly
    const deleted = await dbHasDeleted();
    expect(deleted).toBe(true);

    try {
      const user = await insert(userLogin);
      expect(user.username).toBe("test User");
      expect(user.password).not.toBe(hash);
      expect(user.role).toBe(1);
      done();
    } catch (err) {
      console.log(err);
      done(err);
    }
  });

  it("should find a user by a provided username", async done => {
    // Ensure users have been deleted properly
    const deleted = await dbHasDeleted();
    expect(deleted).toBe(true);

    try {
      const user = await insert(userLogin);
      expect(user.username).toBe("test User");
      expect(user.password).not.toBe(hash); // sanitizeUser should get rid of this
      expect(user.role).toBe(1);
      done();
    } catch (err) {
      console.log(err);
      done(err);
    }

    try {
      const user = await findBy({ username: userLogin.username });
      expect(user.username).toBe("test User");
      expect(user.password).toBe(hash); // can't use sanitizeUser with findBy
      expect(user.role).toBe(1);
      done();
    } catch (err) {
      done(err);
    }
  });
});
