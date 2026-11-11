const express = require("express");
const router = express.Router();
const { protect, requiedAdmin } = require("../../middleware/authMiddleware");
const taskController = require("../../controllers/taskController");

router.use(protect);
router.post("/create", requiedAdmin, taskController.createTask);
router.get("/alltask", requiedAdmin, taskController.getTask);
router.get("/single-task/:id", requiedAdmin, taskController.getSingleTask);

module.exports = router;
