import express from "express";
import { getUserOrders , getAllOrders, placeOrder , cancelOrderByAdmin , cancelOrderByUser} from "../controllers/orderController.js";// import functions from controller 
import verifyJWT from "../middleware/verifyJWT.js";// import middelware auth 

const router = express.Router();

const requireAdmin = (req, res, next) => {
  if (req.user?.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Admins only" });
};

// route to create order
router.post("/",verifyJWT, placeOrder);

// route to get all orders  for user
router.get("/", verifyJWT, getUserOrders);

router.post("/:orderId/cancel", verifyJWT, cancelOrderByUser);


// ----------dashboard admin routes-----------------------

// route to get all orders to dashboard
router.get("/admin", verifyJWT, getAllOrders);
// cancel order by admin
router.post("/admin/:orderId/cancel", verifyJWT, requireAdmin ,cancelOrderByAdmin); 


export default router ;