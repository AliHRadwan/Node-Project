import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../core/services/book';

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.html',
  styleUrls: ['./book-detail.css'],
  standalone: false
})
export class BookDetailComponent implements OnInit {
  book: any = null;
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService
  ) {}

  ngOnInit() {
    const bookId = this.route.snapshot.paramMap.get('id');
    console.log('Book Detail - Book ID from route:', bookId);
    if (bookId) {
      this.loadBook(bookId);
    } else {
      this.error = 'Book ID not provided';
      this.loading = false;
    }
  }

  loadBook(id: string) {
    this.loading = true;
    this.error = null;
    console.log('Loading book with ID:', id);
    
    this.bookService.getBookById(id).subscribe({
      next: (book) => {
        console.log('Book loaded successfully:', book);
        this.book = book;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading book:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        this.error = error.error?.message || error.message || 'Failed to load book. Please try again.';
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  addToCart() {
    // TODO: Implement add to cart functionality
    console.log('Add to cart:', this.book);
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }
}

