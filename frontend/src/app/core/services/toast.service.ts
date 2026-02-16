import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private defaultConfig: MatSnackBarConfig = {
    duration: 4000,
    horizontalPosition: 'right',
    verticalPosition: 'top'
  };

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Show a success toast message
   */
  success(message: string, action: string = 'Close', duration?: number): void {
    this.show(message, action, 'success', duration);
  }

  /**
   * Show an error toast message
   */
  error(message: string, action: string = 'Close', duration?: number): void {
    this.show(message, action, 'error', duration);
  }

  /**
   * Show a warning toast message
   */
  warning(message: string, action: string = 'Close', duration?: number): void {
    this.show(message, action, 'warning', duration);
  }

  /**
   * Show an info toast message
   */
  info(message: string, action: string = 'Close', duration?: number): void {
    this.show(message, action, 'info', duration);
  }

  /**
   * Show a toast message with custom type
   */
  private show(message: string, action: string, type: ToastType, duration?: number): void {
    const config: MatSnackBarConfig = {
      ...this.defaultConfig,
      duration: duration || this.defaultConfig.duration,
      panelClass: [`toast-${type}`]
    };

    this.snackBar.open(message, action, config);
  }

  /**
   * Dismiss the current toast
   */
  dismiss(): void {
    this.snackBar.dismiss();
  }
}
