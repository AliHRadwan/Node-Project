import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';


@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  constructor(public cartService: CartService) {}

  ngOnInit(): void {
    // Load cart on component initialization
    const token = localStorage.getItem('authToken');
    if (token) {
      this.cartService.getCart().subscribe({
        error: (err) => {
          // Silently fail if user not authenticated or cart doesn't exist
          console.log('Could not load cart:', err.status);
        }
      });
    }
  }
}
