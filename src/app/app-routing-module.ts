import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'cart',
    loadChildren: () => import('./features/cart/cart.module').then(m => m.CartModule)
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard-module')
        .then(m => m.DashboardModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
