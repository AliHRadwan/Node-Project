import mongoose from "mongoose";

// تعريف Cart Schema
const cartSchema = new mongoose.Schema({
  // ربط الـ Cart بالـ User
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
    // ملحوظة: تأكد إن الـ User موجود في الـ database
  },

  // المنتجات (الكتب) في الـ Cart
  items: [
    {
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
      },
      qty: {
        type: Number,
        required: true,
        min: 1,
        default: 1
      },
      priceAtAdd: {
        type: Number,
        required: true
      }
    }
  ],

  // إجمالي السعر
  totals: {
    subTotal: {
      type: Number,
      required: true,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Method لحساب الـ Total Price
cartSchema.methods.calculateTotal = function () {
  this.totals.subTotal = this.items.reduce((total, item) => {
    return total + (item.priceAtAdd * item.qty);
  }, 0);
  return this.totals.subTotal;
};

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;