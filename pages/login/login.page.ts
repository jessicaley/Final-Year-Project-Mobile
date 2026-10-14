import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { SupabaseService } from 'src/app/services/supabase.service';
import { IonInput } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnDestroy {
  @ViewChild('otpInput', { static: false }) otpInput!: IonInput;

  step: 'phone' | 'code' = 'phone';
  loading = false;
  error: string | null = null;
  phoneStored = '';
  formattedPhone = '';
  resendIn = 0;
  private resendTimer: any;

  phoneForm = this.fb.group({
    phone: ['', [Validators.required, Validators.minLength(10)]]
  });

  codeForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  constructor(
    private fb: FormBuilder,
    private sb: SupabaseService,
    private router: Router,
    private auth: AuthService,
    private api: ApiService
  ) {}

  ngOnDestroy(): void {
    if (this.resendTimer) clearInterval(this.resendTimer);
  }

  async sendCode() {
    if (this.phoneForm.invalid || this.loading) return;
    this.loading = true;
    this.error = null;

    try {
      const rawPhone = this.phoneForm.value.phone!;
      const e164Phone = this.toE164(rawPhone);

      const { error } = await this.sb.sendOtp(e164Phone, true);

      if (error) {
        this.error = 'Failed to send code. Please check your number.';
        return;
      }

      this.phoneStored = e164Phone;
      this.formattedPhone = this.formatDisplayPhone(rawPhone);
      this.step = 'code';
      this.startResendCountdown(30);

      setTimeout(() => this.otpInput.setFocus(), 300);
    } catch (error: any) {
      this.error = 'An unexpected error occurred';
    } finally {
      this.loading = false;
    }
  }

  async verifyCode() {
    if (this.codeForm.invalid || this.loading) return;
    this.loading = true;
    this.error = null;

    try {
      const token = this.codeForm.value.code!;
      const { data, error } = await this.sb.verifyOtp(this.phoneStored, token);

      if (error) {
        this.error = 'Invalid code. Please try again.';
        return;
      }

      if (data?.session) {
        // Get employee ID using phone number
        const employeeId = await this.getEmployeeIdByPhone(this.phoneStored);

        if (!employeeId) {
          throw new Error('Employee profile not found for this phone number');
        }

        // Store employee data in AuthService
        this.auth.setEmployee({
          employee_id: employeeId,
          phone: this.phoneStored
        });

        this.router.navigateByUrl('/home', { replaceUrl: true });
      } else {
        this.error = 'Verification failed. Please try again.';
      }
    } catch (error: any) {
      this.error = error.message || 'An unexpected error occurred';
    } finally {
      this.loading = false;
    }
  }

  private async getEmployeeIdByPhone(phone: string): Promise<number> {
    try {
      console.log('[LoginPage] Fetching employee ID for phone:', phone);
      const response = await this.api.getEmployeeByPhone(phone).toPromise();

      console.log('[LoginPage] API response:', response);

      if (!response || typeof response !== 'object') {
        throw new Error('Invalid API response');
      }

      if (response.employee_id && typeof response.employee_id === 'number') {
        console.log('[LoginPage] Employee found:', response.employee_id);
        return response.employee_id;
      }

      if (response.error) {
        throw new Error(response.error);
      }

      throw new Error('Employee ID not found in response');
    } catch (error) {
      console.error('[LoginPage] Error fetching employee by phone:', error);
      throw new Error('Failed to retrieve employee profile');
    }
  }

  async resend() {
    if (this.resendIn > 0 || !this.phoneStored) return;
    await this.sendCode();
  }

  private startResendCountdown(seconds: number) {
    this.resendIn = seconds;
    if (this.resendTimer) clearInterval(this.resendTimer);

    this.resendTimer = setInterval(() => {
      this.resendIn--;
      if (this.resendIn <= 0) clearInterval(this.resendTimer);
    }, 1000);
  }

private toE164(phone: string): string {
    const digits = phone.replace(/\D/g, '');

    // Handle South African numbers starting with 0
    if (digits.startsWith('0') && digits.length === 10) {
        return '27' + digits.substring(1);
    }

    // Handle other formats
    if (digits.startsWith('27') && digits.length === 11) {
        return digits;
    }

    // Default to adding 27 prefix
    return '27' + digits;
}

  private formatDisplayPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 3) return digits;
    return `${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6, 10)}`;
  }
}
