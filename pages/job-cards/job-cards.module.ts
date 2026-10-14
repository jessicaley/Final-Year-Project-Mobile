import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JobCardsPageRoutingModule } from './job-cards-routing.module';

import { JobCardsPage } from './job-cards.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JobCardsPageRoutingModule
  ],
  declarations: [JobCardsPage]
})
export class JobCardsPageModule {}
