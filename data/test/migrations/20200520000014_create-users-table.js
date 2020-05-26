exports.up = function (knex) {
  // prettier-ignore
  return knex.schema.createTable("users", tbl => {
    tbl.increments()
    tbl.text("username")
      .unique()
      .notNullable()
    tbl.text("password")
      .notNullable()
    tbl.integer("role")
      .unsigned()
      .notNullable()
      .defaultTo(1)
    // Optional fields
    tbl.text("first_name")
    tbl.text("last_name")
    tbl.text("email")
  })
};

exports.down = function (knex) {
  // prettier-ignore
  return knex.schema.dropTableIfExists("users");
};
