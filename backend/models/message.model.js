import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // One of these is set
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    task:    { type: mongoose.Schema.Types.ObjectId, ref: "Task",    default: null },

    text:       { type: String, default: "" },
    attachment: { type: mongoose.Schema.Types.ObjectId, ref: "Attachment", default: null },

    // Soft-delete
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
