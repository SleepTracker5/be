const express = require("express");
const router = express.Router();

// Db helpers, utils
const { findBy, remove } = require("./mood-model");
const { errDetail, isIterable } = require("../../utils/utils");

// Routes
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
 * @param {Object} req: The request object sent to the API
 * @param {Object} res: The response object sent from the API
 * @param {Object} next: The express middleware function to move to the next middleware
 * @returns: none
 */
async function validateMoodId(req, res, next) {
  try {
    const id = Number(req.params.id);
    const moodData = await findBy({ id });
    const mood = isIterable(moodData) ? moodData[0] : moodData;
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
