const express = require("express");
const router = express.Router();
const { protect, requiedAdmin } = require("../../middleware/authMiddleware");
const dashboardController = require("../../controllers/dashboardController")

router.use(protect)
router.get("/allusers", requiedAdmin, dashboardController.getAllUserController);
router.get("/single-user/:id", requiedAdmin, dashboardController.getSingleUserController);
router.patch("/approved-user/:id", requiedAdmin, dashboardController.approvedUserController);
router.patch("/deactive-user/:id", requiedAdmin, dashboardController.deactiveUserController);
router.delete("/delete-user/:id", requiedAdmin, dashboardController.deleteUserController);

module.exports = router