const express = require("express");
const router = express.Router();
const moment = require("moment");

// Db helpers, utils
const { find, findBy, update, remove } = require("./sleep-model");
const { errDetail, validateTime } = require("../../utils/utils");

// Constants
const userPermissionLevel = 1;
const millisecondsInOneHour = 1000 * 60 * 60;

// Routes
router.get("/", async (req, res) => {
  try {
    // Parse the query string
    // Only submit timestamps to the builder functions
    req.query.start = validateTime(req.query.start);
    req.query.end = validateTime(req.query.end);

    // Get filtered sleep data
    let sleepData;
    const isAdmin = req.token.role > userPermissionLevel;
    if (isAdmin) {
      sleepData = await find(req.query);
    } else {
      const user_id = req.token.id;
      sleepData = await findBy({ user_id }, req.query);
    }
    // Format the timestamps
    sleepData = sleepData.map(data => {
      return {
        id: data.id,
        sleep_start: data.sleep_start,
        sleep_end: data.sleep_end,
        start_formatted: moment(data.sleep_start).format("MM/DD/YYYY HH:MM"),
        end_formatted: moment(data.sleep_end).format("MM/DD/YYYY HH:MM"),
        sleep_hours:
          (data.sleep_end - data.sleep_start) / millisecondsInOneHour,
      };
    });
    res.status(200).json({
      message: "Success",
      validation: [],
      data: sleepData,
    });
  } catch (err) {
    errDetail(res, err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user_id = req.token.id;
    const sleep = await findBy({ id, user_id });
    res.status(200).json({
      message: "Success",
      validation: [],
      data: sleep,
    });
  } catch (err) {
    errDetail(res, err);
  }
});

router.put("/:id", validateSleepId, async (req, res) => {
  try {
    const id = req.params.id;
    const updatedSleep = await update(id, req.body);
    res.status(200).json({
      message: `The sleep entry has been successfully updated`,
      validation: [],
      data: updatedSleep,
    });
  } catch (err) {
    errDetail(res, err);
  }
});

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
 * @param {*} req: The request object sent to the API
 * @param {*} res: The response object sent from the API
 * @param {*} next: The express middleware function to move to the next middleware
 * @returns: none
 */
async function validateSleepId(req, res, next) {
  try {
    const id = Number(req.params.id);
    const sleep = await findBy({ id });
    if (!sleep) {
      return res.status(404).json({
        message: "Not Found",
        validation: ["Sleep id doesn't exist"],
        data: {},
      });
    }
    next();
  } catch (err) {
    errDetail(res, err);
  }
}

module.exports = router;
