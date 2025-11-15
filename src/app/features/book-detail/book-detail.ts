import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../core/services/book';
import { ReviewService, ReviewsResponse } from '../../core/services/review-service';

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
  palceholderCover: string = 'https://res.cloudinary.com/dbelkcsrq/image/upload/book-store/covers/soul.jpg';

  reviews: any[] = [];
  reviewPagination: any = null;
  reviewsLoading: boolean = true;
  reviewsError: string | null = null;
  currentReviewPage: number = 1;
  reviewsLimit: number = 5;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private reviewService: ReviewService
  ) {}

  ngOnInit() {
    const bookId = this.route.snapshot.paramMap.get('id');
    console.log('Book Detail - Book ID from route:', bookId);
    if (bookId) {
      this.loadBook(bookId);
    } else {
      this.error = 'Book ID not provided';
      this.loading = false;
      this.reviewsLoading = false;
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
        this.loadReviews(book._id, this.currentReviewPage); 
      },
      error: (error) => {
        console.error('Error loading book:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        this.error = error.error?.message || error.message || 'Failed to load book. Please try again.';
        this.loading = false;
        this.reviewsLoading = false;
      }
    });
  }

  loadReviews(bookId: string, page: number) {
    this.reviewsLoading = true;
    this.reviewsError = null;
    this.currentReviewPage = page;

    this.reviewService.getBookReviews(bookId, page, this.reviewsLimit).subscribe({
      next: (response: ReviewsResponse) => {
        this.reviews = response.data;
        this.reviewPagination = response.pagination;
        this.reviewsLoading = false;
        console.log('Reviews loaded:', response);
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.reviewsError = 'Failed to load reviews. Please try again.';
        this.reviewsLoading = false;
      },
    });
  }

  onReviewPageChange(page: number) {
    if (
      page < 1 ||
      (this.reviewPagination && page > this.reviewPagination.totalPages)
    ) {
      return;
    }
    this.loadReviews(this.book._id, page);
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

