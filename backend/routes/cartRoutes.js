import express from 'express';
import * as cartController from '../controllers/cart.controller.js';
// import { protect } from '../middleware/auth.js'; // هنفعلها لما الـ auth يبقى جاهز

const router = express.Router();

// ⚠️ مؤقتاً: الـ routes بدون authentication للتجربة
// لما الـ auth middleware يبقى جاهز، ضيف protect قبل كل controller

// ============================================
// GET /api/cart/:userId - عرض الـ Cart
// ============================================
router.get('/:userId', cartController.getCart);

// ============================================
// POST /api/cart - إضافة كتاب للـ Cart
// ============================================
// Body: { userId, bookId, quantity }
router.post('/', cartController.addToCart);

// ============================================
// PUT /api/cart - تحديث كمية كتاب
// ============================================
// Body: { userId, bookId, quantity }
router.put('/', cartController.updateCartItem);

// ============================================
// DELETE /api/cart/:userId/:bookId - حذف كتاب من الـ Cart
// ============================================
router.delete('/:userId/:bookId', cartController.removeFromCart);

// ============================================
// DELETE /api/cart/:userId - مسح الـ Cart كلها
// ============================================
router.delete('/:userId', cartController.clearCart);

export default router;