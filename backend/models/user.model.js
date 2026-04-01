import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    jobTitle: {
      type: String,
      default: "",
    },
    notificationPreferences: {
      assignments: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      statusChanges: { type: Boolean, default: true },
      invites: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true },
    },
    role: {
      type: String,
      default: "Member",
    },
    aiEvaluation: {
      productivityScore: { type: Number, default: 0 },
      workStyle: { type: String, default: "" },
      incrementImpact: { type: String, default: "" },
      summary: { type: String, default: "" },
      lastEvaluatedAt: { type: Date, default: null },
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "10d",
    }
  );
};

export const User = mongoose.model("User", userSchema);
