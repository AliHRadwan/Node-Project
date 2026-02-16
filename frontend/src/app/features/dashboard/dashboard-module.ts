import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing-module';
import { Dashboard } from './dashboard';
import { DashboardLayout } from './layout/dashboard-layout/dashboard-layout';
import { Sidebar } from './sidebar/sidebar';
import { Orders } from './pages/orders/orders';
import { Books } from './pages/books/books';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { Home } from './pages/home/home';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '../../core/core-module';
import { ReviewAuthorsComponent } from '../review-authors/review-authors';
import { SharedModule } from '../../shared/shared-module';




@NgModule({
  declarations: [
    Dashboard,
    DashboardLayout,
    Sidebar,
    Orders,
    Home,
    Books,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
    RouterModule,
    SharedModule,
  ]
})
export class DashboardModule { }

