import Order from "../models/Order.js";
//import Book from "../models/Book.js";
import mongoose from "mongoose";

//create an order  
export const placeOrder = async (req, res) => {
    try {
        const userId = req.user?._id || req.query.userId;
        const { items, shippingAddress, payment } = req.body;

        //Validate request data
        if (!items || items.length === 0) {
            return res.status(400).json({ message: "❌ No items found in the order." });
        }

        let itemsTotal = 0;
        const orderItems = [];

        //Calculate total and update book stock
        for (const item of items) {
            const book = await Book.findById(item.bookId);
            if (!book) {
                return res.status(404).json({ message: `❌ Book with ID ${item.bookId} not found.` });
            }

            if (book.stock < item.qty) {
                return res.status(400).json({ message: `❌ Not enough stock for book: ${book.title}` });
            }

            const itemTotal = book.price * item.qty;
            itemsTotal += itemTotal;

            // Deduct the quantity from stock and save the book
            //book.stock -= item.qty;

            await book.save();

            orderItems.push({
                bookId: book._id,
                titleSnapshot: book.title,
                price: book.price,
                qty: item.qty,
            });
        }

        // Dynamic shipping cost
        let shippingCost = 30; // Default
        if (shippingAddress?.city && shippingAddress.city.toLowerCase() !== "cairo") {
            shippingCost = 50; // Other cities cost more
        }
        if (itemsTotal > 500) {
            shippingCost = 0; // Free shipping for large orders
        }

        // Dynamic discount
        let discount = 0;
        if (payment?.couponCode === "BOOK10") {
            discount = itemsTotal * 0.1; // 10% off
        }

        const totalQty = items.reduce((sum, i) => sum + i.qty, 0);
        if (totalQty >= 5) {
            discount += 20; // Extra 20 off for bulk orders
        }

        // Final total
        const grandTotal = itemsTotal + shippingCost - discount;

        // Create the order
        const newOrder = new Order({
            userId,
            items: orderItems,
            shippingAddress,
            payment,
            amounts: {
                itemsTotal,
                shipping: shippingCost,
                discount,
                grandTotal,
            },
            placedAt: new Date(),
            status: "pending",
        });

        // Save to database
        await newOrder.save();

        // Return response
        res.status(201).json({
            message: "✅ Order placed successfully",
            order: newOrder,
        });

    } catch (err) {
        console.error("❌ Error placing order:", err);
        res.status(500).json({ message: "❌ An error occurred while placing the order." });
    }
}



//test without book model 

// export const placeOrder = async (req, res) => {
//   try {
//     const userId = req.user?._id || req.body.userId;
//     const { items, shippingAddress, payment } = req.body;

//     if (!userId) {
//       return res.status(400).json({ message: "❌ userId is required" });
//     }

//     if (!items || items.length === 0) {
//       return res.status(400).json({ message: "❌ No items found in the order." });
//     }

//     let itemsTotal = 0;
//     const orderItems = [];

//     for (const item of items) {
//       // 🔹 تأكد أن القيم كلها صحيحة
//       const bookId = mongoose.Types.ObjectId.isValid(item.bookId)
//         ? new mongoose.Types.ObjectId(item.bookId)
//         : new mongoose.Types.ObjectId();

//       const price = Number(item.price);
//       const qty = Number(item.qty);

//       if (isNaN(price) || isNaN(qty)) {
//         return res.status(400).json({ message: "❌ price and qty must be numbers." });
//       }

//       const itemTotal = price * qty;
//       itemsTotal += itemTotal;

//       orderItems.push({
//         bookId,
//         titleSnapshot: item.titleSnapshot || "Sample Book",
//         price,
//         qty,
//       });
//     }

//     let shippingCost = 30;
//     if (shippingAddress?.city && shippingAddress.city.toLowerCase() !== "cairo") {
//       shippingCost = 50;
//     }
//     if (itemsTotal > 500) shippingCost = 0;

//     let discount = 0;
//     if (payment?.couponCode === "BOOK10") discount = itemsTotal * 0.1;

//     const totalQty = items.reduce((sum, i) => sum + i.qty, 0);
//     if (totalQty >= 5) discount += 20;

//     const grandTotal = itemsTotal + shippingCost - discount;

//     const newOrder = new Order({
//       userId: new mongoose.Types.ObjectId(userId),
//       items: orderItems,
//       shippingAddress,
//       payment,
//       amounts: { itemsTotal, shipping: shippingCost, discount, grandTotal },
//       placedAt: new Date(),
//       status: "pending",
//     });

//     await newOrder.save();

//     res.status(201).json({
//       message: "✅ Order placed successfully",
//       order: newOrder,
//     });

//   } catch (err) {
//     console.error("❌ Error placing order:", JSON.stringify(err, null, 2));
//     res.status(500).json({
//       message: "❌ Error placing order",
//       error: err.message,
//       details: err.errInfo
//     });
//   }
// };


//==========================================================================================================

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

//==========================================================================================================

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
