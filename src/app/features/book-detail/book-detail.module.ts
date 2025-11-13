import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { CoreModule } from '../../core/core-module';
import { BookDetailComponent } from './book-detail';

const routes: Routes = [
  { path: ':id', component: BookDetailComponent }
];

@NgModule({
  declarations: [BookDetailComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    CoreModule
  ]
})
export class BookDetailModule {}

