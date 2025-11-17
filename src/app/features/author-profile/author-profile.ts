import { Component, OnInit } from '@angular/core';
import { AuthorService } from '../../core/services/author';
import { BookService } from '../../core/services/book';
import { CategoryService } from '../../core/services/category';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-author-profile',
  standalone: false,
  templateUrl: './author-profile.html',
  styleUrls: ['./author-profile.css'],
})
export class AuthorProfileComponent implements OnInit {
  author: any = null;
  books: any[] = [];
  categories: any[] = [];
  loading = true;
  error: string | null = null;

  // Book form state
  showBookForm = false;
  editingBook: any = null;
  bookForm: any = {
    title: '',
    description: '',
    price: 0,
    stock: 0,
    isbn: '',
    sku: '',
    publisher: '',
    language: '',
    publishedAt: new Date().toISOString().split('T')[0],
    authors: [],
    categories: [],
    isActive: true,
    image: { url: '' },
    pdfUrl: ''
  };

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalBooks = 0;
  totalPages = 0;

  constructor(
    private authorService: AuthorService,
    private bookService: BookService,
    private categoryService: CategoryService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadAuthorProfile();
    this.loadCategories();
  }

  loadAuthorProfile() {
    this.loading = true;
    this.error = null;

    this.authorService.getMyAuthorProfile().subscribe({
      next: (author) => {
        this.author = author;
        this.loadMyBooks();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load author profile';
        this.loading = false;
        console.error('Error loading author profile:', err);
      }
    });
  }

  loadMyBooks() {
    if (!this.author || !this.author.name) {
      this.loading = false;
      return;
    }

    // Filter books by author name (backend filters by name)
    const filters = {
      page: this.currentPage,
      limit: this.pageSize,
      author: this.author.name
    };

    this.bookService.getAllBooks(filters).subscribe({
      next: (response) => {
        this.books = response.items || [];
        this.totalBooks = response.meta?.total || 0;
        this.totalPages = response.meta?.pages || 0;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load books';
        this.loading = false;
        console.error('Error loading books:', err);
      }
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  openCreateBookForm() {
    this.editingBook = null;
    this.bookForm = {
      title: '',
      description: '',
      price: 0,
      stock: 0,
      isbn: '',
      sku: '',
      publisher: '',
      language: '',
      publishedAt: new Date().toISOString().split('T')[0],
      authors: [this.author._id],
      categories: [],
      isActive: true,
      image: { url: '' },
      pdfUrl: ''
    };
    this.showBookForm = true;
  }

  openEditBookForm(book: any) {
    this.editingBook = book;
    this.bookForm = {
      title: book.title || '',
      description: book.description || '',
      price: book.price || 0,
      stock: book.stock || 0,
      isbn: book.isbn || '',
      sku: book.sku || '',
      publisher: book.publisher || '',
      language: book.language || '',
      publishedAt: book.publishedAt ? new Date(book.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      authors: book.authors?.map((a: any) => a._id || a) || [this.author._id],
      categories: book.categories?.map((c: any) => c._id || c) || [],
      isActive: book.isActive !== undefined ? book.isActive : true,
      image: book.image || { url: '' },
      pdfUrl: book.pdfUrl || ''
    };
    this.showBookForm = true;
  }

  closeBookForm() {
    this.showBookForm = false;
    this.editingBook = null;
  }

  onCategoryChange(event: any, categoryId: string) {
    const checked = event.target.checked;
    if (checked) {
      if (!this.bookForm.categories.includes(categoryId)) {
        this.bookForm.categories.push(categoryId);
      }
    } else {
      this.bookForm.categories = this.bookForm.categories.filter((id: string) => id !== categoryId);
    }
  }

  isCategorySelected(categoryId: string): boolean {
    return this.bookForm.categories.includes(categoryId);
  }

  submitBookForm() {
    if (!this.bookForm.title || !this.bookForm.price || this.bookForm.stock === undefined) {
      alert('Please fill in all required fields (Title, Price, Stock)');
      return;
    }

    // Prepare book data
    const bookData = {
      ...this.bookForm,
      price: parseFloat(this.bookForm.price),
      stock: parseInt(this.bookForm.stock),
      publishedAt: this.bookForm.publishedAt ? new Date(this.bookForm.publishedAt).toISOString() : undefined
    };

    if (this.editingBook) {
      // Update existing book
      this.bookService.updateBook(this.editingBook._id, bookData).subscribe({
        next: (response) => {
          alert('Book updated successfully!');
          this.closeBookForm();
          this.loadMyBooks();
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to update book');
          console.error('Error updating book:', err);
        }
      });
    } else {
      // Create new book
      this.bookService.createBook(bookData).subscribe({
        next: (response) => {
          alert('Book created successfully!');
          this.closeBookForm();
          this.loadMyBooks();
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to create book');
          console.error('Error creating book:', err);
        }
      });
    }
  }

  deleteBook(book: any) {
    if (!confirm(`Are you sure you want to delete "${book.title}"? This action cannot be undone.`)) {
      return;
    }

    this.bookService.deleteBook(book._id).subscribe({
      next: (response) => {
        alert('Book deleted successfully!');
        this.loadMyBooks();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to delete book');
        console.error('Error deleting book:', err);
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadMyBooks();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}

