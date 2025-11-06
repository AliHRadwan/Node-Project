import { Component } from '@angular/core';

interface CartItem {
  id: string;
  bookId: string;
  title: string;
  author: string;
  price: number;
  qty: number;
  image: string;
  stock: number;
  isInStock: boolean;
}
@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
})
export class Cart {
  cartItems: CartItem[] = [
    {
      id: '1',
      bookId: 'book1',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      price: 150,
      qty: 2,
      image: 'https://via.placeholder.com/150x200?text=Book+1',
      stock: 10,
      isInStock: true
    },
    {
      id: '2',
      bookId: 'book2',
      title: '1984',
      author: 'George Orwell',
      price: 120,
      qty: 1,
      image: 'https://via.placeholder.com/150x200?text=Book+2',
      stock: 5,
      isInStock: true
    },
    {
      id: '3',
      bookId: 'book3',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      price: 180,
      qty: 3,
      image: 'https://via.placeholder.com/150x200?text=Book+3',
      stock: 0,
      isInStock: false
    }
  ];

  isEmpty = false;

  constructor() {}

  // حساب الـ subtotal
  get subtotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.qty), 0);
  }

  // حساب عدد الـ items
  get itemCount(): number {
    return this.cartItems.reduce((total, item) => total + item.qty, 0);
  }

  // زيادة الكمية
  increaseQty(item: CartItem): void {
    if (item.qty < item.stock) {
      item.qty++;
    } else {
      alert('Maximum stock reached!');
    }
  }

  // تقليل الكمية
  decreaseQty(item: CartItem): void {
    if (item.qty > 1) {
      item.qty--;
    }
  }

  // تحديث الكمية
  updateQty(item: CartItem, event: any): void {
    const newQty = parseInt(event.target.value);
    if (newQty >= 1 && newQty <= item.stock) {
      item.qty = newQty;
    } else if (newQty > item.stock) {
      alert(`Only ${item.stock} items available`);
      event.target.value = item.stock;
      item.qty = item.stock;
    } else {
      event.target.value = 1;
      item.qty = 1;
    }
  }

  // حذف item
  removeItem(item: CartItem): void {
    if (confirm(`Remove "${item.title}" from cart?`)) {
      const index = this.cartItems.findIndex(i => i.id === item.id);
      if (index > -1) {
        this.cartItems.splice(index, 1);
      }
      this.isEmpty = this.cartItems.length === 0;
    }
  }

  // مسح الـ cart
  clearCart(): void {
    if (confirm('Clear all items from cart?')) {
      this.cartItems = [];
      this.isEmpty = true;
    }
  }

  // الـ checkout
  checkout(): void {
    if (this.isEmpty) {
      alert('Cart is empty!');
      return;
    }

    const outOfStockItems = this.cartItems.filter(item => !item.isInStock);
    
    if (outOfStockItems.length > 0) {
      alert('Some items are out of stock. Please remove them before checkout.');
      return;
    }

    alert('Proceeding to checkout...');
    // TODO: Navigate to checkout page
  }

  // الـ item total
  getItemTotal(item: CartItem): number {
    return item.price * item.qty;
  }
 }
