const db = require("../data/dbConfig");

afterAll(async () => {
  await db.destroy();
});
