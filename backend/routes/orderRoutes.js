import express from "express";
import { getUserOrders , getAllOrders, placeOrder } from "../controllers/orderController.js";// import functions from controller 
//import { protect } from "../middleware/authMiddleware.js";// import middelware auth
import { simpleCache, clearCacheOnWrite } from "../middleware/cache.js"; 

const router = express.Router();

// route to create order (no caching - always fresh)
router.post("/"/*, middelware */, clearCacheOnWrite(), placeOrder);

// route to get all orders for user (cache for 10 minutes)
router.get("/"/*, middelware  */, simpleCache(600), getUserOrders);

// route to get all orders to dashboard (cache for 5 minutes)
router.get("/all"/*, middelware  */, simpleCache(300), getAllOrders);

export default router ;