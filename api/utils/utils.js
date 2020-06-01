const moment = require("moment");

function errDetail(res, err) {
  console.log(err);
  return res.status(500).json({
    message: "There was a problem completing the required operation",
    validation: [],
    data: {},
  });
}

function sanitizeUser(user) {
  // Removes passwords from user objects
  user && delete user.password;
  return user;
}

function validateTime(time) {
  // Format the timestamp
  if (!time) {
    return undefined;
  }

  let formattedTime;
  if (isNaN(time)) {
    formattedTime = moment(time).format("x");
  } else {
    formattedTime = moment(time, "x").format("x");
  }
  return formattedTime;
}

const randRange = (lower, upper) =>
  Math.floor(Math.random() * (upper - lower + 1)) + lower;

const isIterable = obj => {
  if (!obj) {
    return false;
  }
  return typeof obj[Symbol.iterator] === "function";
};

module.exports = {
  errDetail,
  sanitizeUser,
  validateTime,
  randRange,
  isIterable,
};
