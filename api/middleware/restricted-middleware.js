const jwt = require("jsonwebtoken");
const { errDetail } = require("../utils/utils");

// Constants
const authError = {
  message: "Invalid credentials",
  validation: [],
  data: {},
};
const adminSecurityLevel = 2;

async function decodeJWT(req, res, next) {
  // Objects
  const authError = {
    message: "Invalid credentials",
    validation: [],
    data: {},
  };
  const { token } = req.headers.authorization || req.cookies;

  // Verify the JWT
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json(authError);
    }
    req.token = decoded;
    next();
  });
}

function restrict() {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization || req.cookies.token;
      if (!token) {
        return res.status(401).json(authError);
      }

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).json(authError);
        }
        req.token = decoded;
        next();
      });
    } catch (err) {
      errDetail(res, err);
    }
  };
}

// Admin role permissions
function restrictByRole() {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization || req.cookies.token;
      if (!token) {
        return res.status(401).json(authError);
      }

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err || decoded.role < adminSecurityLevel) {
          return res.status(401).json(authError);
        }
        req.token = decoded;
        next();
      });
    } catch (err) {
      errDetail(res, err);
    }
  };
}

module.exports = { restrict, restrictByRole, decodeJWT };
