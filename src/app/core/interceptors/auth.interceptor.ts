import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Check for token in localStorage (support both 'authToken' and 'auth_token' keys)
    const authToken = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
    
    // If token exists, clone the request and add Authorization header
    if (authToken) {
      // For FormData requests, don't set Content-Type - let browser set it with boundary
      const clonedRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
      return next.handle(clonedRequest);
    }
    
    // If no token, proceed with original request
    return next.handle(request);
  }
}

