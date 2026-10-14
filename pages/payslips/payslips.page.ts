import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { employeePayslip, employeeWarning } from 'src/app/models/employee';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-payslips',
  templateUrl: './payslips.page.html',
  styleUrls: ['./payslips.page.scss'],
  standalone: false,
})
export class PayslipsPage implements OnInit {
  employeeWarnings:employeeWarning[] = [];
  employeePayslips:employeePayslip[] = [];
  filteredPayslips:employeePayslip[] = [];
  employeeId:number;
  isLoading = true;

  constructor(private apiService:ApiService, private auth: AuthService) { }

  ngOnInit() {
    this.auth.getEmployee().subscribe(employee => {
      this.employeeId = employee?.employee_id || null;
    });
    this.loadPayslips();
  }

  async loadPayslips(): Promise<void> {
     try {
    const response = await this.apiService.get_employee_payslips().toPromise();
    this.employeePayslips = response;
  } catch (err) {
    console.error('Failed to load time logs:', err);
  } finally {
  }

    // this.apiService.get_employee_payslips().subscribe({
    //   next: (response) => {
    //     this.employeePayslips = [...response] as employeePayslip[];
    //   },
    //   error: (err) => {
    //     console.error('Error loading payslips:', err);
    //   }
    // });

    this.filteredPayslips = this.employeePayslips.filter(x => x.employee_id == this.employeeId);
    this.filteredPayslips.sort((a, b) => b.employee_pay_slip_id - a.employee_pay_slip_id)
    console.log(this.filteredPayslips);
    this.isLoading = false;
  }

}
