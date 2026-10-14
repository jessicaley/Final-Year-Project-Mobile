import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { employeeWarning } from 'src/app/models/employee';
import { email } from 'src/app/models/general';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-warnings',
  templateUrl: './warnings.page.html',
  styleUrls: ['./warnings.page.scss'],
  standalone: false,
})
export class WarningsPage implements OnInit {
  employeeWarnings:employeeWarning[] = [];
  filteredWarnings:employeeWarning[] = [];
  employeeId:number;
  email:string;
  isLoading = true;

  constructor(private apiService:ApiService, private auth: AuthService) { }

  ngOnInit() {
    this.auth.getEmployee().subscribe(employee => {
      this.employeeId = employee?.employee_id || null;
      this.email = employee?.email;
    });
    this.loadWarnings();
  }

  async loadWarnings(): Promise<void> {
     try {
    const response = await this.apiService.get_employee_warnings().toPromise();
    this.employeeWarnings = response;
  } catch (err) {
    console.error('Failed to load warnings:', err);
  } finally {
  }
    this.filteredWarnings = this.employeeWarnings.filter(x => x.employee_id == this.employeeId);
    this.filteredWarnings.sort((a, b) => b.employee_warning_id - a.employee_warning_id)
    console.log(this.filteredWarnings);
    this.isLoading = false;

  }

  updateWarning(disputedWarning:employeeWarning) {
    let updatedWarning = new employeeWarning();

    updatedWarning.employee_id = disputedWarning.employee_id;
    updatedWarning.employee_warning_id = disputedWarning.employee_warning_id;
    updatedWarning.employee_warning_type_id = disputedWarning.employee_warning_type_id;
    updatedWarning.reason = disputedWarning.reason;
    updatedWarning.is_disputed = true;

    this.apiService.update_employee_warning(updatedWarning.employee_warning_id, updatedWarning).subscribe({
        next: res => {
          console.log("Warning is disputed");
        },
        error: (error) => {
          console.error("An Error Occoured while disputing the warning");
        }
      });
      this.loadWarnings();

      let newEmail = new email();
    newEmail.to_email = "vaultvisioninf370@gmail.com";
    newEmail.subject = "Warning Dispute";
    newEmail.body = "Good day admin, this email is to notify you that warning #" + disputedWarning.employee_warning_id + " is being disputed.";

    this.apiService.send_email(newEmail).subscribe({
      next: (res) => {
        console.log('Success', 'Email sent successfully');
      },
      error: (err) => {
        console.error('Error', 'Failed to send email');
        console.log(newEmail);
      }
    });
  }
}
