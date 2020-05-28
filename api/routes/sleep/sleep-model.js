const db = require("../../../data/dbConfig");

module.exports = { find, findBy, insert, update, remove };

// prettier-ignore
function find(query) {
  // Timestamps run from 1900-01-01 to 9999-12-31
  let { start = -2208970800000, end = 253402232400000 } = query ? query : {};
  return db("sleep as s")
    .whereBetween("s.sleep_start", [start, end])
    .orderBy("s.sleep_start")
}

// prettier-ignore
function findBy(field, query) {
  // Timestamps run from 1900-01-01 to 9999-12-31
  let { start = -2208970800000, end = 253402232400000 } = query ? query : {};
  return db("sleep as s")
    .where(field)
    .whereBetween("s.sleep_start", [start, end])
    .orderBy("s.sleep_start")
}

function insert(trace) {
  return db("sleep")
    .insert(trace)
    .then(async ids => {
      const traces = [];
      for (let id of ids) {
        const trace = await findBy({ id });
        trace && traces.push(trace[0]);
      }
      return traces;
    });
}

function update(id, changes) {
  delete changes.id;
  return db("sleep")
    .where({ id })
    .update(changes)
    .returning("id")
    .then(async res => {
      console.log("update:", res);
      //   if (res === 1) {
      //     const trace = await findBy({ id }); // the param
      //     return trace;
      //   }
    });
}

// prettier-ignore
function remove(id) {
  return db("sleep")
    .where({ id })
    .delete();
}
