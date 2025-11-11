import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { Discount } from './components/discount/discount';

import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [
    Header,
    Footer,
    Discount
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatBadgeModule,
    MatIconModule,
    MatButtonModule
  ],
   exports: [Header, Footer , Discount]  
})
export class CoreModule { }
