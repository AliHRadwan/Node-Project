import Order from "../models/Order.js";
//import Order from "../models/Order.js";
import mongoose from "mongoose";

// get all orders for a user 
export const getUserOrders = async (req, res) => {
    try {
        //const userId = req.user.id; 
        //const userId = req.user._id;

        const userId = req.user?._id || req.query.userId;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "❌ invalid or missing userId" });
        }

        console.log("🟢 Searching for userId:", userId);

        // const orders = await Order.find().sort({ placedAt: -1 });

        const orders = await Order.find({
            userId: new mongoose.Types.ObjectId(userId),
        }).sort({ placedAt: -1 });

        res.status(200).json({
            message: "✅ done, all orders here for the user",
            orders,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "❌ An error occurred while displaying the orders",
        });
    }
};

//get all orders 
export const getAllOrders = async (req, res) => {
    try {
        const allOrders = await Order.find().sort({ placedAt: -1 });
       // const allOrders = await Order.find({}, "userId status amounts.grandTotal placedAt").sort({ placedAt: -1 });


        res.status(200).json({
            message: "✅ done, all orders here",
            allOrders,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "❌ An error occurred while displaying the orders",
        });
    }
};
