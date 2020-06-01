const express = require("express");
const server = express();

// Third party package imports
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
// Route and error middleware
const authRoute = require("./routes/auth/auth-router");
const errorHandler = require("./middleware/error-middleware");

// Logging
const path = require("path");
const rfs = require("rotating-file-stream");
const morgan = require("morgan");
// Create a rotating file stream for external logging
const accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // rotate daily
  path: path.join(__dirname, "log"),
});

// Third party middleware
server.use(helmet());
server.use(express.json());
server.use(cookieParser());
server.use(cors());
server.use(morgan("combined", { stream: accessLogStream }));

// Routes
server.use("/api", authRoute);

// Error middleware
server.use(errorHandler);

/**
 * @api {*} /api Heroku
 * @apiGroup 0.1 Deployment
 * @apiDescription The API is deployed on the Heroku free tier. Please allow 5-10 seconds for Heroku to "wake up" the connection when using an endpoint for the first time that day.
 *
 * The url to the deployed server is: https://sleeptrackerbw.herokuapp.com/
 */

/**
 * @api {*} /api Response Shape
 * @apiGroup 0.2 Data Standarization
 * @apiDescription The API responses conform to a standard shape comprised of the following properties:
 * @apiParam {String} message A status message
 * @apiParam {Array} validation An array of validation errors
 * @apiParam {Object} data An object containing any data returned by the resource
 * @apiSuccessExample {json} Standard Response Shape
 * HTTP 1.1/*
 * {
 *  "message": "",
 *  "validation": [],
 *  "data": {}
 * }
 * @api {*} /api Tips for Accessing the Data Using Axios
 * @apiGroup 0.2 Data Standardization
 * @apiDescription Since axios returns data in an object that also has a `data` property, you should plan to access the data from the API requests by referencing `res.data.data`. If you would prefer to rename the `data` property of the object returned by axios, then using interceptors is probably the most expedient method to rename it from `data` to `body` (to mimic the shape returned by the fetch API)
 * @apiSuccessExample {json} Using Axios Interceptors to Reshape the Response
 * axios-interceptor-example.js
 * export const axiosWithAuth = () => {
 *  const instance = axios.create({
 *    baseURL: "http://localhost:5000/api",
 *    headers: {
 *      authorization: localStorage.getItem("token"),
 *    },
 *  });
 *  // Reshape the response to avoid res.data.data
 *  // Use the res.body shape, similar to the fetch API
 *  instance.interceptors.response.use((response) => {
 *    const body = { ...response.data };
 *    delete response.data; // remove the data property
 *    return { ...response, body };
 *  });
 *  return instance
 * };
 */

server.get("/", (req, res) => {
  return res.status(200).json({ message: "API up", validation: [], data: {} });
});

module.exports = server;
