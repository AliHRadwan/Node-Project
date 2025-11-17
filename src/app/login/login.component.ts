import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../core/services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false,
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;

  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = null;

    const credentials = {
      email: this.email,
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        this.router.navigate(['/']); 
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        
        if (err.status === 401) {
          this.errorMessage = err.error.error; 
        } else if (err.status === 500) {

          this.errorMessage = 'A server error occurred. Please try again later.';
        } else {
          this.errorMessage = 'An unexpected error occurred. Please check your connection.';
        }
        console.error('Login error:', err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}