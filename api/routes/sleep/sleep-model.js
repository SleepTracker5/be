const db = require("../../../data/dbConfig");

module.exports = { find, findBy, findAll, insert, update, remove };

// prettier-ignore
function find(query) {
  // Timestamps run from 1900-01-01 to 9999-12-31
  let { start = -2208970800000, end = 253402232400000 } = query ? query : {};
  return db("sleep")
    .whereBetween("sleep_start", [start, end]);
}

// prettier-ignore
function findAll() {
  return db("sleep")
}

// prettier-ignore
function findBy(field, query) {
  // Timestamps run from 1900-01-01 to 9999-12-31
  let { start = -2208970800000, end = 253402232400000 } = query ? query : {};
  return db("sleep")
    .where(field)
    .whereBetween("sleep_start", [start, end]);
}

function insert(trace) {
  return db("sleep")
    .insert(trace)
    .then(async ids => {
      const traces = [];
      for (let id of ids) {
        const trace = await findBy({ id });
        traces.push(trace);
      }
      return traces;
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
