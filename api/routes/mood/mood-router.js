const express = require("express");
const router = express.Router();

// Db helpers, utils
const { find, findBy, insert, update, remove } = require("./mood-model");
const { errDetail } = require("../../utils/utils");

// Constants
const userPermissionLevel = 1;

// Routes
router.get("/", async (req, res) => {
  try {
    // Get filtered mood data
    let moodData;
    const isAdmin = req.token.role > userPermissionLevel;
    if (isAdmin) {
      moodData = await find();
    } else {
      const user_id = req.token.id;
      moodData = await findBy({ user_id });
    }
    res.status(200).json({
      message: "Success",
      validation: [],
      data: moodData,
    });
  } catch (err) {
    errDetail(res, err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user_id = req.token.id;
    const mood = await findBy({ id, user_id });
    res.status(200).json({
      message: "Success",
      validation: [],
      data: mood,
    });
  } catch (err) {
    errDetail(res, err);
  }
});

router.post("/", async (req, res) => {
  try {
    const mood = await insert(req.body);
    res.status(200).json({
      message: "Success",
      validation: [],
      data: mood,
    });
  } catch (err) {
    errDetail(res, err);
  }
});

router.put("/:id", validateMoodId, async (req, res) => {
  try {
    const id = req.params.id;
    const updatedMood = await update(id, req.body);
    res.status(200).json({
      message: `The mood entry has been successfully updated`,
      validation: [],
      data: updatedMood,
    });
  } catch (err) {
    errDetail(res, err);
  }
});

router.delete("/:id", validateMoodId, async (req, res) => {
  try {
    const id = req.params.id;
    await remove(id);
    res.status(200).json({
      message: `The mood entry with id ${id} has been successfully deleted`,
      validation: [],
      data: {},
    });
  } catch (err) {
    errDetail(res, err);
  }
});

// Middleware
/**
 * @function validateMoodId: Validate the the id exists before submitting req
 * @param {*} req: The request object sent to the API
 * @param {*} res: The response object sent from the API
 * @param {*} next: The express middleware function to move to the next middleware
 * @returns: none
 */
async function validateMoodId(req, res, next) {
  try {
    const id = Number(req.params.id);
    const mood = await findBy({ id });
    if (!mood) {
      return res.status(404).json({
        message: "Not Found",
        validation: ["Mood id doesn't exist"],
        data: {},
      });
    }
    next();
  } catch (err) {
    errDetail(res, err);
  }
}

module.exports = router;
