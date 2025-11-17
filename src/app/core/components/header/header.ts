import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth';
import { AuthorService } from '../../services/author';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  isAuthor: boolean = false;
  isLoadingAuthor: boolean = false;

  constructor(
    public cartService: CartService,
    private authService: AuthService,
    private authorService: AuthorService
  ) {}

  ngOnInit() {
    // Check if user is authenticated and has author profile
    if (this.authService.isAuthenticated()) {
      this.checkAuthorStatus();
    }

    // Listen to authentication changes
    this.authService.currentUser$.subscribe(() => {
      if (this.authService.isAuthenticated()) {
        this.checkAuthorStatus();
      } else {
        this.isAuthor = false;
      }
    });
  }

  checkAuthorStatus() {
    this.isLoadingAuthor = true;
    this.authorService.getMyAuthorProfile().subscribe({
      next: (author) => {
        // Check if author exists and is approved
        this.isAuthor = author && author.status === 'approved';
        this.isLoadingAuthor = false;
      },
      error: (err) => {
        // User is not an author or not authenticated
        this.isAuthor = false;
        this.isLoadingAuthor = false;
      }
    });
  }

}
