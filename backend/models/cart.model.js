import mongoose from 'mongoose';

// تعريف Cart Schema
const cartSchema = new mongoose.Schema({
  // ربط الـ Cart بالـ User
  // user: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User', // اسم الـ User model عندك
  //   required: true,
  //   unique: true // كل يوزر ليه cart واحدة بس
  // },
  
  // المنتجات (الكتب) في الـ Cart
  items: [
    {
      book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book', // اسم الـ Book model عندك
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1, // على الأقل كتاب واحد
        default: 1
      },
      price: {
        type: Number,
        required: true
      }
    }
  ],
  
  // إجمالي السعر
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true // بيضيف createdAt و updatedAt تلقائياً
});

// Method لحساب الـ Total Price
cartSchema.methods.calculateTotal = function() {
  this.totalPrice = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  return this.totalPrice;
};

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;