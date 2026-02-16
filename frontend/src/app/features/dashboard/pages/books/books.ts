import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BookService, BookFilters } from '../../../../core/services/book';
import { CategoryService } from '../../../../core/services/category';
import { AuthorService } from '../../../../core/services/author';
import { AuthService } from '../../../../core/services/auth';
import { UploadService } from '../../../../core/services/upload.service';
import { ToastService } from '../../../../core/services/toast.service';
import { MatDialog } from '@angular/material/dialog';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ConfirmDialogComponent } from '../../../../shared/confirm-dialog/confirm-dialog.component';
import { firstValueFrom, Observable, map, startWith } from 'rxjs';

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
  sortBy = '-createdAt'; // Newest first
  statusFilter = 'all'; // all, active, inactive

  // Form state
  showBookForm = false;
  showDetailsForm = false;
  editingBook: any = null;
  newlyCreatedBook: any = null; // Store the newly created book for step 2
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
  // Step 1 form (required fields: title, price, stock, authors, description, category, language, isActive, PDF)
  requiredForm: any = {
    title: '',
    price: 0,
    stock: 0,
    authors: [],
    description: '',
    categories: [],
    language: '',
    isActive: true
  };
  // Step 2 form (optional details: isbn, sku, publisher, publishedAt, cover image)
  detailsForm: any = {
    isbn: '',
    sku: '',
    publisher: '',
    publishedAt: '',
    image: { url: '' }
  };

  // File uploads
  selectedImageFile: File | null = null;
  selectedPdfFile: File | null = null;
  selectedEditImageFile: File | null = null;
  selectedEditPdfFile: File | null = null;

  // Author autocomplete for create form
  authorSearchCtrl = new FormControl('');
  filteredAuthors$!: Observable<any[]>;
  selectedAuthorsForCreate: any[] = [];
  @ViewChild('authorInput') authorInput!: ElementRef<HTMLInputElement>;

  // Author autocomplete for edit form
  editAuthorSearchCtrl = new FormControl('');
  filteredAuthorsForEdit$!: Observable<any[]>;
  selectedAuthorsForEdit: any[] = [];
  @ViewChild('editAuthorInput') editAuthorInput!: ElementRef<HTMLInputElement>;

  constructor(
    private bookService: BookService,
    private categoryService: CategoryService,
    private authorService: AuthorService,
    private authService: AuthService,
    private uploadService: UploadService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadAuthors();
    this.loadBooks();
    this.initAuthorAutocomplete();
  }

  initAuthorAutocomplete() {
    // For create form
    this.filteredAuthors$ = this.authorSearchCtrl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterAuthors(value || '', this.selectedAuthorsForCreate))
    );

    // For edit form
    this.filteredAuthorsForEdit$ = this.editAuthorSearchCtrl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterAuthors(value || '', this.selectedAuthorsForEdit))
    );
  }

  filterAuthors(searchTerm: string, excludeList: any[]): any[] {
    const filterValue = typeof searchTerm === 'string' ? searchTerm.toLowerCase() : '';
    const excludeIds = excludeList.map(a => a._id || a.id);
    return this.authors.filter(author => 
      (author.name?.toLowerCase().includes(filterValue)) &&
      !excludeIds.includes(author._id || author.id)
    );
  }

  displayAuthorName(author: any): string {
    return author ? author.name : '';
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
        // Handle both array and object with items - show all authors
        if (Array.isArray(response)) {
          this.authors = response;
        } else if (response.items) {
          this.authors = response.items;
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
    this.sortBy = '-createdAt'; // Newest first
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
    this.newlyCreatedBook = null;
    this.requiredForm = {
      title: '',
      price: 0,
      stock: 0,
      authors: [],
      description: '',
      categories: [],
      language: '',
      isActive: true
    };
    this.detailsForm = {
      isbn: '',
      sku: '',
      publisher: '',
      publishedAt: '',
      image: { url: '' }
    };
    this.selectedImageFile = null;
    this.selectedPdfFile = null;
    this.selectedAuthorsForCreate = [];
    this.authorSearchCtrl.setValue('');
    this.showBookForm = true;
    this.showDetailsForm = false;
  }

  // Author autocomplete methods for create form
  onAuthorSelected(event: MatAutocompleteSelectedEvent): void {
    const author = event.option.value;
    if (!this.selectedAuthorsForCreate.find(a => (a._id || a.id) === (author._id || author.id))) {
      this.selectedAuthorsForCreate.push(author);
      this.requiredForm.authors = this.selectedAuthorsForCreate.map(a => a._id || a.id);
    }
    this.authorSearchCtrl.setValue('');
    if (this.authorInput) {
      this.authorInput.nativeElement.value = '';
    }
  }

  removeAuthorFromCreate(author: any): void {
    const index = this.selectedAuthorsForCreate.findIndex(a => (a._id || a.id) === (author._id || author.id));
    if (index >= 0) {
      this.selectedAuthorsForCreate.splice(index, 1);
      this.requiredForm.authors = this.selectedAuthorsForCreate.map(a => a._id || a.id);
    }
  }

  // Author autocomplete methods for edit form
  onEditAuthorSelected(event: MatAutocompleteSelectedEvent): void {
    const author = event.option.value;
    if (!this.selectedAuthorsForEdit.find(a => (a._id || a.id) === (author._id || author.id))) {
      this.selectedAuthorsForEdit.push(author);
      this.bookForm.authors = this.selectedAuthorsForEdit.map(a => a._id || a.id);
    }
    this.editAuthorSearchCtrl.setValue('');
    if (this.editAuthorInput) {
      this.editAuthorInput.nativeElement.value = '';
    }
  }

  removeAuthorFromEdit(author: any): void {
    const index = this.selectedAuthorsForEdit.findIndex(a => (a._id || a.id) === (author._id || author.id));
    if (index >= 0) {
      this.selectedAuthorsForEdit.splice(index, 1);
      this.bookForm.authors = this.selectedAuthorsForEdit.map(a => a._id || a.id);
    }
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
    // Populate selected authors for edit autocomplete
    this.selectedAuthorsForEdit = book.authors ? 
      (Array.isArray(book.authors) ? book.authors.filter((a: any) => typeof a === 'object') : []) : [];
    this.editAuthorSearchCtrl.setValue('');
    this.selectedEditImageFile = null;
    this.selectedEditPdfFile = null;
    this.showBookForm = true;
  }

  closeBookForm() {
    this.showBookForm = false;
    this.showDetailsForm = false;
    this.editingBook = null;
    this.newlyCreatedBook = null;
    this.selectedImageFile = null;
    this.selectedPdfFile = null;
    this.selectedEditImageFile = null;
    this.selectedEditPdfFile = null;
  }

  onImageFileSelected(event: any, isEdit: boolean = false) {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        this.toastService.error('Image file too large. Maximum size is 2MB.');
        event.target.value = ''; // Clear the input
        return;
      }
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        this.toastService.error('Only JPG, JPEG, and PNG images are allowed.');
        event.target.value = ''; // Clear the input
        return;
      }
      if (isEdit) {
        this.selectedEditImageFile = file;
      } else {
        this.selectedImageFile = file;
      }
    }
  }

  onPdfFileSelected(event: any, isEdit: boolean = false) {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.toastService.error('PDF file too large. Maximum size is 5MB.');
        event.target.value = ''; // Clear the input
        return;
      }
      // Check file type
      if (file.type !== 'application/pdf') {
        this.toastService.error('Only PDF files are allowed.');
        event.target.value = ''; // Clear the input
        return;
      }
      if (isEdit) {
        this.selectedEditPdfFile = file;
      } else {
        this.selectedPdfFile = file;
      }
    }
  }

  closeDetailsForm() {
    this.showDetailsForm = false;
    this.newlyCreatedBook = null;
    this.loadBooks(); // Refresh the book list
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

  // For required form (step 1)
  onRequiredAuthorSelect(authorId: string) {
    if (!this.requiredForm.authors) {
      this.requiredForm.authors = [];
    }
    const index = this.requiredForm.authors.indexOf(authorId);
    if (index > -1) {
      this.requiredForm.authors.splice(index, 1);
    } else {
      this.requiredForm.authors.push(authorId);
    }
  }

  isRequiredAuthorSelected(authorId: string): boolean {
    return this.requiredForm.authors && this.requiredForm.authors.includes(authorId);
  }

  // For required form (step 1) - category selection
  onRequiredCategorySelect(categoryId: string) {
    if (!this.requiredForm.categories) {
      this.requiredForm.categories = [];
    }
    const index = this.requiredForm.categories.indexOf(categoryId);
    if (index > -1) {
      this.requiredForm.categories.splice(index, 1);
    } else {
      this.requiredForm.categories.push(categoryId);
    }
  }

  isRequiredCategorySelected(categoryId: string): boolean {
    return this.requiredForm.categories && this.requiredForm.categories.includes(categoryId);
  }

  // For details form (step 2)
  onDetailsCategorySelect(categoryId: string) {
    if (!this.detailsForm.categories) {
      this.detailsForm.categories = [];
    }
    const index = this.detailsForm.categories.indexOf(categoryId);
    if (index > -1) {
      this.detailsForm.categories.splice(index, 1);
    } else {
      this.detailsForm.categories.push(categoryId);
    }
  }

  isDetailsCategorySelected(categoryId: string): boolean {
    return this.detailsForm.categories && this.detailsForm.categories.includes(categoryId);
  }

  // Step 1: Submit required fields to create book
  submitRequiredForm() {
    // Validation
    if (!this.requiredForm.title || !this.requiredForm.title.trim()) {
      this.toastService.warning('Title is required');
      return;
    }

    if (this.requiredForm.price < 0) {
      this.toastService.warning('Price must be 0 or greater');
      return;
    }

    if (this.requiredForm.stock < 0) {
      this.toastService.warning('Stock must be 0 or greater');
      return;
    }

    if (!this.requiredForm.authors || this.requiredForm.authors.length === 0) {
      this.toastService.warning('At least one author is required');
      return;
    }

    if (!this.requiredForm.description || !this.requiredForm.description.trim()) {
      this.toastService.warning('Description is required');
      return;
    }

    if (!this.requiredForm.categories || this.requiredForm.categories.length === 0) {
      this.toastService.warning('At least one category is required');
      return;
    }

    if (!this.requiredForm.language || !this.requiredForm.language.trim()) {
      this.toastService.warning('Language is required');
      return;
    }

    if (!this.selectedPdfFile) {
      this.toastService.warning('Book PDF file is required');
      return;
    }

    // Prepare required data
    const requiredData: any = {
      title: this.requiredForm.title.trim(),
      price: parseFloat(this.requiredForm.price),
      stock: parseInt(this.requiredForm.stock),
      authors: this.requiredForm.authors,
      description: this.requiredForm.description.trim(),
      categories: this.requiredForm.categories,
      language: this.requiredForm.language.trim(),
      isActive: this.requiredForm.isActive
    };

    // Create book with required fields
    this.bookService.createBook(requiredData).subscribe({
      next: (response) => {
        // Store the newly created book
        this.newlyCreatedBook = response.book || response;
        const bookId = this.newlyCreatedBook._id || this.newlyCreatedBook.id;

        // Upload PDF file (required in step 1)
        if (this.selectedPdfFile && bookId) {
          firstValueFrom(this.uploadService.uploadPdf(bookId, this.selectedPdfFile))
            .then(() => {
              console.log('PDF uploaded successfully');
              // Close the required form and show details form
              this.showBookForm = false;
              this.showDetailsForm = true;
              this.toastService.success('Book created successfully! Now you can add optional details.');
            })
            .catch((err) => {
              console.error('Error uploading PDF:', err);
              let errorMsg = 'Failed to upload PDF';
              if (err.error?.message) {
                errorMsg = err.error.message;
              } else if (err.error?.error) {
                errorMsg = err.error.error;
              } else if (typeof err.error === 'string') {
                errorMsg = err.error;
              } else if (err.message) {
                errorMsg = err.message;
              }
              this.toastService.error(`PDF upload failed: ${errorMsg}`);
              // Still proceed to step 2
              this.showBookForm = false;
              this.showDetailsForm = true;
            });
        } else {
          // Close the required form and show details form
          this.showBookForm = false;
          this.showDetailsForm = true;
          this.toastService.success('Book created successfully! Now you can add optional details.');
        }
      },
      error: (err) => {
        let errorMsg = 'Failed to create book';
        if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (typeof err.error === 'string') {
          errorMsg = err.error;
        } else if (err.message) {
          errorMsg = err.message;
        }
        this.toastService.error(errorMsg);
        console.error('Error creating book:', err);
      }
    });
  }

  // Step 2: Submit optional details to update the book
  submitDetailsForm() {
    if (!this.newlyCreatedBook) {
      this.toastService.error('Error: Book not found. Please try again.');
      this.closeDetailsForm();
      return;
    }

    // Prepare details data (Step 2: isbn, sku, publisher, publishedAt, cover image)
    const detailsData: any = {};

    if (this.detailsForm.isbn) detailsData.isbn = this.detailsForm.isbn.trim();
    if (this.detailsForm.sku) detailsData.sku = this.detailsForm.sku.trim();
    if (this.detailsForm.publisher) detailsData.publisher = this.detailsForm.publisher.trim();
    if (this.detailsForm.publishedAt) detailsData.publishedAt = new Date(this.detailsForm.publishedAt).toISOString();

    // Initialize image object if image file is selected (prevents backend error)
    if (this.selectedImageFile && !detailsData.image) {
      detailsData.image = {};
    }

    // Update the book with details
    const bookId = this.newlyCreatedBook._id || this.newlyCreatedBook.id;
    if (!bookId) {
      this.toastService.error('Error: Book ID not found. Please try again.');
      return;
    }

    // Check if there's any data to update or image to upload
    const hasDataToUpdate = Object.keys(detailsData).length > 0;
    const hasImageToUpload = this.selectedImageFile !== null;

    if (!hasDataToUpdate && !hasImageToUpload) {
      // No changes, just close the form
      this.toastService.info('No changes to save.');
      this.closeDetailsForm();
      this.loadBooks();
      return;
    }

    // If there's data to update, send the update request
    if (hasDataToUpdate) {
      this.bookService.updateBook(bookId, detailsData).subscribe({
        next: (response) => {
          // Upload cover image if selected
          if (this.selectedImageFile) {
            firstValueFrom(this.uploadService.uploadImage(bookId, this.selectedImageFile))
              .then(() => {
                console.log('Cover image uploaded successfully');
                this.toastService.success('Book details and cover image updated successfully!');
                this.closeDetailsForm();
                this.loadBooks();
              })
              .catch((err) => {
                console.error('Error uploading image:', err);
                let errorMsg = 'Failed to upload image';
                if (err.error?.message) {
                  errorMsg = err.error.message;
                } else if (err.error?.error) {
                  errorMsg = err.error.error;
                } else if (typeof err.error === 'string') {
                  errorMsg = err.error;
                } else if (err.message) {
                  errorMsg = err.message;
                }
                this.toastService.error(`Cover image upload failed: ${errorMsg}`);
                this.closeDetailsForm();
                this.loadBooks();
              });
          } else {
            this.toastService.success('Book details updated successfully!');
            this.closeDetailsForm();
            this.loadBooks();
          }
        },
        error: (err) => {
          let errorMsg = 'Failed to update book details';
          if (err.error?.message) {
            errorMsg = err.error.message;
          } else if (typeof err.error === 'string') {
            errorMsg = err.error;
          } else if (err.message) {
            errorMsg = err.message;
          }
          this.toastService.error(errorMsg);
          console.error('Error updating book details:', err);
        }
      });
    } else if (hasImageToUpload) {
      // Only image to upload, no other data
      firstValueFrom(this.uploadService.uploadImage(bookId, this.selectedImageFile!))
        .then(() => {
          console.log('Cover image uploaded successfully');
          this.toastService.success('Cover image uploaded successfully!');
          this.closeDetailsForm();
          this.loadBooks();
        })
        .catch((err) => {
          console.error('Error uploading image:', err);
          let errorMsg = 'Failed to upload image';
          if (err.error?.message) {
            errorMsg = err.error.message;
          } else if (err.error?.error) {
            errorMsg = err.error.error;
          } else if (typeof err.error === 'string') {
            errorMsg = err.error;
          } else if (err.message) {
            errorMsg = err.message;
          }
          this.toastService.error(`Cover image upload failed: ${errorMsg}`);
          this.closeDetailsForm();
          this.loadBooks();
        });
    }
  }

  // For editing existing books (keep the old form)
  submitBookForm() {
    if (!this.bookForm.title || !this.bookForm.title.trim()) {
      this.toastService.warning('Title is required');
      return;
    }

    if (this.bookForm.price < 0) {
      this.toastService.warning('Price must be 0 or greater');
      return;
    }

    if (this.bookForm.stock < 0) {
      this.toastService.warning('Stock must be 0 or greater');
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

    if (this.bookForm.isbn) formData.isbn = this.bookForm.isbn.trim();
    if (this.bookForm.sku) formData.sku = this.bookForm.sku.trim();
    if (this.bookForm.publisher) formData.publisher = this.bookForm.publisher.trim();
    if (this.bookForm.language) formData.language = this.bookForm.language.trim();
    if (this.bookForm.publishedAt) formData.publishedAt = new Date(this.bookForm.publishedAt).toISOString();
    if (this.bookForm.authors && this.bookForm.authors.length > 0) formData.authors = this.bookForm.authors;
    if (this.bookForm.categories && this.bookForm.categories.length > 0) formData.categories = this.bookForm.categories;

    // Initialize image object if image file is selected (prevents backend error)
    if (this.selectedEditImageFile && !formData.image) {
      formData.image = {};
    }

    const bookId = this.editingBook._id || this.editingBook.id;
    if (!bookId) {
      this.toastService.error('Error: Book ID not found. Please try again.');
      return;
    }

    // Update existing book
    this.bookService.updateBook(bookId, formData).subscribe({
      next: (response) => {
        let uploadPromises: Promise<any>[] = [];

        // Upload image if selected
        if (this.selectedEditImageFile) {
          const imageUpload = firstValueFrom(this.uploadService.uploadImage(bookId, this.selectedEditImageFile))
            .then(() => {
              console.log('Image uploaded successfully');
              this.toastService.success('Image uploaded successfully!');
            })
            .catch((err) => {
              console.error('Error uploading image:', err);
              let errorMsg = 'Failed to upload image';
              if (err.error?.message) {
                errorMsg = err.error.message;
              } else if (err.error?.error) {
                errorMsg = err.error.error;
              } else if (typeof err.error === 'string') {
                errorMsg = err.error;
              } else if (err.message) {
                errorMsg = err.message;
              }
              this.toastService.error(`Image upload failed: ${errorMsg}`);
            });
          uploadPromises.push(imageUpload);
        }

        // Upload PDF if selected
        if (this.selectedEditPdfFile) {
          const pdfUpload = firstValueFrom(this.uploadService.uploadPdf(bookId, this.selectedEditPdfFile))
            .then(() => {
              console.log('PDF uploaded successfully');
              this.toastService.success('PDF uploaded successfully!');
            })
            .catch((err) => {
              console.error('Error uploading PDF:', err);
              let errorMsg = 'Failed to upload PDF';
              if (err.error?.message) {
                errorMsg = err.error.message;
              } else if (err.error?.error) {
                errorMsg = err.error.error;
              } else if (typeof err.error === 'string') {
                errorMsg = err.error;
              } else if (err.message) {
                errorMsg = err.message;
              }
              this.toastService.error(`PDF upload failed: ${errorMsg}`);
            });
          uploadPromises.push(pdfUpload);
        }

        // Wait for all uploads to complete
        Promise.all(uploadPromises).finally(() => {
          this.toastService.success('Book updated successfully!');
          this.closeBookForm();
          this.loadBooks();
        });
      },
      error: (err) => {
        let errorMsg = 'Failed to update book';
        if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (typeof err.error === 'string') {
          errorMsg = err.error;
        } else if (err.message) {
          errorMsg = err.message;
        }
        this.toastService.error(errorMsg);
        console.error('Error updating book:', err);
      }
    });
  }

  deleteBook(book: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Book',
        message: `Are you sure you want to delete "${book.title}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.bookService.deleteBook(book._id || book.id).subscribe({
          next: (response) => {
            this.toastService.success('Book deleted successfully!');
            this.loadBooks();
          },
          error: (err) => {
            this.toastService.error(err.error?.message || 'Failed to delete book');
            console.error('Error deleting book:', err);
          }
        });
      }
    });
  }
}

