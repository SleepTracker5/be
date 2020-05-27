exports.up = function (knex) {
  // prettier-ignore
  return knex.schema.createTable("sleep", tbl => {
    tbl.increments()
    tbl.bigInteger("sleep_start")
      .notNullable()
    tbl.bigInteger("sleep_end")
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
