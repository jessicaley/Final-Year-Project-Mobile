import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TimeLogsPage } from './time-logs.page';

const routes: Routes = [
  {
    path: '',
    component: TimeLogsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TimeLogsPageRoutingModule {}
