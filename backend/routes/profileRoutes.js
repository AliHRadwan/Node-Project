import express from "express";
import { getProfile, updateProfile ,deleteAccount } from "../controllers/profileController.js";
import verifyJWT from "../middleware/verifyJWT.js";
import {getUserOrders} from "../controllers/orderController.js";
import {getCartAuth } from "../controllers/cart.controller.js";
const router = express.Router();

router.get("/getprofile", verifyJWT, getProfile);
router.put("/updateprofile", verifyJWT, updateProfile);
router.delete("/deleteprofile", verifyJWT, deleteAccount);
router.get("/getuserorders", verifyJWT, getUserOrders);
router.get("/getusercart", verifyJWT, getCartAuth);


export default router;