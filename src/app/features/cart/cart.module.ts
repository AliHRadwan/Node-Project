import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { CartComponent } from './cart';
import { CoreModule } from "../../core/core-module";
import { FormsModule } from '@angular/forms';
import { PaymentSuccess } from './payment-success/payment-success';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PaymentFailed } from './payment-failed/payment-failed';
import { Payment } from './payment/payment';

const routes: Routes = [
  { path: '', component: CartComponent },
  { path: 'payment', component: Payment },          
  { path: 'payment/success', component: PaymentSuccess }, 
  { path: 'payment/failed', component: PaymentFailed },  
];

@NgModule({
  declarations: [CartComponent, PaymentSuccess, PaymentFailed, Payment],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    CoreModule,
    FormsModule,
    MatFormFieldModule, 
    MatInputModule, 
]
})
export class CartModule { }
