exports.up = function (knex) {
  // prettier-ignore
  return knex.schema.createTable("sleep", tbl => {
    tbl.increments()
    tbl.integer("sleep_start")
      .unsigned()
      .notNullable()
    tbl.integer("sleep_end")
      .unsigned()
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
