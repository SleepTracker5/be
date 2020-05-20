const express = require("express");
const router = express.Router({ mergeParams: true });

/**
 * @function validateUsername: Validate the the id exists before submitting req
 * @param {*} req: The request object sent to the API
 * @param {*} res: The response object sent from the API
 * @param {*} next: The express middleware function to move to the next middleware
 * @returns: none
 */
async function validateUsername(req, res, next) {
  try {
    const { username } = req.body;
    const user = await findBy({ username });
    if (!user) {
      return res.status(404).json({
        message: "Not Found",
        validation: ["There was a problem retrieving the username"],
        data: {},
      });
    }
    next();
  } catch (err) {
    errDetail(res, err);
  }
}

/**
 * @function validateUniqueUsername: Validate the the id doesn't exist
 * @param {*} req: The request object sent to the API
 * @param {*} res: The response object sent from the API
 * @param {*} next: The express middleware function to move to the next middleware
 * @returns: none
 */
async function validateUniqueUsername(req, res, next) {
  try {
    const { username } = req.body;
    const user = await findBy({ username });
    if (user) {
      return res.status(400).json({
        message: "Invalid Username",
        validation: ["Username is invalid"], // Don't indicate it already exists for security reasons
        data: {},
      });
    }
    next();
  } catch (err) {
    errDetail(res, err);
  }
}

function errDetail(res, err) {
  console.log(err);
  return res.status(500).json({
    message: "There was a problem completing the required operation",
    validation: [],
    data: {},
  });
}

module.exports = router;
