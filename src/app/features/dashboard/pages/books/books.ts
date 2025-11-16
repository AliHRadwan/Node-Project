import { Component, OnInit } from '@angular/core';
import { BookService, BookFilters } from '../../../../core/services/book';
import { CategoryService } from '../../../../core/services/category';
import { AuthorService } from '../../../../core/services/author';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-books',
  standalone: false,
  templateUrl: './books.html',
  styleUrls: ['./books.css'],
})
export class Books implements OnInit {
  books: any[] = [];
  categories: any[] = [];
  authors: any[] = [];
  
  loading = true;
  error: string | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 12;
  totalBooks = 0;
  totalPages = 0;

  // Filters
  filters: BookFilters = {
    page: 1,
    limit: 12,
    sort: 'createdAt',
    isActive: undefined
  };

  // Filter UI state
  searchQuery = '';
  selectedCategory = '';
  selectedAuthor = '';
  minPrice: number | string | null = null;
  maxPrice: number | string | null = null;
  sortBy = 'createdAt';
  statusFilter = 'all'; // all, active, inactive

  // Form state
  showBookForm = false;
  editingBook: any = null;
  bookForm: any = {
    title: '',
    description: '',
    price: 0,
    stock: 0,
    pdfUrl: '',
    image: { url: '' },
    isbn: '',
    sku: '',
    publisher: '',
    language: '',
    publishedAt: '',
    authors: [],
    categories: [],
    isActive: true
  };

  constructor(
    private bookService: BookService,
    private categoryService: CategoryService,
    private authorService: AuthorService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadAuthors();
    this.loadBooks();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories || [];
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  loadAuthors() {
    this.authorService.getAuthors().subscribe({
      next: (response: any) => {
        // Handle both array and object with items
        if (Array.isArray(response)) {
          this.authors = response.filter((a: any) => a.status === 'approved');
        } else if (response.items) {
          this.authors = response.items.filter((a: any) => a.status === 'approved');
        } else {
          this.authors = [];
        }
      },
      error: (err) => {
        console.error('Error loading authors:', err);
        this.authors = [];
      }
    });
  }

  loadBooks() {
    this.loading = true;
    this.error = null;

    const filters: BookFilters = {
      page: this.currentPage,
      limit: this.pageSize,
      sort: this.sortBy
    };

    if (this.searchQuery && this.searchQuery.trim()) {
      filters.q = this.searchQuery.trim();
    }

    if (this.selectedCategory) {
      filters.category = this.selectedCategory;
    }

    if (this.selectedAuthor) {
      filters.author = this.selectedAuthor;
    }

    if (this.minPrice !== null && this.minPrice !== '') {
      filters.minPrice = typeof this.minPrice === 'string' ? parseFloat(this.minPrice) : this.minPrice;
    }

    if (this.maxPrice !== null && this.maxPrice !== '') {
      filters.maxPrice = typeof this.maxPrice === 'string' ? parseFloat(this.maxPrice) : this.maxPrice;
    }

    if (this.statusFilter === 'active') {
      filters.isActive = true;
    } else if (this.statusFilter === 'inactive') {
      filters.isActive = false;
    }

    this.bookService.getAllBooks(filters).subscribe({
      next: (response) => {
        this.books = response.items || response.books || [];
        this.totalBooks = response.meta?.total || 0;
        this.totalPages = response.meta?.pages || 0;
        this.currentPage = response.meta?.page || 1;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load books';
        this.loading = false;
        console.error('Error loading books:', err);
      }
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadBooks();
  }

  onCategoryChange() {
    this.currentPage = 1;
    this.loadBooks();
  }

  onAuthorChange() {
    this.currentPage = 1;
    this.loadBooks();
  }

  onPriceFilterChange() {
    this.currentPage = 1;
    this.loadBooks();
  }

  onSortChange() {
    this.currentPage = 1;
    this.loadBooks();
  }

  onStatusFilterChange() {
    this.currentPage = 1;
    this.loadBooks();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadBooks();
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedAuthor = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.sortBy = 'createdAt';
    this.statusFilter = 'all';
    this.currentPage = 1;
    this.loadBooks();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = Math.min(this.totalPages, 10);
    const startPage = Math.max(1, this.currentPage - 4);
    const endPage = Math.min(this.totalPages, startPage + 9);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  openCreateBookForm() {
    this.editingBook = null;
    this.bookForm = {
      title: '',
      description: '',
      price: 0,
      stock: 0,
      pdfUrl: '',
      image: { url: '' },
      isbn: '',
      sku: '',
      publisher: '',
      language: '',
      publishedAt: '',
      authors: [],
      categories: [],
      isActive: true
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
      pdfUrl: book.pdfUrl || '',
      image: book.image || { url: '' },
      isbn: book.isbn || '',
      sku: book.sku || '',
      publisher: book.publisher || '',
      language: book.language || '',
      publishedAt: book.publishedAt ? new Date(book.publishedAt).toISOString().split('T')[0] : '',
      authors: book.authors ? (Array.isArray(book.authors) ? book.authors.map((a: any) => a._id || a.id || a) : []) : [],
      categories: book.categories ? (Array.isArray(book.categories) ? book.categories.map((c: any) => c._id || c.id || c) : []) : [],
      isActive: book.isActive !== undefined ? book.isActive : true
    };
    this.showBookForm = true;
  }

  closeBookForm() {
    this.showBookForm = false;
    this.editingBook = null;
  }

  onCategorySelect(categoryId: string) {
    if (!this.bookForm.categories) {
      this.bookForm.categories = [];
    }
    const index = this.bookForm.categories.indexOf(categoryId);
    if (index > -1) {
      this.bookForm.categories.splice(index, 1);
    } else {
      this.bookForm.categories.push(categoryId);
    }
  }

  isCategorySelected(categoryId: string): boolean {
    return this.bookForm.categories && this.bookForm.categories.includes(categoryId);
  }

  onAuthorSelect(authorId: string) {
    if (!this.bookForm.authors) {
      this.bookForm.authors = [];
    }
    const index = this.bookForm.authors.indexOf(authorId);
    if (index > -1) {
      this.bookForm.authors.splice(index, 1);
    } else {
      this.bookForm.authors.push(authorId);
    }
  }

  isAuthorSelected(authorId: string): boolean {
    return this.bookForm.authors && this.bookForm.authors.includes(authorId);
  }

  submitBookForm() {
    if (!this.bookForm.title || !this.bookForm.title.trim()) {
      alert('Title is required');
      return;
    }

    if (this.bookForm.price < 0) {
      alert('Price must be 0 or greater');
      return;
    }

    if (this.bookForm.stock < 0) {
      alert('Stock must be 0 or greater');
      return;
    }

    // Prepare form data
    const formData: any = {
      title: this.bookForm.title.trim(),
      description: this.bookForm.description || '',
      price: parseFloat(this.bookForm.price),
      stock: parseInt(this.bookForm.stock),
      isActive: this.bookForm.isActive
    };

    if (this.bookForm.pdfUrl) formData.pdfUrl = this.bookForm.pdfUrl.trim();
    if (this.bookForm.image?.url) formData.image = { url: this.bookForm.image.url };
    if (this.bookForm.isbn) formData.isbn = this.bookForm.isbn.trim();
    if (this.bookForm.sku) formData.sku = this.bookForm.sku.trim();
    if (this.bookForm.publisher) formData.publisher = this.bookForm.publisher.trim();
    if (this.bookForm.language) formData.language = this.bookForm.language.trim();
    if (this.bookForm.publishedAt) formData.publishedAt = new Date(this.bookForm.publishedAt).toISOString();
    if (this.bookForm.authors && this.bookForm.authors.length > 0) formData.authors = this.bookForm.authors;
    if (this.bookForm.categories && this.bookForm.categories.length > 0) formData.categories = this.bookForm.categories;

    if (this.editingBook) {
      // Update existing book
      this.bookService.updateBook(this.editingBook._id || this.editingBook.id, formData).subscribe({
        next: (response) => {
          alert('Book updated successfully!');
          this.closeBookForm();
          this.loadBooks();
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to update book');
          console.error('Error updating book:', err);
        }
      });
    } else {
      // Create new book
      this.bookService.createBook(formData).subscribe({
        next: (response) => {
          alert('Book created successfully!');
          this.closeBookForm();
          this.loadBooks();
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to create book');
          console.error('Error creating book:', err);
        }
      });
    }
  }

  deleteBook(book: any) {
    if (!confirm(`Are you sure you want to delete "${book.title}"?`)) {
      return;
    }

    this.bookService.deleteBook(book._id || book.id).subscribe({
      next: (response) => {
        alert('Book deleted successfully!');
        this.loadBooks();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to delete book');
        console.error('Error deleting book:', err);
      }
    });
  }
}

