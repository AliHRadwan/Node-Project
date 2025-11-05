import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './dashboard';
import { DashboardLayout } from './layout/dashboard-layout/dashboard-layout';
import { Home } from './pages/home/home';
import { Orders } from './pages/orders/orders';

const routes: Routes = [{ path: '', component: DashboardLayout
 , children: [
    { path: '', component: Home },
    { path: 'orders', component: Orders },
  ]   
 } 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
