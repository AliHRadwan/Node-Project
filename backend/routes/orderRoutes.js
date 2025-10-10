import express from "express";
import { getUserOrders , getAllOrders } from "../controllers/orderController.js";// import functions from controller 
//import { protect } from "../middleware/authMiddleware.js";// import middelware auth 

const router = express.Router();

// route to new order
//router.post("/"/*, middelware , controller function */);

// route to get all orders  for user
router.get("/"/*, middelware  */,getUserOrders);

// route to get all orders to dashboard
router.get("/all"/*, middelware  */,getAllOrders);

export default router ;
