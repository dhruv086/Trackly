import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    filename:     { type: String, required: true },       // stored name on disk
    originalName: { type: String, required: true },       // user-facing name
    mimetype:           { type: String, required: true },
    size:               { type: Number, required: true },       // bytes
    url:                { type: String, required: true },       // Cloudinary URL
    cloudinaryPublicId: { type: String, required: true },       // Used to delete from Cloudinary

    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // One of these two will be set
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    task:    { type: mongoose.Schema.Types.ObjectId, ref: "Task",    default: null },

    // Tracks who has opened/viewed this file
    viewedBy: [
      {
        user:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const Attachment = mongoose.model("Attachment", attachmentSchema);
