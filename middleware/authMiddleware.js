const { verifyAccessToken } = require("../helpers/tokenHelper");
const userModel = require("../models/userSchema");

async function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Please login first.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

function requiedAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Only admin can access this route",
    });
  }
  next();
}

function requiedEmployee(req, res, next) {
  if (req.user.role !== "employee") {
    return res.status(403).json({
      success: false,
      message: "Only employee can access this route",
    });
  }
  next();
}

function requiedUser(req, res, next) {
  if (req.user.role !== "user") {
    return res.status(403).json({
      success: false,
      message: "Only user can access this route",
    });
  }
  next();
}

function isEmailVerified(req, res, next) {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: "Please verify your email first",
    });
  }
  next();
}

module.exports = {
  protect,
  requiedAdmin,
  requiedEmployee,
  requiedUser,
  isEmailVerified,
};
