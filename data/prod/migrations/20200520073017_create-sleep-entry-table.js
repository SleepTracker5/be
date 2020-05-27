exports.up = function (knex) {
  // prettier-ignore
  return knex.schema.createTable("sleep", tbl => {
    tbl.increments()
    tbl.timestamp("sleep_start")
      .notNullable()
    tbl.timestamp("sleep_end")
      .notNullable()
    tbl.float("sleep_goal")
      .notNullable()
    tbl.integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onUpdate("CASCADE")
      .onDelete("CASCADE")
  });
};

exports.down = function (knex) {
  // prettier-ignore
  return knex.schema.dropTableIfExists("sleep");
};
