import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClockCodePage } from './clock-code.page';

const routes: Routes = [
  {
    path: '',
    component: ClockCodePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClockCodePageRoutingModule {}
