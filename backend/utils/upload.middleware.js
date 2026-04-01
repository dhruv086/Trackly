import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "./cloudinary.js";
import path from "path";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "trackly/avatars",
    allowedFormats: ["jpg", "png", "jpeg", "webp", "gif"],
    public_id: (req, file) => {
      // Use user ID and timestamp for uniqueness
      return `${req.user._id}-${Date.now()}`;
    },
  },
});

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
}).single("avatar");

