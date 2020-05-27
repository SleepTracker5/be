module.exports = {
  production: {
    client: "pg",
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: "./data/prod/migrations",
    },
    seeds: {
      directory: "./data/prod/seeds",
    },
  },
  development: {
    client: "sqlite3",
    useNullAsDefault: true,
    connection: {
      filename: "./data/sleep-tracker.db3",
    },
    migrations: {
      directory: "./data/test/migrations",
    },
    seeds: {
      directory: "./data/test/seeds",
    },
    // needed when using foreign keys
    pool: {
      afterCreate: (conn, done) => {
        // runs after a connection is made to the sqlite engine
        conn.run("PRAGMA foreign_keys = ON", done); // turn on FK enforcement
      },
    },
  },
  testing: {
    client: "sqlite3",
    useNullAsDefault: true,
    connection: {
      filename: "./data/sleep-tracker-test.db3",
    },
    migrations: {
      directory: "./data/test/migrations",
    },
    seeds: {
      directory: "./data/test/seeds",
    },
    // needed when using foreign keys
    pool: {
      afterCreate: (conn, done) => {
        // runs after a connection is made to the sqlite engine
        conn.run("PRAGMA foreign_keys = ON", done); // turn on FK enforcement
      },
    },
  },
};
