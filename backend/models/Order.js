import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",//reference User model 
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
            default: "pending",
        },
        items: [
            {
                _id: false, // ⛔ ده أهم سطر
                bookId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Book",//reference Book model 
                    required: true,
                },
                titleSnapshot: String,
                price: { type: Number, min: 0, required: true },
                qty: { type: Number, min: 1, required: true },
            },
        ],
        shippingAddress: {
            label: String,
            fullName: String,
            phone: String,
            line1: String,
            line2: String,
            city: String,
            state: String,
            country: String,
            postalCode: String,
        },
        payment: {
            method: String, // cash - visa - paypal - etc
            status: String, // unpaid - paid - failed
            txId: String,   // transaction id  
        },
        amounts: {
            itemsTotal: { type: Number, min: 0, default: 0 },
            shipping: { type: Number, min: 0, default: 0 },
            discount: { type: Number, min: 0, default: 0 },
            grandTotal: { type: Number, min: 0, default: 0 },
        },
        placedAt: { type: Date, default: Date.now },
    },
);

const Order = mongoose.model("Order", orderSchema);
export default Order;