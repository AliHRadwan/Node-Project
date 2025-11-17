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
  showDetailsForm = false;
  editingBook: any = null;
  newlyCreatedBook: any = null; // Store the newly created book for step 2
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
  // Step 1 form (required fields only)
  requiredForm: any = {
    title: '',
    price: 0,
    stock: 0,
    authors: []
  };
  // Step 2 form (optional details)
  detailsForm: any = {
    description: '',
    pdfUrl: '',
    image: { url: '' },
    isbn: '',
    sku: '',
    publisher: '',
    language: '',
    publishedAt: '',
    categories: [],
    isActive: true
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
    this.newlyCreatedBook = null;
    this.requiredForm = {
      title: '',
      price: 0,
      stock: 0,
      authors: [this.author._id] // Pre-fill with current author
    };
    this.detailsForm = {
      description: '',
      pdfUrl: '',
      image: { url: '' },
      isbn: '',
      sku: '',
      publisher: '',
      language: '',
      publishedAt: '',
      categories: [],
      isActive: true
    };
    this.showBookForm = true;
    this.showDetailsForm = false;
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
    this.showDetailsForm = false;
    this.editingBook = null;
    this.newlyCreatedBook = null;
  }

  closeDetailsForm() {
    this.showDetailsForm = false;
    this.newlyCreatedBook = null;
    this.loadMyBooks(); // Refresh the book list
  }

  onCategoryChange(event: any, categoryId: string) {
    const checked = event.target.checked;
    // Handle both edit form and details form
    if (this.showDetailsForm) {
      // For details form (step 2)
      if (checked) {
        if (!this.detailsForm.categories.includes(categoryId)) {
          this.detailsForm.categories.push(categoryId);
        }
      } else {
        this.detailsForm.categories = this.detailsForm.categories.filter((id: string) => id !== categoryId);
      }
    } else {
      // For edit form
      if (checked) {
        if (!this.bookForm.categories.includes(categoryId)) {
          this.bookForm.categories.push(categoryId);
        }
      } else {
        this.bookForm.categories = this.bookForm.categories.filter((id: string) => id !== categoryId);
      }
    }
  }

  isCategorySelected(categoryId: string): boolean {
    return this.bookForm.categories.includes(categoryId);
  }

  // Step 1: Submit required fields to create book
  submitRequiredForm() {
    // Validation
    if (!this.requiredForm.title || !this.requiredForm.title.trim()) {
      alert('Title is required');
      return;
    }

    if (this.requiredForm.price < 0) {
      alert('Price must be 0 or greater');
      return;
    }

    if (this.requiredForm.stock < 0) {
      alert('Stock must be 0 or greater');
      return;
    }

    if (!this.requiredForm.authors || this.requiredForm.authors.length === 0) {
      alert('At least one author is required');
      return;
    }

    // Prepare required data only
    const requiredData: any = {
      title: this.requiredForm.title.trim(),
      price: parseFloat(this.requiredForm.price),
      stock: parseInt(this.requiredForm.stock),
      authors: this.requiredForm.authors
    };

    // Create book with required fields only
    this.bookService.createBook(requiredData).subscribe({
      next: (response) => {
        // Store the newly created book
        this.newlyCreatedBook = response.book || response;
        // Close the required form and show details form
        this.showBookForm = false;
        this.showDetailsForm = true;
        alert('Book created successfully! Now fill in the details.');
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to create book');
        console.error('Error creating book:', err);
      }
    });
  }

  // Step 2: Submit optional details to update the book
  submitDetailsForm() {
    if (!this.newlyCreatedBook) {
      alert('Error: Book not found. Please try again.');
      this.closeDetailsForm();
      return;
    }

    // Prepare details data
    const detailsData: any = {};

    if (this.detailsForm.description) detailsData.description = this.detailsForm.description.trim();
    if (this.detailsForm.pdfUrl) detailsData.pdfUrl = this.detailsForm.pdfUrl.trim();
    if (this.detailsForm.image?.url) detailsData.image = { url: this.detailsForm.image.url.trim() };
    if (this.detailsForm.isbn) detailsData.isbn = this.detailsForm.isbn.trim();
    if (this.detailsForm.sku) detailsData.sku = this.detailsForm.sku.trim();
    if (this.detailsForm.publisher) detailsData.publisher = this.detailsForm.publisher.trim();
    if (this.detailsForm.language) detailsData.language = this.detailsForm.language.trim();
    if (this.detailsForm.publishedAt) detailsData.publishedAt = new Date(this.detailsForm.publishedAt).toISOString();
    if (this.detailsForm.categories && this.detailsForm.categories.length > 0) detailsData.categories = this.detailsForm.categories;
    if (this.detailsForm.isActive !== undefined) detailsData.isActive = this.detailsForm.isActive;

    // Update the book with details
    const bookId = this.newlyCreatedBook._id || this.newlyCreatedBook.id;
    this.bookService.updateBook(bookId, detailsData).subscribe({
      next: (response) => {
        alert('Book details updated successfully!');
        this.closeDetailsForm();
        this.loadMyBooks();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to update book details');
        console.error('Error updating book details:', err);
      }
    });
  }

  // For editing existing books (keep the old form)
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

