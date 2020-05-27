const db = require("../../../data/dbConfig");

module.exports = { find, findBy, insert, update, remove };

function find() {
  return db("mood");
}

// prettier-ignore
function findBy(field) {
  return db("mood as m")
    .select(["m.id", "m.mood_score", "m.order", "m.sleep_id", "s.user_id"])
    .leftJoin("sleep as s", "s.id", "m.sleep_id")
    .where(field)
    .orderBy("sleep_id", "asc")
    .orderBy("order", "asc")
}

function insert(trace) {
  return db("sleep")
    .insert(trace)
    .returning("id")
    .then(async ids => {
      console.log("ids:", ids);
      return ids;
      // const traces = [];
      // for (let id of ids) {
      //   const trace = await findBy({ id });
      //   trace && traces.push(trace[0]);
      // }
      // return traces;
    });
}

function update(id, changes) {
  delete changes.id;
  return db("sleep")
    .where({ id })
    .update(changes)
    .then(async res => {
      if (res === 1) {
        const trace = await findBy({ id }); // the param
        return trace;
      }
    });
}

// prettier-ignore
function remove(id) {
  return db("sleep")
    .where({ id })
    .delete();
}
