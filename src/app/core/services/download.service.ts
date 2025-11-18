import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root',
})
export class DownloadService {
  private readonly API_URL = 'http://18.184.165.152:3000/api/download';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Download a purchased book PDF
   * @param bookId The ID of the book to download
   * @returns Observable that triggers file download
   */
  downloadBook(bookId: string): Observable<Blob> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.get(`${this.API_URL}/book/${bookId}`, {
      headers,
      responseType: 'blob'
    });
  }
}

