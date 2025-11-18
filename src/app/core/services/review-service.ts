import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

export interface ReviewsResponse {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
  data: any[];
}

export interface CreateReviewRequest {
  bookId: string;
  rating: number;
  review?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private readonly API_URL = 'http://18.184.165.152:3000/api/reviews';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getBookReviews(
    bookId: string,
    page: number = 1,
    limit: number = 5
  ): Observable<ReviewsResponse> {
    
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ReviewsResponse>(`${this.API_URL}/book/${bookId}`, {
      params,
    });
  }

  createReview(reviewData: CreateReviewRequest): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<any>(this.API_URL, reviewData, { headers });
  }
}