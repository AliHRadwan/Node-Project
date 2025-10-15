import Order from "../models/Order.js";
import Cart from "../models/cart.model.js";
import mongoose from "mongoose";

//create an order 
    // ✅ 1. Validate data (cart, items, etc.)
    // ✅ 2. Calculate totals (itemsTotal, shippingCost, discount)
    // ⬇️ 3. هنا هييجي مكان الـ payment handling 

export const placeOrder = async (req, res) => {
  try {
    
    // from auth middleware
    const userId = req.user._id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "❌ Invalid or missing userId" });
    }
    
    // shipping address from body or default from user 
    let shippingAddress = req.body.shippingAddress;
    if (!shippingAddress) {
      shippingAddress =
        req.user.addresses?.find((a) => a.isDefault) || req.user.addresses?.[0];
    }
    if (!shippingAddress) {
      return res.status(400).json({
        message: "❌ No shipping address found. Please add one in your profile.",
      });
    }
    
    // Cart of the user
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "❌ Your cart is empty." });
    }

    const items = cart.items; 
    let itemsTotal = 0;

    // collect items and calculate total
    for (const item of items) {
      itemsTotal += item.price * item.qty;
    }

    // shipping cost logic 

     let shippingCost = 30; // default 
     const city = shippingAddress?.city?.toLowerCase();
     const country = shippingAddress?.country?.toLowerCase();
     
     // وجه بحري 
     let zoneA =["alexandria", "beheira", "gharbia", "monufia", "kafr el-sheikh", "damietta", "dakahlia", "sharqia"]
     // وجه قبلي
     let zoneB =["fayoum", "bani sweif", "minya", "assiut", "sohag", "qena", "luxor", "aswan"];
     // سيناء
     let zoneC =["north sinai", "south sinai"];
     // القاهره الكبري 
     let zoneD =["cairo", "giza", "qalyubia", "alexandria", "6th of october", "sheikh zayed"];

     if (country !== "egypt"){
        shippingCost = 1000; // international
     }else if (zoneD.includes(city)) {
        shippingCost = 30; // القاهره الكبري 
     } else if (zoneA.includes(city)) {
        shippingCost = 50; // وجه بحري 
     } else if (zoneB.includes(city)) {
        shippingCost = 70; // وجه قبلي
     } else if (zoneC.includes(city)) {
        shippingCost = 100; // سيناء
     } else {
        shippingCost = 60; // باقي المحافظات 
     }
     if (itemsTotal > 500) shippingCost = 0;

     // discunt logic
      let discount = 0;
      // status one 
      if (payment?.couponCode === "BOOK10") {
         discount = itemsTotal * 0.1; // %10
      }
      //status one 
      else if (itemsTotal > 1000) {
      discount = 50; // 50 EGP 
      }

        const grandTotal = itemsTotal + shippingCost - discount;
      
    // 💰 بيانات الدفع (من البودي أو ديفولت)
    const payment = req.body.payment || {
      method: "cash",
      status: "unpaid",
    };

    // 🧾 إنشاء الطلب
    const newOrder = new Order({
      userId,
      items,
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

    await newOrder.save();

    // 🧹 فضي الكارت بعد ما الطلب يتعمل
    await Cart.findOneAndUpdate({ userId }, { items: [] });

    res.status(201).json({
      message: "✅ Order placed successfully",
      order: newOrder,
    });
  } catch (err) {
    console.error("❌ Error placing order:", err);
    res.status(500).json({
      message: "❌ An error occurred while placing the order.",
      error: err.message,
    });
  }
};




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
        // const userId = req.user?._id || req.query.userId;

        const userId = req.user._id; 

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
