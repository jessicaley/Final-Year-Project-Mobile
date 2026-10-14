import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PayslipsPageRoutingModule } from './payslips-routing.module';

import { PayslipsPage } from './payslips.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PayslipsPageRoutingModule
  ],
  declarations: [PayslipsPage]
})
export class PayslipsPageModule {}
