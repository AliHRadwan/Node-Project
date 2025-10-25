import express from "express";
import { getProfile, updateProfile ,deleteAccount } from "../controllers/profileController.js";
import verifyJWT from "../middleware/verifyJWT.js";
const router = express.Router();

router.get("/getprofile", verifyJWT, getProfile);
router.put("/updateprofile", verifyJWT, updateProfile);
router.delete("/deleteprofile", verifyJWT, deleteAccount);


export default router;