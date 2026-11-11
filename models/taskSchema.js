const mongoose = require("mongoose");
const { Schema } = mongoose;

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    deadline: {
      type: String,
    },
    status: {
      type: String,
      enum: ["todo", "pending", "done", "archives"],
      default: "todo",
    },
    image: {
      type: String,
      default: null,
    },
    assignedPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true }
);

const taskModel = mongoose.model("tasks", taskSchema);

module.exports = taskModel;
