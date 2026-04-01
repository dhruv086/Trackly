import { User } from "../models/user.model.js";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error("Something went wrong while generating tokens");
  }
};

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Username";
      return res.status(400).json({ message: `${field} is already taken` });
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    if (!user) {
      throw new Error("User creation failed");
    }

    const accessToken = user.generateAccessToken();

    // Simple response with user and token
    const userDoc = user.toObject();
    delete userDoc.password;

    return res.status(201).json({
      user: userDoc,
      accessToken,
      message: "Registration successful"
    });
  } catch (error) {
    console.error("REGISTER_ERROR:", error);
    return res.status(500).json({ message: error.message || "Internal server error during registration" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!username && !email) {
      return res.status(400).json({ message: "Email or username is required" });
    }

    const user = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (!user) {
      return res.status(401).json({ message: "User does not exist" });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid user credentials" });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const isProduction = process.env.NODE_ENV === 'production';
    const options = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'None' : 'Lax',
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        user: loggedInUser,
        accessToken,
        refreshToken,
        message: "User logged in successfully",
      });
  } catch (error) {
    console.error("LOGIN_ERROR:", error);
    return res.status(500).json({ message: error.message || "An internal server error occurred during login" });
  }
};

export const logoutUser = async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const isProduction = process.env.NODE_ENV === 'production';
  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'None' : 'Lax',
  };

  return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json({ message: "User logged out" });
};

export const getCurrentUser = async (req, res) => {
  return res.status(200).json({ user: req.user, message: "Current user fetched" });
};

export const updateAccountDetails = async (req, res) => {
  const { username, email, bio, location, jobTitle } = req.body;

  if (!username && !email) {
    return res.status(400).json({ message: "Username or email is required" });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        username,
        email,
        bio,
        location,
        jobTitle
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json({
    user,
    message: "Account details updated successfully",
  });
};

export const changeCurrentPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Old and new password are required" });
  }

  const user = await User.findById(req.user._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    return res.status(400).json({ message: "Invalid old password" });
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json({ message: "Password changed successfully" });
};

export const updateNotificationPreferences = async (req, res) => {
  const { preferences } = req.body;

  if (!preferences) {
    return res.status(400).json({ message: "Preferences are required" });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        notificationPreferences: preferences,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json({
    user,
    message: "Notification preferences updated successfully",
  });
};

export const uploadAvatarController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Cloudinary URL is returned in req.file.path
    const avatarUrl = req.file.path;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { avatar: avatarUrl } },
      { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json({ user, message: "Avatar uploaded successfully" });
  } catch (error) {
    console.error("AVATAR_UPLOAD_ERROR:", error);
    return res.status(500).json({ message: error.message || "Avatar upload failed" });
  }
};
