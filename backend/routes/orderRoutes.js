import express from "express";
import { getUserOrders , getAllOrders, placeOrder } from "../controllers/orderController.js";// import functions from controller 
//import { protect } from "../middleware/authMiddleware.js";// import middelware auth 

const router = express.Router();

// route to create order
router.post("/"/*, middelware */, placeOrder);

// route to get all orders  for user
router.get("/"/*, middelware  */,getUserOrders);

// route to get all orders to dashboard
router.get("/all"/*, middelware  */,getAllOrders);

export default router ;