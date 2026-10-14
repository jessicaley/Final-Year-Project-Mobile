import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PayslipsPage } from './payslips.page';

const routes: Routes = [
  {
    path: '',
    component: PayslipsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PayslipsPageRoutingModule {}
