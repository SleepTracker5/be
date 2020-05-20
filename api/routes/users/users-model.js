const db = require("../../../data/dbConfig");

// Utils
const { sanitizeUser } = require("../../utils/utils");

module.exports = {
  find,
  findBy,
  insert,
};

function find() {
  return db("users").then(users => {
    return users.map(user => sanitizeUser(user));
  });
}

function findBy(field) {
  return db("users").where(field).first();
}

function insert(user) {
  return db("users")
    .insert(user)
    .then(async ids => {
      const user = await findBy({ id: ids[0] });
      return sanitizeUser(user);
    });
}
