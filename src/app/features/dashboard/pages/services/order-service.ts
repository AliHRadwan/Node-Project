import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GetAllOrdersResponse, SingleOrderResponse } from '../ordersTypes';
import { environment } from '../../../../../environments/environment.prod';



const BASE = `${environment.apiUrl}/api/orders/admin`;

@Injectable({
  providedIn: 'root',
})
export class OrderService {

    constructor(private http: HttpClient) {}
    
    // headers (بديل interseptors)
    private headers(): HttpHeaders {
    const token = localStorage.getItem('token') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MGJjN2YyMmFhMmNmYTZkNTE1NjFlOCIsImVtYWlsIjoibXVhbGx5eXlAZ21haWwuY29tIiwiYWRkcmVzc2VzIjpbeyJsYWJlbCI6IkhvbWUiLCJmdWxsTmFtZSI6Ik11aGFtbWVkIEFsaSIsInBob25lIjoiMDEyMjk1NTM0OTkiLCJsaW5lMSI6IjE3IE1pc3IgTGVsIFRhJ21lZXIgQmxkZ3MgLCAzcmQgWm9uZSIsImxpbmUyIjoiIiwiY2l0eSI6IlNoZXJhdG9uIiwic3RhdGUiOiJDYWlybyIsImNvdW50cnkiOiJFZ3lwdCIsInBvc3RhbENvZGUiOiIxMTc5OSIsImlzRGVmYXVsdCI6dHJ1ZSwiX2lkIjoiNjkwZTI1ZThjZTVlYWQzNTA2ZTQxOGZlIn1dLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjMxNjQ1ODksImV4cCI6MTc2MzE2ODE4OX0.ZInTrTCW_LjMH-_YrSmOd2vWJnx0nOtZZ3Ubi1tf4Ng'; 
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }

  getAll(){
     const headers = this.headers()
    .set('Cache-Control', 'no-cache')
    .set('Pragma', 'no-cache');
     const params = new HttpParams().set('t', Date.now().toString()); // bust cache

     return this.http.get<GetAllOrdersResponse>(`${BASE}`, { headers, params }); 
  }
  cancel(id: string){
     return this.http.post<SingleOrderResponse>(`${BASE}/${id}/cancel`,    {}, { headers: this.headers() }); 
  }
  markPaid(id: string){ return this.http.post<SingleOrderResponse>(`${BASE}/${id}/paid`,      {}, { headers: this.headers() }); 
  }
  markShipped(id: string){
     return this.http.post<SingleOrderResponse>(`${BASE}/${id}/shipped`,   {}, { headers: this.headers() }); 
  }
  markDelivered(id: string){
     return this.http.post<SingleOrderResponse>(`${BASE}/${id}/delivered`, {}, { headers: this.headers() }); 
  }

}
