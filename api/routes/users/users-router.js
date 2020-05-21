const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Db helpers, utils
const { find, findBy } = require("./users-model");
const { errDetail, sanitizeUser } = require("../../utils/utils");

// Objects
const authError = {
  message: "Invalid credentials",
  validation: [],
  data: {},
};

/**
 * @api {get} /api/users Get All Users
 * @apiGroup Users
 * @apiDescription Get All Users
 * @apiSuccess users An array of user objects
 * @apiSuccessExample {json} Success Response:
 * HTTP/1.1 200: OK
 * {
 *   "message": "Success",
 *   "validation": [],
 *   "data": [
 *       {
 *           "id": 1,
 *           "username": "test1",
 *           "role": 1,
 *           "first_name": "Test",
 *           "last_name": "User 1",
 *           "email": "test@testing.com"
 *       },
 *       {
 *           "id": 2,
 *           "username": "test2",
 *           "role": 1,
 *           "first_name": "Test",
 *           "last_name": "User 2",
 *           "email": "test@testing.com"
 *       },
 *       {
 *           "id": 3,
 *           "username": "test3",
 *           "role": 1,
 *           "first_name": "Test",
 *           "last_name": "User 3",
 *           "email": "test@testing.com"
 *       }
 *   ]
 *}
 * @apiErrorExample {json} Invalid Credentials:
 * {
 *  "message": "Invalid Credentials",
 *  "validation": [],
 *  "data": {}
 * }
 */
router.get("/", decodeJWT, async (req, res) => {
  try {
    const users = await find();
    res.status(200).json({
      message: "Success",
      validation: [],
      data: users,
    });
  } catch (err) {
    errDetail(res, err);
  }
});

/**
 * @api {get} /api/users/:id Get a User by Id
 * @apiGroup Users
 * @apiDescription Get a User by Id
 * @apiSuccess user An object with the user information
 * @apiSuccessExample {json} Success Response:
 * HTTP/1.1 200: OK
 * {
 *   "message": "Success",
 *   "validation": [],
 *   "data": {
 *            "id": 1,
 *            "username": "test1",
 *            "role": 1,
 *            "first_name": "Test",
 *            "last_name": "User 1",
 *            "email": "test@testing.com"
 *    }
 * }
 * @apiErrorExample {json} Invalid Credentials:
 * {
 *  "message": "Invalid Credentials",
 *  "validation": [],
 *  "data": {}
 * }
 */
router.get("/:id", validateUserId, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user = await findBy({ id });
    res.status(200).json({
      message: "Success",
      validation: [],
      data: sanitizeUser(user),
    });
  } catch (err) {
    errDetail(res, err);
  }
});

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
