const userModel = require("../models/userSchema");
const {
  hashToken,
  generateSecureToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../helpers/tokenHelper");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../helpers/emailHelper");

const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

async function registrationController(req, res) {
  try {
    const {
      username,
      email,
      password,
      profilePicture,
      address,
      phone,
      gender,
      dob,
      role,
    } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }
    if (username.length > 16) {
      return res.status(400).json({
        success: false,
        message: "Username cannot be more than 16 characters",
      });
    }
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    if (!emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const existingUser = await userModel.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }
    if (!gender) {
      return res.status(400).json({
        success: false,
        message: "Gender is required",
      });
    }

    const verificationToken = generateSecureToken();
    const expireTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = new userModel({
      username,
      email,
      password,
      profilePicture,
      address,
      phone,
      gender,
      dob,
      role,
      emailVerificationToken: hashToken(verificationToken),
      emailVerificationTokenExpires: expireTime,
    });

    await newUser.save();

    try {
      await sendVerificationEmail(
        newUser.email,
        newUser.username,
        verificationToken,
      );
    } catch (mailError) {
      await userModel.findByIdAndDelete(newUser._id);
      console.log("Email sending error:", mailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Registration successful! Please check your email to verify.",
      data: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong during registration",
    });
  }
}

async function loginController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter both email and password",
      });
    }

    const user = await userModel
      .findOne({ email: email })
      .select("+password +refreshToken");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    if (!user.status) {
      return res.status(403).json({
        success: false,
        message: "Your account is not approved by admin yet",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = hashToken(refreshToken);
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
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
        },
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
}

async function verifyEmailController(req, res) {
  try {
    const token = req.params.token;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is missing",
      });
    }

    const hashedToken = hashToken(token);
    const user = await userModel
      .findOne({
        emailVerificationToken: hashedToken,
        emailVerificationTokenExpires: { $gt: Date.now() },
      })
      .select("+emailVerificationToken +emailVerificationTokenExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Verification token is invalid or expired",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! Now you can login.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Email verification failed",
    });
  }
}

async function resendVerificationController(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await userModel
      .findOne({ email: email })
      .select("+emailVerificationToken +emailVerificationTokenExpires");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "This email is already verified",
      });
    }

    const verificationToken = generateSecureToken();
    user.emailVerificationToken = hashToken(verificationToken);
    user.emailVerificationTokenExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );
    await user.save({ validateBeforeSave: false });

    await sendVerificationEmail(user.email, user.username, verificationToken);

    return res.status(200).json({
      success: true,
      message: "Verification email sent again",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to resend verification email",
    });
  }
}

async function refreshTokenController(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const user = await userModel.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== hashToken(refreshToken)) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const newAccessToken = generateAccessToken(user);

    return res.status(200).json({
      success: true,
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Could not generate new access token",
    });
  }
}

async function logoutController(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      return res.status(200).json({
        success: true,
        message: "Logged out",
      });
    }

    const user = await userModel.findById(decoded.id).select("+refreshToken");
    if (user && user.refreshToken === hashToken(refreshToken)) {
      user.refreshToken = undefined;
      await user.save({ validateBeforeSave: false });
    }

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
}

async function forgotPasswordController(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await userModel
      .findOne({ email: email })
      .select("+passwordResetToken +passwordResetTokenExpires");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    const resetToken = generateSecureToken();
    user.passwordResetToken = hashToken(resetToken);
    user.passwordResetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    await sendPasswordResetEmail(user.email, resetToken);

    return res.status(200).json({
      success: true,
      message: "Password reset link has been sent to your email",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to send password reset email",
    });
  }
}

async function resetPasswordController(req, res) {
  try {
    const token = req.params.token;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
    }
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    const hashedToken = hashToken(token);
    const user = await userModel
      .findOne({
        passwordResetToken: hashedToken,
        passwordResetTokenExpires: { $gt: Date.now() },
      })
      .select("+passwordResetToken +passwordResetTokenExpires +refreshToken");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.refreshToken = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful! You can login now.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Password reset failed",
    });
  }
}

async function getMeController(req, res) {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        profilePicture: user.profilePicture,
        address: user.address,
        phone: user.phone,
        gender: user.gender,
        dob: user.dob,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to get profile info",
    });
  }
}

async function updateProfile(req, res) {
  try {
    let updateData = req.body;

    if (req.file) {
      updateData.profilePicture = req.file.path;
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  registrationController,
  loginController,
  verifyEmailController,
  resendVerificationController,
  refreshTokenController,
  logoutController,
  forgotPasswordController,
  resetPasswordController,
  getMeController,
  updateProfile,
};
