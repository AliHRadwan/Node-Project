import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { Register } from '../registeration/register/register';

const routes: Routes = [
  { path: 'register', component: Register }
];

@NgModule({
  declarations: [
    Register
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class RegisterationModule { }
