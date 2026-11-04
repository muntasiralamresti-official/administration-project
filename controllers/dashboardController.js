const userModel = require("../models/userSchema");

function formatUser(user){
  return{
    id: user._id,
    username: user.username,
    email: user.email,
    profilePicture: user.profilePicture,
    address: user.address,
    phone: user.phone,
    gender: user.gender,
    dob: user.dob,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }
}

const getAllUserController = async (req, res) => {
  try {
    const loggedinUserId = req.user.id
    const loggedinUser = await userModel.findById(loggedinUserId)
    const search = req.query.search ? req.query.search.trim() : ""
    const role = req.query.role ? req.query.role.trim().toLowerCase() : ""
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 5
    const skip = (page - 1) * limit

    const filter = {
      _id: {$ne: loggedinUserId}
    }

    if(role){
      filter.role = role
    }
    
    if(search){
      const searchRegex = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      filter.$or = [
        {username: {$regex: searchRegex, $options: "i"}},
        {email: {$regex: searchRegex, $options: "i"}},
        {role: {$regex: searchRegex, $options: "i"}}
      ]
    }

    const totalUsers = await userModel.countDocuments(filter)
    const totalPages = Math.ceil(totalUsers / limit)
    const users = await userModel.find(filter).skip(skip).limit(limit)

    
    res.status(200).json({
        success: true,
        message: "Users get successfully",
        data: {
          users: users.map(formatUser),
          length: users.length,
          totalUsers: totalUsers,
          currentPage: page,
          totalPages: totalPages
        },
        loggedinuser: loggedinUser
    })
  } catch (error) {
      res.send("catch error")
  }
};

const getSingleUserController = async (req, res) => {
  const userId = req.params.id
  try {

    const user = await userModel.findOne({
      _id: userId
    })
    res.status(200).json({
        success: true,
        message: "User get successfully",
        data: user,
    })
  } catch (error) {
      res.status(409).json({
        success: false,
        message: error.message,
        userId: userId
      })
  }
}

const approvedUserController = async (req, res) => {

  try {
    const updateUser = await userModel.findByIdAndUpdate(
      req.params.id,
      { status: true },
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "User approved Successfully.",
      data: updateUser,
    });
  } catch (error) {
    res.status(409).json({
        success: false,
        message: error.message,
      })
  }
}
const deactiveUserController = async (req, res) => {
  try {
    const updateUser = await userModel.findByIdAndUpdate(
      req.params.id,
      { status: false },
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "User deactive Successfully.",
      data: updateUser,
    });
  } catch (error) {
    res.status(409).json({
        success: false,
        message: error.message,
      })
  }
}
const deleteUserController = async (req, res) => {
  try {
    const deleteUser = await userModel.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "User delete Successfully.",
    });
  } catch (error) {
    res.status(409).json({
        success: false,
        message: error.message,
      })
  }
}

module.exports = {
    getAllUserController,
    getSingleUserController,
    approvedUserController,
    deleteUserController, 
    deactiveUserController
}