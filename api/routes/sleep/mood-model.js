const db = require("../../../data/dbConfig");

module.exports = { find, findBy, insert, update, remove };

function find() {
  return db("mood");
}

// prettier-ignore
function findBy(field) {
  return db("mood")
    .where(field);
}

function insert(trace) {
  return db("mood")
    .insert(trace)
    .then(async ids => {
      const traces = [];
      for (let id in ids) {
        const trace = await findBy({ id });
        traces.push(trace);
      }
      return traces.length > 1 ? traces : traces[0];
    });
}

function update(id, changes) {
  return db("mood")
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
  return db("mood")
    .where({ id })
    .delete();
}
