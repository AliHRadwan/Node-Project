import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth';

export interface BookFilters {
  page?: number;
  limit?: number;
  sort?: string;
  q?: string;
  author?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
}

export interface BooksResponse {
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  items: any[];
  // Legacy support
  books?: any[];
  total?: number;
  totalPages?: number;
}

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private readonly API_URL = 'http://localhost:3000/api/books';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Fetch all books with pagination and filtering
  getAllBooks(filters: BookFilters = {}): Observable<BooksResponse> {
    let params = new HttpParams();
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.sort) params = params.set('sort', filters.sort);
    if (filters.q) params = params.set('q', filters.q);
    if (filters.author) params = params.set('author', filters.author);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.minPrice !== undefined && filters.minPrice !== null) {
      params = params.set('minPrice', filters.minPrice.toString());
      console.log('Service: Adding minPrice param:', filters.minPrice);
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
      params = params.set('maxPrice', filters.maxPrice.toString());
      console.log('Service: Adding maxPrice param:', filters.maxPrice);
    }
    if (filters.isActive !== undefined) params = params.set('isActive', filters.isActive.toString());

    console.log('Service: Final URL params:', params.toString());
    return this.http.get<BooksResponse>(this.API_URL, { params });
  }

  // Fetch best-selling books
  getBestSellingBooks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/best-selling`);
  }

  // Fetch a specific book by ID
  getBookById(id: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${id}`);
  }

  // Create a new book (requires authentication)
  createBook(bookData: any): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    // If no token, return an error observable
    if (!this.authService.isAuthenticated()) {
      return throwError(() => ({ error: { message: 'Authentication required' } }));
    }
    return this.http.post<any>(this.API_URL, bookData, { headers });
  }

  // Update an existing book (requires authentication)
  updateBook(id: string, bookData: any): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    // If no token, return an error observable
    if (!this.authService.isAuthenticated()) {
      return throwError(() => ({ error: { message: 'Authentication required' } }));
    }
    return this.http.put<any>(`${this.API_URL}/${id}`, bookData, { headers });
  }

  // Delete a book (requires authentication)
  deleteBook(id: string): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    // If no token, return an error observable
    if (!this.authService.isAuthenticated()) {
      return throwError(() => ({ error: { message: 'Authentication required' } }));
    }
    return this.http.delete<any>(`${this.API_URL}/${id}`, { headers });
  }
}
