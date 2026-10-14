import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClockCodePageRoutingModule } from './clock-code-routing.module';

import { ClockCodePage } from './clock-code.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClockCodePageRoutingModule
  ],
  declarations: [ClockCodePage]
})
export class ClockCodePageModule {}
