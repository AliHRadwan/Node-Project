import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { Discount } from './components/discount/discount';



@NgModule({
  declarations: [
    Header,
    Footer,
    Discount
  ],
  imports: [
    CommonModule
  ],
   exports: [Header, Footer , Discount]  
})
export class CoreModule { }
