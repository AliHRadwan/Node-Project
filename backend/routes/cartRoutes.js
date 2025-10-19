import express from 'express';
import * as cartController from '../controllers/cart.controller.js';
import verifyJWT from '../middleware/verifyJWT.js';

const router = express.Router();

// ============================================
// 🔓 Routes بدون Authentication (للتجربة فقط)
// ============================================

// GET /api/cart/test/:userId - عرض الـ Cart
router.get('/test/:userId', cartController.getCart);

// POST /api/cart/test - إضافة كتاب للـ Cart
// Body: { userId, items: [{ bookId, qty, priceAtAdd }] }
router.post('/test', cartController.addToCart);

// PUT /api/cart/test - تحديث كمية كتاب
// Body: { userId, bookId, qty }
router.put('/test', cartController.updateCartItem);

// DELETE /api/cart/test/:userId/:bookId - حذف كتاب من الـ Cart
router.delete('/test/:userId/:bookId', cartController.removeFromCart);

// DELETE /api/cart/test/:userId - مسح الـ Cart كلها
router.delete('/test/:userId', cartController.clearCart);

// ============================================
// 🔒 Routes مع Authentication (للإنتاج)
// ============================================

// GET /api/cart - عرض الـ Cart الخاصة بالـ User المسجل
router.get('/', verifyJWT, cartController.getCartAuth);

// POST /api/cart - إضافة كتاب للـ Cart
// Body: { bookId, qty, priceAtAdd }
router.post('/', verifyJWT, cartController.addToCartAuth);

// PUT /api/cart - تحديث كمية كتاب
// Body: { bookId, qty }
router.put('/', verifyJWT, cartController.updateCartItemAuth);

// DELETE /api/cart/:bookId - حذف كتاب من الـ Cart
router.delete('/:bookId', verifyJWT, cartController.removeFromCartAuth);

// DELETE /api/cart - مسح الـ Cart كلها
router.delete('/', verifyJWT, cartController.clearCartAuth);

export default router;