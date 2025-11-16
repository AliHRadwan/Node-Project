import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthorService {
  private readonly API_URL = 'http://localhost:3000/api/authors';

  constructor(private http: HttpClient) {}

  // Fetch all authors
  getAuthors(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL);
  }

  // Fetch a specific author by ID
  getAuthorById(id: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${id}`);
  }
}

