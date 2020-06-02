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

// Note: @ts-ignore comments are there due to not using typescript files

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
const adminLogin = {
  username: "test Admin Sleep",
  password: hash,
  role: 2,
};

// Tests

describe("the entries model", () => {
  // Setup

  beforeEach(async done => {
    try {
      // Truncate the databases in order so that deletes can cascade
      await db("sleep").truncate();
      await db("users").truncate();

      // Ensure entries have been deleted properly
      const deleted = await dbHasDeleted();
      expect(deleted).toBe(true);

      // Add a user (for foreign key support)
      let users = await usersDb.find();
      expect(users).toHaveLength(0);
      await usersDb.insert(userLogin);
      users = await usersDb.find();
      expect(users).toHaveLength(1);

      // Expect it to be inserted into record id 1
      const user = await users.find(user => user.id === 1);
      expect(user.username).toBe("test User Sleep");
      expect(user.role).toBe(1);
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
    try {
      // Add two sleep entries
      let entries = await find();
      expect(entries).toHaveLength(0);
      await insert(sleepEntry);
      await insert(sleepEntry);
      // Expect to find two entries in the res
      entries = await find();
      expect(entries).not.toHaveLength(0);
      expect(entries).toHaveLength(2);
      // Test the returned shape
      // First entry should have the desired shape and values
      expect(entries[0].sleep_start).toBe(sleepEntry.sleep_start);
      expect(entries[0].sleep_end).toBe(sleepEntry.sleep_end);
      expect(entries[0].sleep_goal).toBe(sleepEntry.sleep_goal);
      expect(entries[0].user_id).toBe(sleepEntry.user_id);
      // Second entry should have the desired shape and values
      expect(entries[1].sleep_start).toBe(sleepEntry.sleep_start);
      expect(entries[1].sleep_end).toBe(sleepEntry.sleep_end);
      expect(entries[1].sleep_goal).toBe(sleepEntry.sleep_goal);
      expect(entries[1].user_id).toBe(sleepEntry.user_id);
      done();
    } catch (err) {
      console.log(err);
      done(err);
    }
  });

  // Test the findBy method
  it("should find an entry by a provided record id", async done => {
    try {
      // Insert the record to test
      await insert(sleepEntry);
      // Locate the record by id
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

  // Test the insert function
  it("should insert an entry successfully", async done => {
    try {
      const entries = await insert(sleepEntry);
      const entry = entries[0];
      expect(entry).toBeDefined();
      // @ts-ignore
      expect(entry.sleep_start).toBe(sleepEntry.sleep_start);
      // @ts-ignore
      expect(entry.sleep_end).toBe(sleepEntry.sleep_end);
      // @ts-ignore
      expect(entry.sleep_goal).toBe(sleepEntry.sleep_goal);
      // @ts-ignore
      expect(entry.user_id).toBe(sleepEntry.user_id);
      done();
    } catch (err) {
      done(err);
    }
  });

  // Test the update method
  it("should update a entry successfully", async done => {
    try {
      // Create the sleep entry
      const admin = await usersDb.insert(adminLogin);
      expect(admin.username).toBe("test Admin Sleep");
      await insert(sleepEntry);
      const entries = await find();
      const entry = entries.find(entry => entry.id === 1);
      expect(entry).toBeDefined();
      // @ts-ignore
      expect(entry.sleep_start).toBe(sleepEntry.sleep_start);
      // Update the sleep entry
      // @ts-ignore
      const param = entry.id;
      const updatedEntries = await update(param, {
        sleep_start: 1608549000001,
        sleep_end: 1608552000001,
        sleep_goal: 16,
        user_id: 2,
      });
      const updatedEntry = updatedEntries[0];
      // Test the entry
      // @ts-ignore
      expect(updatedEntry.sleep_start).toBe(1608549000001);
      expect(updatedEntry.sleep_end).toBe(1608552000001);
      expect(updatedEntry.sleep_goal).toBe(16);
      expect(updatedEntry.user_id).toBe(2);
      done();
    } catch (err) {
      done(err);
    }
  });

  // Test the update method
  it("should delete a entry successfully", async done => {
    try {
      // Create the sleep entry
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
      const entriesAfterDelete = await find();
      expect(entriesAfterDelete).toHaveLength(0);
      const entryAfterDelete = entriesAfterDelete[0];
      // @ts-ignore
      expect(entryAfterDelete).toBeUndefined();
      done();
    } catch (err) {
      done(err);
    }
  });
});
