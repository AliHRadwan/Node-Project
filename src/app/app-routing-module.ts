import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { 
    path: '', 
    loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule)  // Lazy load HomeModule
  },
  {
    path: 'book',
    loadChildren: () => import('./features/book-detail/book-detail.module').then(m => m.BookDetailModule)
  },
  {
    path: 'cart',
    loadChildren: () => import('./features/cart/cart.module').then(m => m.CartModule)
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard-module').then(m => m.DashboardModule)
  },

  {
    path: 'register',
    loadChildren: () => import('./features/registeration/registeration-module').then(m => m.RegisterationModule)
  },
  {
    path: "password-management",
    loadChildren: () => import('./features/passowrdmanagement/passowrdmanagement-module').then(m => m.PassowrdmanagementModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
