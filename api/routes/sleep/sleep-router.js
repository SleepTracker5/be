const express = require("express");
const router = express.Router();
const moment = require("moment");

// Db helpers, utils
const { find, findBy, insert, update, remove } = require("./sleep-model");
const moodDb = require("../mood/mood-model");
const { errDetail, isIterable, validateTime } = require("../../utils/utils");

// Constants
const userPermissionLevel = 1;
const millisecondsInOneHour = 1000 * 60 * 60;

// Routes
/**
 * @api {get} /api/sleep?start='dateHere'&end='dateHere' Get All Sleep
 * @apiGroup Sleep
 * @apiDescription Get All Sleep, with optional query string to request data within a date range
 * @apiSuccess {Array} sleep An array of objects with the sleep information
 * @apiSuccessExample {json} Success Response:
 * HTTP/1.1 200: OK
 * {
 *   "message": "Success",
 *   "validation": [],
 *   "data": [
 *         {
 *            "id": 1,
 *            "sleep_start": 1585800000000,
 *            "sleep_end": 1585843200000,
 *            "sleep_goal": 6,
 *            "user_id": 3
 *         },
 *         {
 *            "id": 2,
 *            "sleep_start": 1585886400000,
 *            "sleep_end": 1585940400000,
 *            "sleep_goal": 11,
 *            "user_id": 3
 *         },
 *         {
 *            "id": 3,
 *            "sleep_start": 1586048400000,
 *            "sleep_end": 1586073600000,
 *            "sleep_goal": 9,
 *            "user_id": 3
 *         },
 *    ]
 * }
 * @apiErrorExample {json} Invalid Credentials:
 * {
 *  "message": "Invalid Credentials",
 *  "validation": [],
 *  "data": {}
 * }
 */
router.get("/", async (req, res) => {
  try {
    // Parse the query string
    // Only submit timestamps to the builder functions
    req.query.start = validateTime(req.query.start);
    req.query.end = validateTime(req.query.end);

    // Get filtered sleep data
    let sleepDataArray;
    const isAdmin = req.token.role > userPermissionLevel;
    if (isAdmin) {
      sleepDataArray = await find(req.query);
    } else {
      const user_id = req.token.id;
      sleepDataArray = await findBy({ user_id }, req.query);
    }
    // Format the data
    sleepDataArray = sleepDataArray.map(async sleepData => {
      const sleepToInsert = isIterable(sleepData) ? sleepData[0] : sleepData;
      const moodData = await moodDb.findBySleepId(sleepToInsert.id);
      return combineData(sleepToInsert, moodData);
    });
    const resolvedData = await Promise.all(sleepDataArray);
    res.status(200).json({
      message: "Success",
      validation: [],
      data: resolvedData,
    });
  } catch (err) {
    errDetail(res, err);
  }
});

/**
 * @api {get} /api/sleep/:id Get Sleep by Id
 * @apiGroup Sleep
 * @apiDescription Get Sleep By Id
 * @apiSuccess {Array} sleep An array with an object with the sleep information
 * @apiSuccessExample {json} Success Response:
 * HTTP/1.1 200: OK
 * {
 *    "message": "Success",
 *    "validation": [],
 *    "data": [
 *      {
 *          "id": 4,
 *          "sleep_start": 1586048400000,
 *          "sleep_end": 1586073600000,
 *          "sleep_goal": 9,
 *          "user_id": 3
 *      }
 *    ]
 * }
 * @apiErrorExample {json} Invalid Credentials:
 * {
 *  "message": "Invalid Credentials",
 *  "validation": [],
 *  "data": {}
 * }
 */

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user_id = req.token.id;
    const sleep = await findBy({ id, user_id });
    if (!sleep || !sleep.length) {
      return res.status(404).json({
        message: "No data found",
        validation: ["No sleep data with that id was found for that user"],
        data: {},
      });
    }
    // combine the sleep and mood data into a unified shape
    const sleepToInsert = isIterable(sleep) ? sleep[0] : sleep;
    const moodData = await moodDb.findBySleepId(sleepToInsert.id);
    const newSleep = await combineData(sleepToInsert, moodData);
    res.status(200).json({
      message: "Success",
      validation: [],
      data: newSleep,
    });
  } catch (err) {
    errDetail(res, err);
  }
});

/**
 * @api {post} /api/sleep Insert a sleep record
 * @apiGroup Sleep
 * @apiDescription Add a sleep record
 * @apiParam {Integer} sleep_start The start time for the sleep entry
 * @apiParam {Integer} sleep_end The end time for the sleep entry
 * @apiParam {Integer} user_id The user id of the person who slept
 * @apiParam {Integer} mood_waking The user's mood score on waking (1-4)
 * @apiParam {Integer} mood_day The user's mood score during the day (1-4)
 * @apiParam {Integer} mood_bedtime The user's mood score at bedtime (1-4)
 * @apiParamExample {json} Request Example:
 * {
 *  "sleep_start": 1588039200000,
 *  "sleep_end": 1588068000000,
 *  "sleep_goal": 6,
 *  "user_id": 3,
 *  "mood_waking": 4,
 *  "mood_day": 3,
 *  "mood_bedtime": 2
 * }
 * @apiSuccess {Array} sleep An array with the object with the information
 * @apiSuccessExample {json} Success Response:
 * HTTP/1.1 201: Created
 * {
 *   "message": "The sleep entry has been successfully added",
 *   "validation": [],
 *   "data": [
 *       {
 *           "id": 1,
 *           "sleep_start": 1588039200000,
 *           "sleep_end": 1588068000000,
 *           "sleep_goal": 6,
 *           "user_id": 3,
 *           "mood_waking": 4,
 *           "mood_day": 3,
 *           "mood_bedtime": 2
 *       }
 *   ]
 * }
 * @apiErrorExample {json} Invalid Credentials:
 * {
 *  "message": "Invalid Credentials",
 *  "validation": [],
 *  "data": {}
 * }
 * @apiErrorExample {json} Server Error (e.g. empty json sent):
 * {
 *  "message": "There was a problem completing the required operation",
 *  "validation": [],
 *  "data": {}
 * }
 */
router.post("/", async (req, res) => {
  try {
    const {
      sleep_start,
      sleep_end,
      sleep_goal,
      user_id,
      mood_waking,
      mood_day,
      mood_bedtime,
    } = req.body;
    // insert the sleep data
    const sleepData = { sleep_start, sleep_end, sleep_goal, user_id };
    const sleep = await insert(sleepData);
    const sleepInserted = isIterable(sleep) ? sleep[0] : sleep;
    // insert the mood data one by one
    const moodData = { mood_waking, mood_day, mood_bedtime };
    // @ts-ignore
    const sleepId = isIterable(sleep) ? sleep[0].id : sleep.id;
    await insertMoodData(sleepId, moodData);
    const moodDataInserted = await moodDb.findBySleepId(Number(sleepId));
    // combine the sleep and mood data into a unified shape
    const newSleep = await combineData(sleepInserted, moodDataInserted);
    res.status(201).json({
      message: "A new sleep entry has been created",
      validation: [],
      data: newSleep,
    });
  } catch (err) {
    errDetail(res, err);
  }
});

/**
 * @api {put} /api/sleep/:id Update a sleep record by id
 * @apiGroup Sleep
 * @apiDescription Update a sleep record by id
 * @apiParam {Object} property Any property on the sleep record
 * @apiParamExample {json} Request Example:
 * {
 *  "sleep_end": 1588068000000,
 * }
 * @apiSuccess {Array} sleep An array with the object with the updated information
 * @apiSuccessExample {json} Success Response:
 * HTTP/1.1 200: OK
 * {
 *   "message": "The sleep entry has been successfully updated",
 *   "validation": [],
 *   "data": [
 *       {
 *           "id": 1,
 *           "sleep_start": 1588039200000,
 *           "sleep_end": 1588068000000,
 *           "sleep_goal": 6,
 *           "user_id": 3,
 *           "mood_waking": 4,
 *           "mood_day": 3,
 *           "mood_bedtime": 2
 *       }
 *   ]
 * }
 * @apiErrorExample {json} Invalid Credentials:
 * {
 *  "message": "Invalid Credentials",
 *  "validation": [],
 *  "data": {}
 * }
 * @apiErrorExample {json} Server Error (e.g. empty update sent):
 * {
 *  "message": "There was a problem completing the required operation",
 *  "validation": [],
 *  "data": {}
 * }
 */
router.put("/:id", validateSleepId, async (req, res) => {
  try {
    const id = req.params.id;
    const {
      sleep_start,
      sleep_end,
      sleep_goal,
      user_id,
      mood_waking,
      mood_day,
      mood_bedtime,
    } = req.body;
    // insert the sleep data
    const sleepBody = { sleep_start, sleep_end, sleep_goal, user_id };
    const sleepData = getTruthyKeys(sleepBody);
    const sleep = await update(id, sleepData);
    // parse out undefineds and nulls from the mood data from req.body
    const moodBody = { mood_waking, mood_day, mood_bedtime };
    const moodData = getTruthyKeys(moodBody);
    // @ts-ignore
    const sleepId = isIterable(sleep) ? sleep[0].id : sleep.id;
    const moods = await moodDb.findBySleepId(sleepId);
    console.log("update>Moods currently in db:", moods);
    console.log("update>sleepId:", sleepId);
    console.log("update>moodData:", moodData);
    await updateMoodData(sleepId, moods, moodData);
    // combine the data together into a unified request shape
    const sleepToMerge = isIterable(sleep) ? sleep[0] : sleep;
    const moodToMerge = await moodDb.findBySleepId(sleepToMerge.id);
    console.log("Before update>combineData:", sleepToMerge, moodToMerge);
    const updatedSleep = await combineData(sleepToMerge, moodToMerge);
    res.status(200).json({
      message: `The sleep entry has been successfully updated`,
      validation: [],
      data: updatedSleep,
    });
  } catch (err) {
    errDetail(res, err);
  }
});

/**
 * @api {delete} /api/sleep/:id Delete a sleep record by id
 * @apiGroup Sleep
 * @apiDescription Delete a sleep record by id
 * @apiSuccess {Object} message The standard shape with a success message is sent back
 * @apiSuccessExample {json} Success Response:
 * HTTP/1.1 204: No Content
 * {
 *   "message": "The sleep entry with id 1 has been successfully deleted",
 *   "validation": [],
 *   "data": {}
 * }
 * @apiErrorExample {json} Invalid Credentials:
 * {
 *  "message": "Invalid Credentials",
 *  "validation": [],
 *  "data": {}
 * }
 * @apiErrorExample {json} Server Error (e.g. empty update sent):
 * {
 *  "message": "There was a problem completing the required operation",
 *  "validation": [],
 *  "data": {}
 * }
 */
router.delete("/:id", validateSleepId, async (req, res) => {
  try {
    const id = req.params.id;
    await remove(id);
    res.status(200).json({
      message: `The sleep entry with id ${id} has been successfully deleted`,
      validation: [],
      data: {},
    });
  } catch (err) {
    errDetail(res, err);
  }
});

// Middleware
/**
 * @function validateSleepId: Validate the the id exists before submitting req
 * @param {Object} req: The request object sent to the API
 * @param {Object} res: The response object sent from the API
 * @param {Object} next: The express middleware function to move to the next middleware
 * @returns: none
 */
async function validateSleepId(req, res, next) {
  try {
    const id = Number(req.params.id);
    const sleep = await findBy({ id });
    if (!sleep.length) {
      return res.status(404).json({
        message: "Not Found",
        validation: ["Sleep id could not be found for this user"],
        data: {},
      });
    }
    next();
  } catch (err) {
    errDetail(res, err);
  }
}

/**
 * @function combineData Returns an object with the requisite shape
 * @param {Object} sleepData An object containing the sleep data
 * @returns {Promise} A promise that resolves to an object with the added mood data
 */
async function combineData(sleepData, moodData) {
  // Fetch mood sleepData
  const mood_waking = moodData.find(obj => obj.order === 1);
  const mood_day = moodData.find(obj => obj.order === 2);
  const mood_bedtime = moodData.find(obj => obj.order === 3);
  console.log(
    "update>combineData moods found:",
    mood_waking,
    mood_day,
    mood_bedtime,
  );
  const obj = {
    id: sleepData.id,
    user_id: sleepData.user_id,
    sleep_start: sleepData.sleep_start,
    sleep_end: sleepData.sleep_end,
    start_formatted: moment(parseInt(sleepData.sleep_start)).format(
      "MM/DD/YYYY h:mm A",
    ),
    end_formatted: moment(parseInt(sleepData.sleep_end)).format(
      "MM/DD/YYYY h:mm A",
    ),
    sleep_goal: sleepData.sleep_goal,
    sleep_hours:
      (sleepData.sleep_end - sleepData.sleep_start) / millisecondsInOneHour,
    /* This allows for extensibility - we can have any many mood data points
       as we want this way, rather than restricting it to 3*/
    mood_waking: mood_waking && mood_waking.mood_score,
    mood_day: mood_day && mood_day.mood_score,
    mood_bedtime: mood_bedtime && mood_bedtime.mood_score,
  };
  return obj;
}

/**
 * @function insertMoodData Inserts a series of mood values as seperate records
 * @param {Object} moodData The object containing the data points to insert sequentially
 * @returns None
 */
async function insertMoodData(sleepId, moodData) {
  const moodEventOrder = { mood_waking: 1, mood_day: 2, mood_bedtime: 3 };
  const inserted = [];
  const keys = Object.keys(moodData);
  for (const key of keys) {
    const moodScore = moodData[key];
    if (moodScore) {
      const moodDataObj = {
        mood_score: moodScore,
        order: moodEventOrder[key],
        // @ts-ignore
        sleep_id: sleepId,
      };
      const mood = await moodDb.insert(moodDataObj);
      inserted.push(mood);
    }
  }
  return Promise.all(inserted);
}

/**
 * @function updateMoodData Inserts a series of mood values as seperate records
 * @param {Number} sleepId The id of the sleep record linked to the mood record
 * @param {Array} moods The existing mood records to modify
 * @param {Object} moodData The object containing the data points to insert sequentially
 * @returns None
 */
async function updateMoodData(sleepId, moods, moodData) {
  const moodEventOrder = { mood_waking: 1, mood_day: 2, mood_bedtime: 3 };
  const updated = [];
  const keys = Object.keys(moodData);
  for (const key of keys) {
    const moodScore = moodData[key];
    if (moodScore) {
      const moodOrder = moodEventOrder[key];
      const moodId = moods.find(mood => mood.order === moodOrder).id;
      const moodDataObj = {
        mood_score: moodScore,
        order: moodOrder,
        // @ts-ignore
        sleep_id: sleepId,
      };
      const update = await moodDb.update(moodId, moodDataObj);
      updated.push(update);
    }
  }
  return Promise.all(updated);
}

/**
 * @function getTruthyKeys Clean an object of keys -> falsey/null
 * @param {Object} obj The object to clean
 * @returns {Object} The object that has only keys with truthy values
 */
function getTruthyKeys(obj) {
  const cleanObj = {};
  Object.keys(obj).map(key => {
    const objVal = obj[key];
    if (objVal) {
      cleanObj[key] = objVal;
    }
  });
  return cleanObj;
}

module.exports = router;
