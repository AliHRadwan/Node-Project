import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth';
import { ToastService } from '../services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    this.toastService.warning('Please login to access the cart', 'Login')
      .onAction().subscribe(() => {
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      });

    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}

