// @ts-ignore
const bcrypt = require("bcryptjs");

// Db helpers
const db = require("../../data/dbConfig");
const {
  find,
  findBy,
  insert,
  update,
  remove,
} = require("../../api/routes/sleep/sleep-model");
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
  sleep_goal: 8,
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
      let users = await usersDb.find();
      expect(users).toHaveLength(0);
      await usersDb.insert(userLogin);
      users = await usersDb.find();
      const user = await users.find(user => user.id === 1);
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

  // Test the findBy method
  it("should find an entry by a provided record id", async done => {
    // Ensure entries have been deleted properly
    const deleted = await dbHasDeleted();
    expect(deleted).toBe(true);

    try {
      const user = await usersDb.insert(userLogin);
      expect(user.username).toBe("test User Sleep");
      const entry = await insert(sleepEntry);
      expect(entry).toBeDefined();
      done();
    } catch (err) {
      console.log(err);
      done(err);
    }

    try {
      const entries = await findBy({ id: 1 });
      const entry = entries[0];
      expect(entry).toBeDefined();
      // @ts-ignore
      expect(entry.sleep_start).toBe(sleepEntry.sleep_start);
      // @ts-ignore
      expect(entry.sleep_end).toBe(sleepEntry.sleep_end);
      done();
    } catch (err) {
      done(err);
    }
  });

  // Test the update method
  it("should update a entry successfully", async done => {
    // Ensure entries have been deleted properly
    const deleted = await dbHasDeleted();
    expect(deleted).toBe(true);

    try {
      // Create the sleep entry
      const user = await usersDb.insert(userLogin);
      expect(user.username).toBe("test User Sleep");
      await insert(sleepEntry);
      const entries = await find();
      const entry = entries.find(entry => entry.id === 1);
      expect(entry).toBeDefined();
      // @ts-ignore
      expect(entry.sleep_start).toBe(sleepEntry.sleep_start);
      // Update the sleep entry
      // @ts-ignore
      const param = entry.id;
      const updatedEntries = await update(param, { sleep_end: 1608552000001 });
      const updatedEntry = updatedEntries[0];
      // @ts-ignore
      expect(updatedEntry.sleep_end).toBe(1608552000001);
      done();
    } catch (err) {
      done(err);
    }
  });

  // Test the update method
  it("should delete a entry successfully", async done => {
    // Ensure entries have been deleted properly
    const deleted = await dbHasDeleted();
    expect(deleted).toBe(true);

    try {
      // Create the sleep entry
      const user = await usersDb.insert(userLogin);
      expect(user.username).toBe("test User Sleep");
      await insert(sleepEntry);
      const entries = await find();
      const entry = entries.find(entry => entry.id === 1);
      expect(entry).toBeDefined();
      // @ts-ignore
      expect(entry.sleep_start).toBe(sleepEntry.sleep_start);
      // Delete the sleep entry
      // @ts-ignore
      const param = entry.id;
      await remove(param);
      const deletedEntries = await find();
      expect(deletedEntries).toHaveLength(0);
      const deletedEntry = deletedEntries[0];
      // @ts-ignore
      expect(deletedEntry).toBeUndefined();
      done();
    } catch (err) {
      done(err);
    }
  });
});
