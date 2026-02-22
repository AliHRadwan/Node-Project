import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { FormGroup, Validators, ValidatorFn, AbstractControl, FormBuilder } from '@angular/forms';
import { Registerservice } from '../registerService/registerservice'

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register {

  registerForm: FormGroup;
  isLoading = false;
  serverError = '';
  registrationComplete = false;
  registeredEmail = '';
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(private fb: FormBuilder, private RS: Registerservice, private router: Router) {
    this.registerForm = this.fb.group({
      FirstName: ['', [Validators.required, Validators.minLength(2)]],
      LastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.patternValidator(/[a-z]/, 'lowercase'),
        this.patternValidator(/[A-Z]/, 'uppercase'),
        this.patternValidator(/\d/, 'hasNumber'),
      ]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: this.passwordMatchValidator }
    );
  }

  patternValidator(regex: RegExp, errorKey: string): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return null;
      return regex.test(control.value) ? null : { [errorKey]: true };
    };
  }

  passwordMatchValidator(form: FormGroup) {
    const passwordCtrl = form.get('password');
    const confirmCtrl = form.get('confirmPassword');
    const password = passwordCtrl?.value;
    const confirm = confirmCtrl?.value;

    if (confirmCtrl) {
      if (password && confirm && password !== confirm) {
        const existing = confirmCtrl.errors || {};
        confirmCtrl.setErrors({ ...existing, mismatch: true });
      } else {
        if (confirmCtrl.errors && 'mismatch' in confirmCtrl.errors) {
          const { mismatch, ...rest } = confirmCtrl.errors;
          confirmCtrl.setErrors(Object.keys(rest).length ? rest : null);
        }
      }
    }

    return password === confirm ? null : { mismatch: true };
  }

  onSubmit() {
    this.serverError = '';
    if (!this.registerForm.valid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;

    const formData = this.registerForm.value;
    this.RS.userRegisteration(formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.registrationComplete = true;
        this.registeredEmail = formData.email;
      },
      error: (err) => {
        this.isLoading = false;
        const backendMsg = err?.error?.error || err?.message || 'Registration failed. Please try again.';
        this.mapBackendError(backendMsg);
      }
    });
  }

  private mapBackendError(msg: string) {
    const lower = msg.toLowerCase();

    if (lower.includes('email already exists')) {
      this.registerForm.get('email')?.setErrors({ serverError: msg });
      this.registerForm.get('email')?.markAsTouched();
      return;
    }

    if (lower.includes('password') && !lower.includes('confirm')) {
      this.registerForm.get('password')?.setErrors({ serverError: msg });
      this.registerForm.get('password')?.markAsTouched();
      return;
    }

    if (lower.includes('firstname') || lower.includes('first name')) {
      this.registerForm.get('FirstName')?.setErrors({ serverError: msg });
      this.registerForm.get('FirstName')?.markAsTouched();
      return;
    }

    if (lower.includes('lastname') || lower.includes('last name')) {
      this.registerForm.get('LastName')?.setErrors({ serverError: msg });
      this.registerForm.get('LastName')?.markAsTouched();
      return;
    }

    this.serverError = msg;
  }
}
