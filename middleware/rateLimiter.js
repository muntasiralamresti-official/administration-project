const { rateLimit } = require("express-rate-limit");

const loginlimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 30,
  skipSuccessfulRequests: true,
  message: { error: "Too many login attempts, please try again after 5 minutes." },
});

const registrationlimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 30,
  skipSuccessfulRequests: true,
  message: { error: "Too many registration attempts, please try again later." },
});

module.exports = {
  loginlimiter,
  registrationlimiter,
};
