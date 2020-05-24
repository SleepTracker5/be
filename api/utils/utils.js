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

// Helpers
const randRange = (lower, upper) =>
  Math.floor(Math.random() * (upper - lower + 1)) + lower;

module.exports = { errDetail, sanitizeUser, randRange };
