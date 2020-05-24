const moment = require("moment");
const { find } = require("../../api/routes/users/users-model");
const { randRange } = require("../../api/utils/utils");

/**
 * @function createFakeSleep Create a series of fake sleep entries
 * @param {Object} args The function args
 * @param {Number} fakeSleepRecords The array of records to populate with entries
 */
const createFakeSleep = (args, fakeSleepRecords) => {
  let [date, user_id, arr] = args;
  let days = 0;
  for (let idx = 0; idx < fakeSleepRecords; idx++) {
    date = date.add(days, "days");
    createFakeSleepRecord(date, user_id, arr);
    days++;
  }
};

/**
 * @function createFakeSleepRecord Create a fake sleep entry for a user
 * @param {Object} date The basis date
 * @param {Number} user_id The user id to use in the object
 * @param {Array} arr The array of sleep entries for the user
 */
const createFakeSleepRecord = (date, user_id, arr) => {
  let bedTimeOffset = randRange(-1, 3);
  let sleepHours = randRange(4, 12);
  arr.push({
    sleep_start: date.add(bedTimeOffset, "hours").valueOf(),
    sleep_end: date.add(bedTimeOffset + sleepHours, "hours").valueOf(),
    user_id,
  });
};

exports.seed = async function (knex) {
  // Deletes ALL existing entries

  // Create a random set of 30 data points for each test user
  // test users are test1, test2, test3
  const sleepUserIds = (await find()).map(user => user.id);
  const startDate = moment("2020-04-01 21:00", "YYYY-MM-DD hh:mm");
  const fakeSleepRecords = 30;
  const userData = [];
  for (let user_id of sleepUserIds.slice(2)) {
    let date = startDate;
    createFakeSleep([date, Number(user_id), userData], fakeSleepRecords);
  }

  // prettier-ignore
  return knex("sleep")
    .truncate()
    .then(function () {
      // Inserts seed entries
      return knex("sleep").insert(userData);
    });
};
