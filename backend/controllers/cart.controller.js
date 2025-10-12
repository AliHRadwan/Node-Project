import Cart from '../models/cart.model.js';
// import Book from '../models/book.model.js'; // تأكد من اسم الـ model عندك
import mongoose from 'mongoose';

// ============================================
// 1️⃣ عرض الـ Cart الخاصة بالـ User
// ============================================
export const getCart = async (req, res) => {
  try {
    // مؤقتاً: ناخد الـ userId من الـ params
    // لما الـ auth يبقى جاهز: req.user.id
    const userId = req.params.userId || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // التحقق من صحة الـ ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid User ID format'
      });
    }

    // البحث عن الـ Cart بناءً على الـ userId
    const cart = await Cart.findOne({ user: userId })
      .populate('items.book', 'title author price image'); // جلب معلومات الكتاب

    // لو مفيش cart، نرجع cart فاضية بدل error
    if (!cart) {
      return res.status(200).json({
        success: true,
        message: 'Cart is empty',
        data: {
          user: userId,
          items: [],
          totalPrice: 0
        }
      });
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Error in getCart:', error); // للـ debugging
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
    // مؤقتاً: ناخد الـ userId من الـ body
    // لما الـ auth يبقى جاهز: req.user.id
    const { userId, bookId, quantity = 1 } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // التحقق من وجود الكتاب
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // التحقق من الـ stock
    if (book.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Not enough stock available'
      });
    }

    // البحث عن الـ Cart أو إنشاء واحدة جديدة
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // إنشاء cart جديدة
      cart = new Cart({
        user: userId,
        items: []
      });
    }

    // التحقق إذا الكتاب موجود في الـ Cart
    const existingItemIndex = cart.items.findIndex(
      item => item.book.toString() === bookId
    );

    if (existingItemIndex > -1) {
      // الكتاب موجود، زود الكمية
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // الكتاب مش موجود، ضيفه
      cart.items.push({
        book: bookId,
        quantity: quantity,
        price: book.price
      });
    }

    // احسب الـ Total Price
    cart.calculateTotal();

    // احفظ الـ Cart
    await cart.save();

    // جيب الـ Cart مع معلومات الكتب
    await cart.populate('items.book', 'title author price image');

    res.status(200).json({
      success: true,
      message: 'Book added to cart successfully',
      data: cart
    });
  } catch (error) {
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
    // مؤقتاً: ناخد الـ userId من الـ body
    const { userId, bookId, quantity } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    // البحث عن الـ Cart
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // البحث عن الكتاب في الـ Cart
    const itemIndex = cart.items.findIndex(
      item => item.book.toString() === bookId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Book not found in cart'
      });
    }

    // التحقق من الـ stock
    const book = await Book.findById(bookId);
    if (book.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Not enough stock available'
      });
    }

    // تحديث الكمية
    cart.items[itemIndex].quantity = quantity;

    // احسب الـ Total Price
    cart.calculateTotal();

    await cart.save();
    await cart.populate('items.book', 'title author price image');

    res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      data: cart
    });
  } catch (error) {
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
    // مؤقتاً: ناخد الـ userId من الـ params
    const { userId, bookId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // البحث عن الـ Cart
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // حذف الكتاب من الـ items
    cart.items = cart.items.filter(
      item => item.book.toString() !== bookId
    );

    // احسب الـ Total Price
    cart.calculateTotal();

    await cart.save();
    await cart.populate('items.book', 'title author price image');

    res.status(200).json({
      success: true,
      message: 'Book removed from cart successfully',
      data: cart
    });
  } catch (error) {
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
    // مؤقتاً: ناخد الـ userId من الـ params
    const userId = req.params.userId || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    cart.totalPrice = 0;

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error clearing cart',
      error: error.message
    });
  }
};