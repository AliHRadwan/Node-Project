import mongoose from "mongoose";
import Order from "../models/Order.js";
import Book from "../models/Book.js";
import Cart from "../models/cart.model.js";
import User from "../models/User.js";
import Joi from "joi";
import { cancelPendingOrder, refundPaidOrder } from "../services/orderCancel.js";
import { releaseReservationBySessionId } from "../utils/reservationRelease.js";
import dotenv from "dotenv";


dotenv.config();

const PRICING_CURRENCY = (process.env.STRIPE_CURRENCY || "EGP").toUpperCase();
const toObjectId = (v) =>
  (v && mongoose.Types.ObjectId.isValid(v)) ? new mongoose.Types.ObjectId(v) : undefined;


// shipping address validation schema
const shippingAddressSchema = Joi.object({
  fullName: Joi.string().min(3).max(60),
  phone: Joi.string().pattern(/^[0-9+\-() ]+$/).min(6).max(20).required(),
  line1: Joi.string().min(3).max(120).allow("", null),
  line2: Joi.string().max(120).allow("", null),
  city: Joi.string().min(2).max(60).required(),
  state: Joi.string().max(60).allow("", null),
  country: Joi.string().min(2).max(60).required(),
  postalCode: Joi.string().max(20).allow("", null),
});

//create an order 
export const placeOrder = async (req, res) => {
  try {

    // from auth middleware

    const userId = req.user._id || req.user.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "❌ Invalid or missing userId",
        status: "error",
        code: 400
      });
    }
    if (req.body?.shippingAddress) {
      const { error, value } = shippingAddressSchema.validate(req.body.shippingAddress, { abortEarly: false, stripUnknown: true });
      if (error) {
        return res.status(400).json({
          message: "❌ Invalid shipping address",
          details: error.details.map(d => d.message),
        });
      }

      req.body.shippingAddress = value;
    }

    // shipping address from body or default from user 
    // let shippingAddress = req.body.shippingAddress || {};
    let shippingAddress = req.body?.shippingAddress || null;

    if (!shippingAddress) {
      const user = await User.findById(userId);
      if (user?.addresses && user.addresses.length > 0) {
        shippingAddress = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      }
    }

    if (!shippingAddress) {
      return res.status(400).json({
        message: "❌ No shipping address found. Please add one in your profile.",
        status: "error",
        code: 400,
      });
    }

    if (!shippingAddress.fullName) {
      const user = await User.findById(userId).select("name");
      shippingAddress.fullName = user?.name || "Unknown User";
    }


    if (req.body?.shippingAddress) {
      const user = await User.findById(userId);
      if (user) {
        const existingAddress = user.addresses.find(
          (a) =>
            a.line1 === shippingAddress.line1 &&
            a.city === shippingAddress.city &&
            a.country === shippingAddress.country
        );


        if (!existingAddress) {
          user.addresses.push({
            label: "From order",
            ...shippingAddress,
            isDefault: user.addresses.length === 0,
          });
          await user.save();
        }
      }
    }

    // Cart of the user
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "❌ Your cart is empty.",
        status: "error",
        code: 400,
      });
    }

    const items = cart.items;
    let itemsTotal = 0;

    // collect items and calculate total
    for (const item of items) {
      const unitPrice = Number(item.priceAtAdd ?? item.price);
      const qty = Number(item.qty);

      const invalidPrice = !Number.isFinite(unitPrice) || unitPrice < 0;
      const invalidQty = !Number.isInteger(qty) || qty < 1;
      if (invalidPrice || invalidQty) {
        return res.status(400).json({
          message: "❌ Invalid price or quantity in cart.",
          status: "error",
          code: 400
        });
      }

      itemsTotal += unitPrice * qty;
    }

    // payment info from body or default
    const payment = req.body?.payment || { method: "cash", status: "unpaid" };

    // shipping cost logic
    let shippingCost = 30; // default 
    const stateNormalized = (shippingAddress?.state || shippingAddress?.governorate || "").toString().trim().toLowerCase();
    const countryNormalized = (shippingAddress?.country || "").toString().trim().toLowerCase();

    // وجه بحري  
    let zoneA = ["alexandria", "beheira", "gharbia", "monufia", "kafr el-sheikh", "damietta", "dakahlia", "sharqia", "ismailia", "port said", "suez"];
    // وجه قبلي والوادى الجديد والبحر الاحمر ومطروح
    let zoneB = ["faiyum", "beni suef", "minya", "assiut", "sohag", "qena", "luxor", "aswan", "red sea", "new valley", "matrouh"];
    // سيناء
    let zoneC = ["north sinai", "south sinai"];
    // القاهره الكبري 
    let zoneD = ["cairo", "giza", "qalyubia"];

    if (countryNormalized !== "egypt") {
      shippingCost = 1000; // international
    } else if (zoneD.includes(stateNormalized)) {
      shippingCost = 30; // القاهره الكبري 
    } else if (zoneA.includes(stateNormalized)) {
      shippingCost = 50; // وجه بحري 
    } else if (zoneB.includes(stateNormalized)) {
      shippingCost = 70; // وجه قبلي
    } else if (zoneC.includes(stateNormalized)) {
      shippingCost = 100; // سيناء
    } else {
      shippingCost = 70; // باقي المحافظات 
    }

    if (itemsTotal > 2000) shippingCost = 0;

    // discount logic (hard-coded coupon)
    let discount = 0;
    if (payment?.couponCode === "BOOK10" && itemsTotal > 1000) {
      discount = itemsTotal * 0.1 > 200 ? 200 : itemsTotal * 0.1; // %10 but not more than 200 EGP
    }

    const grandTotal = itemsTotal + shippingCost - discount;

    // create order
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
      currency: PRICING_CURRENCY,
      placedAt: new Date(),
      status: "pending",
    });

    await newOrder.save();

    // const savedOrder = await newOrder.save(); 

    // clear cart
    await Cart.findOneAndUpdate({ userId }, { items: [] });

    res.status(201).json({
      message: "✅ Order placed successfully",
      status: "success",
      code: 201,
      order: newOrder,
    });
  } catch (err) {
    console.error("❌ Error placing order:", err);
    res.status(500).json({
      message: "❌ An error occurred while placing the order.",
      status: "error",
      code: 500,
      error: err.message,
    });
  }
};

//==========================================================================================================

// get all orders for a user 
export const getUserOrders = async (req, res) => {
  try {

    // const userId = req.user?._id || req.query.userId;

    const userId = req.user._id || req.user.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "❌ invalid or missing userId",
        status: "error",
        code: 400,
      });
    }

    // console.log("🟢 Searching for userId:", userId);

    // const orders = await Order.find().sort({ placedAt: -1 });

    const orders = await Order.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).sort({ placedAt: -1 });

    res.status(200).json({
      message: "✅ done, all orders here for the user",
      status: "success",
      code: 200,
      orders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "❌ An error occurred while displaying the orders",
      status: "error",
      code: 500,
      error: err.message,
    });
  }
};

//=========================================================================================

// cancel order by user
export const cancelOrderByUser = async (req, res) => {
  try {
    const rawUserId = req.user?._id || req.user?.id;
    const userId = toObjectId(rawUserId);
    const { orderId } = req.params;
    const { reason } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid orderId", status: "error", code: 400 });
    }
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized (invalid user id)", status: "error", code: 401 });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found", status: "error", code: 404 });

    if (String(order.userId) !== String(userId)) {
      return res.status(403).json({
        message: "You cannot cancel someone else's order",
        status: "error",
        code: 403
      });
    }


    if (["shipped", "delivered"].includes(order.status)) {
      return res.status(400).json({
        message: `Order is already ${order.status} and cannot be cancelled`,
        status: "error",
        code: 400
      });
    }


    if (order.status !== "pending") {
      return res.status(400).json({
        message: `Order is ${order.status}. Refunds are handled by support.`,
        status: "error",
        code: 400
      });
    }


    const sessionId = order?.payment?.sessionId;
    if (sessionId) {
      try { await releaseReservationBySessionId(sessionId); } catch (e) {
        console.warn("releaseReservationBySessionId warn:", e?.message);
      }
    }


    order.status = "cancelled";
    order.cancelledAt = new Date();
    order.cancelledBy = { id: userId, role: "user" };
    if (reason) order.cancelReason = reason;
    await order.save();

    return res.status(200).json({
      message: "✅ Order cancelled successfully",
      status: "success",
      code: 200,
      order
    });
  } catch (err) {
    console.error("cancelOrderByUser error:", err);
    return res.status(500).json({
      message: "Error cancelling order",
      status: "error",
      code: 500,
      error: err.message
    });
  }
};

//==========================dashboard================================================================================

//get all orders to dashboard 
export const getAllOrders = async (req, res) => {
  try {
    const allOrders = await Order.find().sort({ placedAt: -1 });
    // const allOrders = await Order.find({}, "userId status amounts.grandTotal placedAt").sort({ placedAt: -1 });


    res.status(200).json({
      message: "✅ done, all orders here",
      status: "success",
      code: 200,
      allOrders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "❌ An error occurred while displaying the orders",
      status: "error",
      code: 500,
      error: err.message,
    });
  }
};

//========================================================================================

// cancel order by admin
export const cancelOrderByAdmin = async (req, res) => {
  try {
    const rawAdminId = req.user?._id || req.user?.id;
    const adminId = toObjectId(rawAdminId);

    if (!adminId) {
      return res.status(401).json({ message: "Unauthorized (invalid admin id)", status: "error", code: 401 });
    }
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admins only", status: "error", code: 403 });
    }

    const { orderId } = req.params;
    const { reason, restock = true } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid orderId", status: "error", code: 400 });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found", status: "error", code: 404 });

    if (order.status === "delivered") {
      return res.status(400).json({
        message: "Delivered order cannot be cancelled; use return/refund process",
        status: "error",
        code: 400
      });
    }
    if (order.status === "shipped") {
      return res.status(400).json({
        message: "Shipped order requires return process, not cancellation",
        status: "error",
        code: 400
      });
    }

    if (order.status === "pending") {

      const sessionId = order?.payment?.sessionId;
      if (sessionId) {
        try { await releaseReservationBySessionId(sessionId); } catch (e) {
          console.warn("releaseReservationBySessionId warn:", e?.message);
        }
      }

      order.status = "cancelled";
      order.cancelledAt = new Date();
      order.cancelledBy = { id: adminId, role: "admin" }; // 👈 ObjectId
      order.cancelReason = reason || "Cancelled by admin";
      await order.save();

      return res.status(200).json({
        message: "✅ Order cancelled successfully by admin",
        status: "success",
        code: 200,
        order
      });
    }

    // paid → Refund (Stripe) + restock
    if (order.status === "paid") {
      const out = await refundPaidOrder({
        orderId,
        actor: "admin",
        reason: reason || "Cancelled by admin",
        restock: !!restock
      });
      return res.status(200).json({
        message: "✅ Order refunded by admin",
        status: "success",
        code: 200,
        order: out.order
      });
    }

    return res.status(400).json({
      message: `Order is ${order.status} and cannot be cancelled/refunded here`,
      status: "error",
      code: 400
    });

  }
  catch (err) {
    console.error("cancelOrderByAdmin error:", err);
    return res.status(500).json({
      message: "Error cancelling order",
      status: "error",
      code: 500,
      error: err.message
    });
    //    if (err?.code === 121 && err?.errInfo?.details) {
    //   console.error('Schema details:\n', JSON.stringify(err.errInfo.details, null, 2));
    // }
  }
};



//==============================================================================================

// mark order 
export const assertTransition = (from, to) => {
  const allowed = {
    pending: new Set(["paid", "cancelled"]),
    paid: new Set(["shipped", "cancelled"]),
    shipped: new Set(["delivered"]),
    delivered: new Set([]),
    cancelled: new Set([]),
    refunded: new Set(["paid"]),
  };
  if (!allowed[from]?.has(to)) {
    throw new Error(`Invalid status transition: ${from} → ${to}`);
  }
};

export const markAsPaid = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid orderId" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found", status: "error", code: 404 });

    assertTransition(order.status, "paid");

    order.status = "paid";
    order.payment = {
      ...(order.payment || {}),
      status: "paid",
    };

    await order.save();
    res.json({ message: "✅ Order marked as paid", status: "success", code: 200, order });
  } catch (err) {
    res.status(400).json({ status: "error", code: 400, message: err.message });
  }
};


export const markAsShipped = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid orderId", status: "error", code: 400 });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found", status: "error", code: 404 });

    assertTransition(order.status, "shipped");

    order.status = "shipped";
    await order.save();

    res.json({ message: "✅ Order marked as shipped", status: "success", code: 200, order });
  } catch (err) {
    res.status(400).json({ message: err.message, status: "error", code: 400 });
  }
};


export const markAsDelivered = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid orderId", status: "error", code: 400 });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found", status: "error", code: 404 });

    assertTransition(order.status, "delivered");

    order.status = "delivered";
    await order.save();

    res.json({ message: "✅ Order marked as delivered", status: "success", code: 200, order });
  } catch (err) {
    res.status(400).json({ status: "error", code: 400, message: err.message });
  }
};
