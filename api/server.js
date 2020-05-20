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

server.get("/", (req, res) => {
  return res.status(200).json({ message: "API up", validation: [], data: {} });
});

module.exports = server;
