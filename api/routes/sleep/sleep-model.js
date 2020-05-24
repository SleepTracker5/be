const db = require("../../../data/dbConfig");

module.exports = { find, findBy, findBetween, insert, update, remove };

function find() {
  return db("sleep");
}

// prettier-ignore
function findBy(field) {
  return db("sleep")
    .where(field);
}

// prettier-ignore
function findBetween(start, end) {
  return db("sleep")
    .select()
    .whereBetween("date", [start, end]);
}

function insert(trace) {
  return db("sleep")
    .insert(trace)
    .then(async ids => {
      const traces = [];
      for (let id in ids) {
        const trace = await findBy({ id });
        traces.push(trace);
      }
      return traces;
    });
}

function update(id, changes) {
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
