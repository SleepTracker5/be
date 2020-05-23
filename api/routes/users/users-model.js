const db = require("../../../data/dbConfig");

// Utils
const { sanitizeUser } = require("../../utils/utils");

module.exports = {
  find,
  findBy,
  insert,
  update,
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

function update(id, changes) {
  return db("users")
    .update(changes)
    .where({ id })
    .then(async res => {
      if (res === 1) {
        const user = await findBy({ id }); // the param
        return sanitizeUser(user);
      }
    });
}
