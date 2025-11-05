import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing-module';
import { Dashboard } from './dashboard';
import { DashboardLayout } from './layout/dashboard-layout/dashboard-layout';
import { Sidebar } from './sidebar/sidebar';
import { Orders } from './pages/orders/orders';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { Home } from './pages/home/home';


@NgModule({
  declarations: [
    Dashboard,
    DashboardLayout,
    Sidebar,
    Orders,
    Home
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule
  ]
})
export class DashboardModule { }
