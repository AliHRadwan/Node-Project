import Cart from "../models/cart.model.js";
import Book from "../models/Book.js";
import mongoose from "mongoose";

export const getCartAuth = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);

    const cart = await Cart.findOne({ userId: userObjectId })
      .populate('items.bookId', 'title price author');

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: 'Cart is empty',
        data: {
          userId: req.user.id,
          items: [],
          totals: { subTotal: 0 }
        }
      });
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Error in getCartAuth:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cart',
      error: error.message
    });
  }
};
// ============================================
export const addToCartAuth = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    const bookObjectId = new mongoose.Types.ObjectId(req.body.bookId);
    const qtyValue = parseInt(req.body.qty || 1);
    const priceAtAdd = req.body.priceAtAdd;

    if (!priceAtAdd) {
      return res.status(400).json({
        success: false,
        message: 'Price is required'
      });
    }

    const bookExists = await Book.findById(bookObjectId);

    if (!bookExists) {
      return res.status(404).json({
        success: false,
        message: 'Book not found in database'
      });
    }

    let cart = await Cart.findOne({ userId: userObjectId });

    if (!cart) {
      cart = new Cart({
        userId: userObjectId,
        items: [],
        totals: { subTotal: 0 }
      });
    }

    const existingItemIndex = cart.items.findIndex(
      item => item.bookId.toString() === bookObjectId.toString()
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].qty += qtyValue;
    } else {
      cart.items.push({
        bookId: bookObjectId,
        qty: qtyValue,
        priceAtAdd: priceAtAdd
      });
    }

    cart.totals.subTotal = cart.items.reduce((total, item) => {
      return total + item.priceAtAdd * item.qty;
    }, 0);

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Book added to cart successfully',
      data: cart
    });
  } catch (error) {
    console.error('Error in addToCartAuth:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding to cart',
      error: error.message
    });
  }
};
// ============================================
export const updateCartItemAuth = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    const { bookId, qty } = req.body;

    if (!bookId || qty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid Book ID and quantity are required'
      });
    }

    const bookObjectId = new mongoose.Types.ObjectId(bookId);
    const cart = await Cart.findOne({ userId: userObjectId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.bookId.toString() === bookObjectId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Book not found in cart'
      });
    }

    cart.items[itemIndex].qty = qty;

    cart.totals.subTotal = cart.items.reduce((total, item) => {
      return total + (item.priceAtAdd * item.qty);
    }, 0);

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      data: cart
    });
  } catch (error) {
    console.error('Error in updateCartItemAuth:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating cart',
      error: error.message
    });
  }
};
// ============================================
export const removeFromCartAuth = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    const { bookId } = req.params;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: 'Book ID is required'
      });
    }

    const bookObjectId = new mongoose.Types.ObjectId(bookId);
    const cart = await Cart.findOne({ userId: userObjectId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(
      item => item.bookId.toString() !== bookObjectId.toString()
    );

    cart.totals.subTotal = cart.items.reduce((total, item) => {
      return total + (item.priceAtAdd * item.qty);
    }, 0);

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Book removed from cart successfully',
      data: cart
    });
  } catch (error) {
    console.error('Error in removeFromCartAuth:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing from cart',
      error: error.message
    });
  }
};
// ============================================
export const clearCartAuth = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    const cart = await Cart.findOne({ userId: userObjectId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    cart.totals.subTotal = 0;

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: cart
    });
  } catch (error) {
    console.error('Error in clearCartAuth:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing cart',
      error: error.message
    });
  }
};