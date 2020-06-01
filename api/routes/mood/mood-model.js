const db = require("../../../data/dbConfig");
const { isIterable } = require("../../../api/utils/utils");

module.exports = { find, findBy, findBySleepId, insert, update, remove };

function find() {
  return db("mood");
}

function findBy(field) {
  return db("mood").where(field);
}

// prettier-ignore
function findBySleepId(sleep_id) {
  return db("mood as m")
    .select(["m.id", "m.mood_score", "m.order", "m.sleep_id", "s.user_id"])
    .leftJoin("sleep as s", "s.id", "m.sleep_id")
    .where("s.id", sleep_id)
    .orderBy("sleep_id", "asc")
    .orderBy("order", "asc")
}

function insert(mood) {
  return db("mood")
    .insert(mood)
    .returning("id")
    .then(async res => {
      if (isIterable(res)) {
        const moods = [];
        for (let id of res) {
          const mood = await findBy({ id });
          mood && moods.push(mood[0]);
        }
        return moods;
      } else {
        return await findBy({ id: res });
      }
    });
}

function update(id, changes) {
  delete changes.id;
  return db("mood")
    .where({ id })
    .update(changes)
    .then(async res => {
      if (isIterable(res)) {
        const traces = [];
        // @ts-ignore
        for (let id of res) {
          const trace = await findBy({ id });
          trace && traces.push(trace[0]);
        }
        return traces;
      } else {
        return await findBy({ id: res });
      }
    });
}

// prettier-ignore
function remove(id) {
  return db("mood")
    .where({ id })
    .delete();
}
