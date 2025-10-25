import { multerUploadImage, multerUploadBook } from "../config/multer.js";
import { winstonLogger } from "../config/logger.js";

export const uploadImage = async (req, res) => {
  multerUploadImage(req, res, (err) => {
    if (err) {
      winstonLogger.warn("Failed to upload image", err);
      return res.status(400).send(err.message);
    }

    res.send({ message: "File uploaded successfully", url: req.file.location });
  });
};

export const uploadBook = async (req, res) => {
  multerUploadBook(req, res, (err) => {
    if (err) {
      winstonLogger.warn("Failed to upload book", err);
      return res.status(400).send(err.message);
    }

    res.send({ message: "File uploaded successfully", url: req.file.location });
  });
};