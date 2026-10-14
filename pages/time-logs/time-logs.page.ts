// time-logs.page.ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ModalController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { ClockCodePage } from '../clock-code/clock-code.page';

// Interface matching your table structure
interface TimeLog {
  employee_time_log_id: number;
  clock_in: string; // ISO string
  clock_out: string | null;
  employee_id: number | null;
}

@Component({
  selector: 'app-time-logs',
  standalone: false,
  templateUrl: './time-logs.page.html',
  styleUrls: ['./time-logs.page.scss'],
})
export class TimeLogsPage implements OnInit {
  timeLogs: TimeLog[] = [];
  loading = true;
  error: string | null = null;
  currentDate = new Date();
  employeeId: number | null = null;

  constructor(
    private api: ApiService,
    private modalCtrl: ModalController,
    private auth: AuthService
  ) {}

  async ngOnInit() {
    this.auth.getEmployee().subscribe(employee => {
      this.employeeId = employee?.employee_id || null;
    });
    await this.loadTimeLogs();
  }

// time-logs.page.ts
async loadTimeLogs() {
  this.loading = true;
  this.error = null;

  try {
    if (!this.employeeId) {
      throw new Error('Employee ID not available');
    }

    const response = await this.api.get_employee_time_logs_by_id(this.employeeId).toPromise();

    if (response.error) {
      throw new Error(response.error);
    }

    this.timeLogs = response;
  } catch (err) {
    console.error('Failed to load time logs:', err);
    this.error = 'Failed to load time logs. Please try again.';
  } finally {
    this.loading = false;
  }
}

  formatDateTime(datetime: string): string {
    if (!datetime) return 'N/A';

    const date = new Date(datetime);
    return date.toLocaleString();
  }

  getDuration(clockIn: string, clockOut: string | null): string {
    if (!clockOut) return 'In Progress';

    const start = new Date(clockIn);
    const end = new Date(clockOut);
    const durationMs = end.getTime() - start.getTime();

    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }

  formatStatus(clockOut: string | null): string {
    return clockOut ? 'Completed' : 'Active';
  }

  getStatusColor(clockOut: string | null): string {
    return clockOut ? 'success' : 'warning';
  }

  async openClockCodeModal(type: 'clock_in' | 'clock_out') {
    const modal = await this.modalCtrl.create({
      component: ClockCodePage,
      componentProps: { type },
      cssClass: 'auto-height-modal'
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.success) {
        this.loadTimeLogs();
      }
    });

    await modal.present();
  }
}
