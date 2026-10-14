import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JobCardsPage } from './job-cards.page';

const routes: Routes = [
  {
    path: '',
    component: JobCardsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JobCardsPageRoutingModule {}
