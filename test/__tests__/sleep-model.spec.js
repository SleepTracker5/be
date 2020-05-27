const bcrypt = require("bcryptjs");

// Db helpers
const db = require("../../data/dbConfig");
const { find, insert } = require("../../api/routes/sleep/sleep-model");
const usersDb = require("../../api/routes/users/users-model");

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

// Test objects

// Test entry credentials
const sleepEntry = {
  sleep_start: 1608512400000,
  sleep_end: 1608552000000,
  user_id: 1,
};

// Test user credentials
const defaultPW = "123456";
const hash = bcrypt.hashSync(defaultPW, Number(process.env.HASHES));
const userLogin = {
  username: "test User Sleep",
  password: hash,
  role: 1,
};

// Tests

describe("the entries model", () => {
  beforeEach(async done => {
    try {
      await db("sleep").truncate();
      await db("users").truncate();
      done();
    } catch (err) {
      console.log("Unable to truncate the database", err);
      done(err);
    }
  });

  afterEach(async done => {
    try {
      await db("sleep").truncate();
      await db("users").truncate();
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
      done();
    } catch (err) {
      console.log(
        "Unable to truncate and remove a connection to the database",
        err,
      );
      done(err);
    }
  });

  // Test the find method
  it("should find all entries", async done => {
    // Ensure entries have been deleted properly
    const deleted = await dbHasDeleted();
    expect(deleted).toBe(true);

    try {
      // Add a user (for foreign key support)
      const users = await usersDb.find();
      expect(users).toHaveLength(0);
      const user = await usersDb.insert(userLogin);
      expect(user.username).toBe("test User Sleep");
      expect(user.role).toBe(1);
      // Add a sleep entry
      let entries = await find();
      expect(entries).toHaveLength(0);
      await insert(sleepEntry);
      await insert(sleepEntry);
      entries = await find();
      expect(entries).not.toHaveLength(0);
      expect(entries).toHaveLength(2);
      done();
    } catch (err) {
      console.log(err);
      done(err);
    }
  });

  // // Test the findBy method
  // it("should find a entry by a provided username", async done => {
  //   // Ensure entries have been deleted properly
  //   const deleted = await dbHasDeleted();
  //   expect(deleted).toBe(true);

  //   try {
  //     const user = await usersDb.insert(userLogin);
  //     expect(user.username).toBe("test User Sleep");
  //     const entry = await insert(sleepEntry);
  //     expect(entry).toBeDefined();
  //     done();
  //   } catch (err) {
  //     console.log(err);
  //     done(err);
  //   }

  //   try {
  //     const entry = await findBy({ id: sleepObj.id });
  //     expect(entry).toBeDefined();
  //     done();
  //   } catch (err) {
  //     done(err);
  //   }
  // });

  // // Test the update method
  // it("should update a entry successfully", async done => {
  //   // Ensure entries have been deleted properly
  //   const deleted = await dbHasDeleted();
  //   expect(deleted).toBe(true);

  //   try {
  //     // Create the sleep entry
  //     const entry = await insert(sleepEntry)[0];
  //     expect(entry).toBeDefined();
  //     expect(entry.sleep_start).toBe(sleepEntry.sleep_start);
  //     // Update the sleep entry
  //     const param = entry.id;
  //     const updatedEntry = await update(param, { sleep_end: 1608552000001 });
  //     // @ts-ignore
  //     expect(updatedEntry.sleep_end).toBe(1608552000001);
  //     done();
  //   } catch (err) {
  //     done(err);
  //   }
  // });
});
