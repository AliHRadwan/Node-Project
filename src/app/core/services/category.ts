import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly API_URL = 'http://localhost:3000/api/categories';

  constructor(private http: HttpClient) {}

  // Fetch all categories
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL);
  }
}
