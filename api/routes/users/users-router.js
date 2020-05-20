const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Db helpers, utils
const { findBy } = require("./users-model");
const { errDetail } = require("../../utils/utils");

// Middleware
/**
 * @function validateUserId: Validate the the id exists before submitting req
 * @param {*} req: The request object sent to the API
 * @param {*} res: The response object sent from the API
 * @param {*} next: The express middleware function to move to the next middleware
 * @returns: none
 */
async function validateUserId(req, res, next) {
  try {
    const id = Number(req.params.id);
    const user = await findBy({ id });
    if (!user) {
      return res.status(404).json({
        message: "Not Found",
        validation: ["User id doesn't exist"],
        data: {},
      });
    }
    next();
  } catch (err) {
    errDetail(res, err);
  }
}

// Helpers
async function decodeJWT(req, res, next) {
  const { token } = req.headers.authorization || req.cookies;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json(authError);
    }
    req.token = decoded;
    next();
  });
}
module.exports = router;
