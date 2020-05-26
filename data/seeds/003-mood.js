const { find } = require("../../api/routes/sleep/sleep-model");
const { randRange } = require("../../api/utils/utils");

/**
 * @function createFakeMood Create a series of fake sleep entries
 * @param {Object} args The function args
 * @param {Number} fakeMoodRecords The array of records to populate with entries
 */
const createFakeMood = (args, fakeMoodRecords) => {
  let [mood_id, arr] = args;
  for (let idx = 0; idx < fakeMoodRecords; idx++) {
    createFakeMoodRecord(mood_id, idx + 1, arr);
  }
};

/**
 * @function createFakeMoodRecord Create a fake mood entry for a mood
 * @param {Number} sleep_id The mood id to use in the object
 * @param {Array} arr The array of mood entries for the mood
 */
const createFakeMoodRecord = (sleep_id, order, arr) => {
  const moodMin = 1;
  const moodMax = 4;
  let bedTimeOffset = randRange(-1, 3);
  let moodScore = Math.min(moodMax, Math.max(moodMin, moodMax - bedTimeOffset));
  arr.push({
    mood_score: moodScore, // earlier bedtime = better mood_waking
    order,
    sleep_id,
  });
  return arr;
};

exports.seed = async function (knex) {
  // Deletes ALL existing entries

  // Create a random set of 30 data points for each test mood
  // test moods are test1, test2, test3
  const sleepIds = (await find()).map(mood => mood.id);
  const fakeMoodRecords = 3; // at waking, during day, before bed
  const moodData = [];
  for (let sleep_id of sleepIds) {
    // @ts-ignore
    createFakeMood([Number(sleep_id), moodData], fakeMoodRecords);
  }

  // prettier-ignore
  return knex("mood")
    .del()
    .then(function () {
      // Inserts seed entries
      return knex("mood").insert(moodData);
    });
};
