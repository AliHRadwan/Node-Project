import Cart from '../models/cart.model.js';
// import Book from '../models/book.model.js'; // هنفعله لما يبقى جاهز
import mongoose from 'mongoose';

// ============================================
// 1️⃣ عرض الـ Cart الخاصة بالـ User
// ============================================
export const getCart = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid User ID format'
      });
    }

    const cart = await Cart.findOne({ userId: userId });
      // .populate('items.bookId', 'title author price image');

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: 'Cart is empty',
        data: {
          userId: userId,
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
    console.error('Error in getCart:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cart',
      error: error.message
    });
  }
};

// ============================================
// 2️⃣ إضافة كتاب للـ Cart
// ============================================
export const addToCart = async (req, res) => {
  try {
    const { userId, items } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required and must not be empty'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid User ID format'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(items[0].bookId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Book ID format'
      });
    }

    // البحث عن الـ Cart أو إنشاء واحدة جديدة
    let cart = await Cart.findOne({ userId: userId });

    if (!cart) {
      cart = new Cart({
        userId: userId,
        items: [],
        totals: { subTotal: 0 }
      });
    }

    // التحقق إذا الكتاب موجود في الـ Cart
    const existingItemIndex = cart.items.findIndex(
      item => item.bookId.toString() === items[0].bookId
    );

    if (existingItemIndex > -1) {
      // الكتاب موجود، زود الكمية
      cart.items[existingItemIndex].qty += parseInt(items[0].qty);
    } else {
      // الكتاب مش موجود، ضيفه
      cart.items.push({
        bookId: items[0].bookId,
        qty: parseInt(items[0].qty),
        priceAtAdd: items[0].priceAtAdd
      });
    }

    // احسب الـ Total Price
    cart.totals.subTotal = cart.items.reduce((total, item) => {
      return total + (item.priceAtAdd * item.qty);
    }, 0);

    const savedCart = await cart.save();
    await savedCart.populate('items.bookId', 'title author price image');

    res.status(200).json({
      success: true,
      message: 'Book added to cart successfully',
      data: savedCart
    });
  } catch (error) {
    console.error('Error in addToCart:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding to cart',
      error: error.message
    });
  }
};

// ============================================
// 3️⃣ تحديث كمية كتاب في الـ Cart
// ============================================
export const updateCartItem = async (req, res) => {
  try {
    const { userId, bookId, qty } = req.body;
    
    if (!userId || !bookId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Book ID are required'
      });
    }

    if (qty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const cart = await Cart.findOne({ userId: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.bookId.toString() === bookId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Book not found in cart'
      });
    }

    // تحديث الكمية
    cart.items[itemIndex].qty = qty;

    // احسب الـ Total Price
    cart.totals.subTotal = cart.items.reduce((total, item) => {
      return total + (item.priceAtAdd * item.qty);
    }, 0);

    await cart.save();
    await cart.populate('items.bookId', 'title author price image');

    res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      data: cart
    });
  } catch (error) {
    console.error('Error in updateCartItem:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating cart',
      error: error.message
    });
  }
};

// ============================================
// 4️⃣ حذف كتاب من الـ Cart
// ============================================
export const removeFromCart = async (req, res) => {
  try {
    const { userId, bookId } = req.params;
    
    if (!userId || !bookId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Book ID are required'
      });
    }

    const cart = await Cart.findOne({ userId: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // حذف الكتاب من الـ items
    cart.items = cart.items.filter(
      item => item.bookId.toString() !== bookId
    );

    // احسب الـ Total Price
    cart.totals.subTotal = cart.items.reduce((total, item) => {
      return total + (item.priceAtAdd * item.qty);
    }, 0);

    await cart.save();
    await cart.populate('items.bookId', 'title author price image');

    res.status(200).json({
      success: true,
      message: 'Book removed from cart successfully',
      data: cart
    });
  } catch (error) {
    console.error('Error in removeFromCart:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing from cart',
      error: error.message
    });
  }
};

// ============================================
// 5️⃣ مسح الـ Cart كلها
// ============================================
export const clearCart = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const cart = await Cart.findOne({ userId: userId });

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
    console.error('Error in clearCart:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing cart',
      error: error.message
    });
  }
};