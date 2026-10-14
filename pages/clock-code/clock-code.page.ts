// src/app/pages/clock-code/clock-code.page.ts
import { Component } from '@angular/core';
import { ModalController, LoadingController, ToastController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-clock-code',
  standalone: false,
  templateUrl: 'clock-code.page.html',
  styleUrls: ['clock-code.page.scss'],
})
export class ClockCodePage {
  clockCode: string = '';
  type: 'clock_in' | 'clock_out' = 'clock_in';
  isSubmitting = false;

  constructor(
    private modalCtrl: ModalController,
    private api: ApiService,
    private auth: AuthService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  handleInput(event: any) {
    this.clockCode = event.target.value.replace(/\D/g, '').substring(0, 6);
  }


  async submit() {
    if (this.clockCode.length !== 6) {
      this.showToast('Please enter a 6-digit code');
      return;
    }

    this.isSubmitting = true;
    const loading = await this.loadingCtrl.create({
      message: 'Verifying code...'
    });
    await loading.present();

    try {
      const employeeId = this.auth.getEmployeeId();
      if (!employeeId) {
        throw new Error('Employee ID not found. Please log in again.');
      }

      await this.api.verifyClockCode(
        parseInt(this.clockCode),
        this.type,
        employeeId
      ).toPromise();

      this.showToast(`${this.type === 'clock_in' ? 'Clock In' : 'Clock Out'} successful!`);
      this.modalCtrl.dismiss({ success: true });
    } catch (error: any) {
      console.error('Verification failed:', error);
      this.showToast(error.message || 'Invalid or expired code. Please try again.');
    } finally {
      this.isSubmitting = false;
      await loading.dismiss();
    }
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }

  cancel() {
    this.modalCtrl.dismiss();
  }


}
