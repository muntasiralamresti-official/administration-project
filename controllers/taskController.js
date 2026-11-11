const taskSchema = require("../models/taskSchema");

const createTask = async (req, res) => {
  const { title, description, deadline, status, image, assignedPerson } =
    req.body;
  try {
    const loggedinUserId = req.user.id;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    if (title.length > 30) {
      return res.status(401).json({
        success: false,
        message: "Task title max length is 30",
      });
    }

    if (description && description.length > 500) {
      return res.status(401).json({
        success: false,
        message: "Task description max length is 500",
      });
    }

    const task = await taskSchema.create({
      title,
      description,
      deadline,
      status,
      image,
      assignedPerson,
      creator: loggedinUserId,
    });

    res.status(200).json({
      success: true,
      message: "Task created Successfully",
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Task created faild",
    });
  }
};

const getTask = async (req, res) => {
  try {
    let page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    if (page < 1) {
      page = 1;
    }

    const totalTasks = await taskSchema.countDocuments({});
    const totalPages = Math.ceil(totalTasks / limit);

    if (totalPages > 0 && page > totalPages) {
      page = totalPages;
    }

    const skip = (page - 1) * limit;

    const task = await taskSchema
      .find({})
      .populate("assignedPerson", "username email phone role profilePicture")
      .populate("creator", "username email role")
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: "task Get successfully",
      data: {
        tasks: task,
        length: task.length,
        totalTasks: totalTasks,
        currentPage: page,
        totalPages: totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSingleTask = async (req, res) => {
  const taskId = req.params.id;
  try {
    const task = await taskSchema
      .findOne({ _id: taskId })
      .populate("assignedPerson", "username email phone role profilePicture")
      .populate("creator", "username email role");

    res.status(200).json({
      success: true,
      message: "Single task get successfully",
      data: task,
    });
  } catch (error) {
    res.status(409).json({
      success: false,
      message: error.message,
      taskId: taskId,
    });
  }
};

module.exports = {
  createTask,
  getTask,
  getSingleTask,
};
