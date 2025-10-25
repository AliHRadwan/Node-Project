import express from "express";
import { uploadImage, uploadBook } from "../controllers/uploadController.js";
import verifyJWT from "../middleware/verifyJWT.js";
import roleCheck from "../middleware/roleCheck.js";

const router = express.Router();

router.post("/image", verifyJWT, roleCheck(["author"]), uploadImage);

router.post("/book", verifyJWT, roleCheck(["author"]), uploadBook);

export default router;