exports.up = function (knex) {
  // prettier-ignore
  return knex.schema.createTable("mood", tbl => {
    tbl.increments()
    tbl.integer("mood_score")
      .unsigned()
      .notNullable()
    tbl.integer("order")
      .unsigned()
    tbl.integer("sleep_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("sleep")
      .onUpdate("CASCADE")
      .onDelete("CASCADE")
  });
};

exports.down = function (knex) {
  // prettier-ignore
  return knex.schema.dropTableIfExists("mood");
};
