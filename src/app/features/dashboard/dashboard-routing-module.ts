import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './dashboard';
import { DashboardLayout } from './layout/dashboard-layout/dashboard-layout';
import { Home } from './pages/home/home';
import { Orders } from './pages/orders/orders';
import { Books } from './pages/books/books';
import { ReviewAuthorsComponent } from '../review-authors/review-authors';

const routes: Routes = [
  {
    path: '',
    component: DashboardLayout,
    children: [
      { path: '', component: Home },
      { path: 'orders', component: Orders },
      { path: 'manage-books', component: Books },
      { path: 'review-authors', component: ReviewAuthorsComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
