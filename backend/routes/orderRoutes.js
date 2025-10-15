import express from "express";
import { getUserOrders , getAllOrders, placeOrder } from "../controllers/orderController.js";// import functions from controller 
import verifyJWT from "../middleware/verifyJWT.js";// import middelware auth 

const router = express.Router();

// route to create order
router.post("/",verifyJWT, placeOrder);

// route to get all orders  for user
router.get("/", verifyJWT, getUserOrders);

// route to get all orders to dashboard
router.get("/all", verifyJWT, getAllOrders);

export default router ;
