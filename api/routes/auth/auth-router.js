const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router({ mergeParams: true });

// Subroutes
const { restrict } = require("../../middleware/restricted-middleware");
const userRoute = require("../users/users-router");
router.use("/users", restrict(), userRoute);

// Db helper fns
const { findBy, insert } = require("../users/users-model");

// Constants
const authError = {
  message: "Invalid Credentials",
  validation: [],
  data: {},
};
/**
 * @api {post} /api/register Registers a new user
 * @apiGroup Auth
 * @apiDescription Registers a New User
 * @apiParam {String} username The username for the new user
 * @apiParam {String} password The password for the new user
 * @apiParam {Integer} role The role for the new user
 * @apiParam {String} [first_name] The first name for the new user
 * @apiParam {String} [last_name] The last name for the new user
 * @apiParam {String} [email] The email for the new user
 * @apiParamExample {json} Request Example:
 * {
 *  "username": "david1234",
 *  "password": "1234",
 *  "role": 1,
 *  "first_name": "David",
 *  "last_name": "White"
 * }
 * @apiSuccess {Object} user The object containing the new user data
 * @apiSuccessExample {json} Success Response:
 * HTTP/1.1 201: Created
 * {
 *  "message": "Registered david1234 successfully",
 *  "validation": [],
 *  "data": {
 *    "user": {
 *      "id": 3,
 *      "username": "david1234",
 *      "role": 1,
 *      "first_name": "David",
 *      "last_name": "White",
 *      "email": null
 *    }
 * }
 * @apiErrorExample {json} Invalid Username:
 * HTTP/1.1 400: Bad Request
 * {
 *  "message": "Invalid Username",
 *  "validation": [
 *    "Username is invalid"
 *  ],
 *  "data": {}
 * }
 */
router.post("/register", validateUniqueUsername, async (req, res) => {
  try {
    const user = req.body;
    const hash = bcrypt.hashSync(req.body.password, Number(process.env.HASHES));
    user.password = hash;
    const newUser = await insert(user);
    res.status(201).json({
      message: `Registered ${newUser.username} successfully`,
      validation: [],
      data: { user: newUser },
    });
  } catch (err) {
    errDetail(res, err);
  }
});

/**
 * @api {post} /api/login Login a User
 * @apiGroup Auth
 * @apiDescription Logs In a User
 * @apiParam {String} username The username for the new user
 * @apiParam {String} password The password for the new user
 * @apiParamExample {json} Request Example:
 * {
 *  "username": "david1234",
 *  "password": "1234"
 * }
 * @apiSuccess {Object} user The user object and the token
 * @apiSuccessExample {json} Success Response:
 * HTTP/1.1 200: Success
 * {
 *  "message": "Welcome, david1234!",
 *  "validation": [],
 *  "data": {
 *    "user": {
 *      "id": 3,
 *      "username": "david1234",
 *      "role": 1,
 *      "first_name": "David",
 *      "last_name": "White",
 *      "email": null
 *    },
 *    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey..."
 *  }
 * @apiErrorExample {json} Invalid Credentials:
 * {
 *  "message": "Invalid Credentials",
 *  "validation": [],
 *  "data": {}
 * }
 * @apiErrorExample {json} Username Not Found:
 * {
 *  "message": "Invalid Username",
 *  "validation": [
 *    "There was a problem retrieving the username"
 *   ],
 *  "data": {}
 * }
 */
router.post("/login", validateUsername, async (req, res) => {
  try {
    // Retrieve the user from the dbase
    const { username, password } = req.body;
    const user = await findBy({ username });

    if (!user) {
      return res.status(401).json(authError);
    }

    // Auth in
    const authenticated = bcrypt.compareSync(password, user.password);
    if (!authenticated) {
      res.status(401).json(authError);
    }
    delete user.password; // This is no longer needed

    // Create the JWT token
    const data = {
      id: user.id,
      role: user.role,
    };
    const token = jwt.sign(data, process.env.JWT_SECRET, {
      expiresIn: "120m",
    });
    res.cookie("token", token);

    // Send the data back, including the token
    res.status(200).json({
      message: `Welcome, ${user.username}!`,
      validation: [],
      data: {
        user,
        token,
      },
    });
  } catch (err) {
    errDetail(res, err);
  }
});

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
      return res.status(400).json({
        message: "Invalid Username",
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
