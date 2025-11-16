import { Component } from '@angular/core';

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

  onSubmit() {
    console.log('Email:', this.email);
    console.log('Password:', this.password);
    console.log('Remember Me:', this.rememberMe);
  }
}
