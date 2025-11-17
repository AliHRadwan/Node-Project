import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RequestRestoreAccount } from './request-restore-account/request-restore-account';

const routes: Routes = [
  { path: 'request-restore-account', component: RequestRestoreAccount }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
