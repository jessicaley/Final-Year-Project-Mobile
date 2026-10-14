import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-job-cards',
  standalone: false,
  templateUrl: './job-cards.page.html',
  styleUrls: ['./job-cards.page.scss'],
})
export class JobCardsPage implements OnInit {
  jobCards: any[] = [];
  selectedFiles: { [key: number]: File } = {};
  employeeId!: number;
  isLoading: boolean = true;

  constructor(
    private api: ApiService,
    private notification: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.getEmployee().subscribe(employee => {
      if (employee?.employee_id) {
        this.employeeId = employee.employee_id;
        this.loadJobCardsWithDetails(employee.employee_id);
      }
    });
  }

  loadJobCardsWithDetails(employeeId: number) {
    this.isLoading = true;
    this.api.getJobCardsForEmployeeWithDetails(employeeId).subscribe({
      next: (res) => {
        console.log('Job cards with details:', res);
        this.jobCards = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load job cards with details', err);
        this.notification.showError('Error', 'Failed to load job cards');
        this.isLoading = false;
      }
    });
  }

  getProcessingJobCards(): any[] {
    return this.jobCards.filter(job => job.job_card_status_id === 1);
  }

  getJobRequestTitle(job: any): string {
    if (job.quotations?.job_request?.title) {
      return job.quotations.job_request.title;
    }
    if (job.quotation?.job_request?.title) {
      return job.quotation.job_request.title;
    }
    return 'No Title';
  }

  getJobRequestDescription(job: any): string {
    if (job.quotations?.job_request?.description) {
      return job.quotations.job_request.description;
    }
    if (job.quotation?.job_request?.description) {
      return job.quotation.job_request.description;
    }
    return 'No description available';
  }

  getJobRequestQuantity(job: any): number {
    if (job.quotations?.job_request?.quantity) {
      return job.quotations.job_request.quantity;
    }
    if (job.quotation?.job_request?.quantity) {
      return job.quotation.job_request.quantity;
    }
    return 0;
  }

  getProgressUrl(job: any): string {
    if (job.quotations?.job_request?.progress_url) {
      return job.quotations.job_request.progress_url;
    }
    if (job.quotation?.job_request?.progress_url) {
      return job.quotation.job_request.progress_url;
    }
    return '';
  }

  getQuotationNumber(job: any): string {
    return job.quotations?.quotation_number || job.quotation?.quotation_number || 'N/A';
  }

  getJobCardMaterials(job: any): any[] {
    return job.job_card_materials || [];
  }

  getJobCardArtisans(job: any): any[] {
    return job.job_card_artisans || [];
  }

  onFileSelected(event: any, jobCardId: number) {
    this.selectedFiles[jobCardId] = event.target.files[0];
  }

  uploadProgress(jobCardId: number) {
    const file = this.selectedFiles[jobCardId];
    if (!file) return this.notification.showError('Error', 'No file selected');

    const job = this.jobCards.find(j => j.job_card_id === jobCardId);
    const hasExistingImage = this.getProgressUrl(job);

    const message = hasExistingImage
      ? 'This will replace the current progress image. Continue?'
      : 'Upload progress image?';

    // Show confirmation dialog
    this.notification.showConfirm(
      'Upload Progress Image',
      message,
      'Upload',
      'Cancel'
    ).then(confirmed => {
      if (confirmed) {
        this.performUpload(jobCardId, file);
      }
    });
  }

  private performUpload(jobCardId: number, file: File) {
    this.api.uploadProgressImage(jobCardId, file).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          const job = this.jobCards.find(j => j.job_card_id === jobCardId);
          const action = this.getProgressUrl(job) ? 'replaced' : 'uploaded';
          this.notification.showSuccess('Success', `Progress image ${action} successfully`);

          // Reload the job cards to show the updated image
          this.loadJobCardsWithDetails(this.employeeId);
          // Clear the selected file
          delete this.selectedFiles[jobCardId];
        } else {
          this.notification.showError('Error', res.detail || 'Upload failed');
        }
      },
      error: (err) => {
        console.error('Upload error:', err);

        let errorMessage = 'Upload failed';
        if (err.status === 400) {
          errorMessage = err.error?.detail || 'Invalid file';
        } else if (err.status === 404) {
          errorMessage = err.error?.detail || 'Job card not found';
        } else if (err.status === 500) {
          errorMessage = err.error?.detail || 'Server error';
        }

        this.notification.showError('Error', errorMessage);
      }
    });
  }

  viewProgressImage(job: any) {
    const progressUrl = this.getProgressUrl(job);
    if (progressUrl) {
      window.open(progressUrl, '_blank');
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return '';
    }
  }

  getStatusTagColor(statusId: number): string {
    return 'primary';
  }

  getStatusText(statusId: number): string {
    return 'In Progress';
  }
}
