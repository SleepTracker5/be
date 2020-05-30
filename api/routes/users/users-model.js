const db = require("../../../data/dbConfig");
const { isIterable } = require("../../../api/utils/utils");

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
    .returning("id")
    .then(async res => {
      if (isIterable(res)) {
        const users = [];
        for (let id of res) {
          const user = await findBy({ id });
          user && users.push(sanitizeUser(user));
        }
        return users[0];
      } else {
        const user = await findBy({ id: res });
        return sanitizeUser(user);
      }
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
