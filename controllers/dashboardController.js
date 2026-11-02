const userModel = require("../models/userSchema");

async function getAllUserController(req, res) {
  try {
    const loggedinUserId = req.user.id;
    const loggedinUser = await userModel.findById(loggedinUserId);

    const users = await userModel.find({
      _id: { $ne: loggedinUserId },
    });

    const userList = [];
    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      userList.push({
        id: u._id,
        username: u.username,
        email: u.email,
        profilePicture: u.profilePicture,
        address: u.address,
        phone: u.phone,
        gender: u.gender,
        dob: u.dob,
        role: u.role,
        status: u.status,
        isEmailVerified: u.isEmailVerified,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      });
    }

    res.status(200).json({
      success: true,
      message: "All users fetched successfully",
      data: {
        users: userList,
        length: userList.length,
      },
      loggedinuser: loggedinUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getSingleUserController(req, res) {
  const userId = req.params.id;
  try {
    const user = await userModel.findOne({ _id: userId });

    res.status(200).json({
      success: true,
      message: "Single user fetched successfully",
      data: user,
    });
  } catch (error) {
    res.status(409).json({
      success: false,
      message: error.message,
      userId: userId,
    });
  }
}

async function approvedUserController(req, res) {
  try {
    const updateUser = await userModel.findByIdAndUpdate(
      req.params.id,
      { status: true },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "User approved successfully",
      data: updateUser,
    });
  } catch (error) {
    res.status(409).json({
      success: false,
      message: error.message,
    });
  }
}

async function deactiveUserController(req, res) {
  try {
    const updateUser = await userModel.findByIdAndUpdate(
      req.params.id,
      { status: false },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "User deactivated successfully",
      data: updateUser,
    });
  } catch (error) {
    res.status(409).json({
      success: false,
      message: error.message,
    });
  }
}

async function deleteUserController(req, res) {
  try {
    await userModel.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(409).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  getAllUserController,
  getSingleUserController,
  approvedUserController,
  deleteUserController,
  deactiveUserController,
};
