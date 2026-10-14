import { OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import { ChangeDetectorRef } from '@angular/core';


interface Employee {
  employee_id?: number;
  user_id?: number;
  job_scope?: string;
  address?: string;
  emergency_contact?: string;
  hourly_rate?: number;
}

interface User {
  user_id?: number;
  name?: string;
  surname?: string;
  email_address?: string;
  phone_number?: string;
  image?: string;
  role_id?: number;
  title_id?: number;
  uuid?: string;
  is_employee?: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  form: FormGroup;
  loading = true;
  saving = false;
  uploading = false;

  // Placeholder image
  imgSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjQ0NDQ0NDIi8+Cjx0ZXh0IHg9Ijc1IiB5PSI3NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjRkZGRkZGIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';
  imageUrl = '';

  currentEmployee: Employee | null = null;
  currentUser: User | null = null;
  employeeId: number | null = null;
  userId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private authService: AuthService,
    private apiService: ApiService,
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef

  ) {
    this.form = this.fb.group({
      email_address: ['', [Validators.required, Validators.email]],
      emergency_contact: ['', [Validators.required, Validators.minLength(10)]],
      address: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  async ngOnInit() {
    await this.loadEmployeeData();
  }

  private async loadEmployeeData() {
    try {
      // Get minimal employee data from auth service
      const authData = await firstValueFrom(this.authService.getEmployee());
      console.log('Auth service data:', authData);

      if (authData && authData.employee_id) {
        this.employeeId = authData.employee_id;

        // Load full profile data from API using the employee_id
        await this.loadProfile();
      } else {
        this.loading = false;
        this.showToast('Please sign in to access your profile', 'warning');
      }
    } catch (error) {
      console.error('Error loading employee data:', error);
      this.loading = false;
      this.showToast('Failed to load profile data', 'danger');
    }
  }

  private async loadProfile() {
    if (!this.employeeId) {
      this.loading = false;
      return;
    }

    try {
      // Use the profile endpoint that returns combined employee + user data
      const profileResponse: any = await firstValueFrom(
        this.apiService.get_employee_profile(this.employeeId)
      );

      console.log('Profile API response:', profileResponse);

      if (profileResponse && !profileResponse.error && profileResponse.length > 0) {
        const profileData = profileResponse[0];
        this.currentEmployee = profileData;
        this.currentUser = profileData;
        this.userId = profileData.user_id || null;

        if (profileData.image) {
          this.imageUrl = profileData.image;
        }

        this.populateForm();
        this.loading = false;
      } else {
        // Fallback to the old method if profile endpoint fails
        await this.loadEmployeeAndUserSeparately();
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Fallback to the old method if profile endpoint fails
      await this.loadEmployeeAndUserSeparately();
    }
  }

  private async loadEmployeeAndUserSeparately() {
    try {
      // Use the get_employee_info endpoint to fetch employee data
      const employeeResponse: any = await firstValueFrom(
        this.apiService.get_employee_info(this.employeeId!)
      );

      console.log('Employee API response:', employeeResponse);

      if (employeeResponse && !employeeResponse.error && employeeResponse.length > 0) {
        const employeeData = employeeResponse[0];
        this.currentEmployee = employeeData;
        this.userId = employeeData.user_id || null;

        // If we have a user_id, fetch user details for email and image
        if (this.userId) {
          try {
            const userResponse: any = await firstValueFrom(
              this.apiService.get_user(this.userId)
            );

            console.log('User API response:', userResponse);

            if (userResponse && !userResponse.error) {
              this.currentUser = userResponse;
              if (userResponse.image) {
                this.imageUrl = userResponse.image;
              }
            }
          } catch (userError) {
            console.error('Error fetching user data:', userError);
          }
        }

        this.populateForm();
      }
    } catch (error) {
      console.error('Error loading employee data:', error);
      this.showToast('Failed to load profile data', 'danger');
    } finally {
      this.loading = false;
    }
  }

  private createProfileFromAuthData() {
    // Get basic data from auth service
    this.authService.getEmployee().subscribe(authData => {
      console.log('Auth service fallback data:', authData);

      if (authData) {
        this.currentEmployee = {
          employee_id: authData.employee_id,
        };

        // Try to get user data by phone number if we don't have user_id
        if (authData.phone) {
          this.getUserByPhone(authData.phone);
        } else {
          this.loading = false;
        }
      } else {
        this.loading = false;
      }
    });
  }

  private async getUserByPhone(phone: string) {
    try {
      // Try to find user by phone number
      const userResponse: any = await firstValueFrom(
        this.apiService.get_user_by_phone(phone)
      );

      console.log('User by phone API response:', userResponse);

      if (userResponse && !userResponse.error && userResponse.length > 0) {
        this.currentUser = userResponse[0];
        this.userId = userResponse[0].user_id;

        if (userResponse[0].image) {
          this.imageUrl = userResponse[0].image;
        }

        // Now try to get employee data using the user_id
        await this.getEmployeeByUserId(this.userId);
      } else {
        this.loading = false;
      }
    } catch (error) {
      console.error('Error fetching user by phone:', error);
      this.loading = false;
    }
  }

  private async getEmployeeByUserId(userId: number) {
    try {
      // Try to get employee data by user_id
      const employeeResponse: any = await firstValueFrom(
        this.apiService.get_employee_by_user_id(userId)
      );

      console.log('Employee by user ID API response:', employeeResponse);

      if (employeeResponse && !employeeResponse.error && employeeResponse.length > 0) {
        const employeeData = employeeResponse[0];
        this.currentEmployee = { ...this.currentEmployee, ...employeeData };
        this.employeeId = employeeData.employee_id;
      }

      this.populateForm();
      this.loading = false;
    } catch (error) {
      console.error('Error fetching employee by user ID:', error);
      this.loading = false;
    }
  }

  private populateForm() {
    // Use user data for email and phone, employee data for emergency contact and address
    this.form.patchValue({
      email_address: this.currentUser?.email_address || '',
      phone_number: this.currentUser?.phone_number || '',
      emergency_contact: this.currentEmployee?.emergency_contact || '',
      address: this.currentEmployee?.address || ''
    });
  }

 async save() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    this.showToast('Please fill all required fields', 'warning');
    return;
  }

  this.saving = true;
  const loading = await this.loadingCtrl.create({ message: 'Saving...' });
  await loading.present();

  try {
    const formData = this.form.value;

    // Update user data if we have a user ID (for email and phone)
    if (this.userId) {
      const userPayload = {
        email_address: formData.email_address,
        phone_number: formData.phone_number
      };

      const userResult = await firstValueFrom(
        this.apiService.update_user(this.userId, userPayload)
      );

      if (userResult && userResult.error) {
        throw new Error(userResult.error);
      }
    }

    // Update employee data if we have an employee ID
    if (this.employeeId) {
      const employeePayload = {
        emergency_contact: formData.emergency_contact,
        address: formData.address
      };

      // Use the endpoint for updating employee data
      const employeeResult = await firstValueFrom(
        this.apiService.update_employee(this.employeeId, employeePayload)
      );

      if (employeeResult && employeeResult.error) {
        throw new Error(employeeResult.error);
      }
    }

    // Update local data
    if (this.currentUser) {
      this.currentUser.email_address = formData.email_address;
      this.currentUser.phone_number = formData.phone_number;
    }
    if (this.currentEmployee) {
      this.currentEmployee.emergency_contact = formData.emergency_contact;
      this.currentEmployee.address = formData.address;
    }

    this.showToast('Profile saved successfully!', 'success');
  } catch (error: any) {
    console.error('Save error:', error);
    this.showToast('Error saving profile: ' + (error?.message || 'Unknown error'), 'danger');
  } finally {
    this.saving = false;
    await loading.dismiss();
  }
}

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  async onAvatarPicked(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    this.uploading = true;

    try {
      // Upload file
      const publicUrl = await this.supabaseService.uploadFileToStorage(file, 'images');

      // Update DB
      await this.supabaseService.update_profile_pic(this.currentUser!.user_id!, publicUrl);

      // Update local state
      this.imageUrl = publicUrl;
      if (this.currentUser) {
        this.currentUser.image = publicUrl;
      }

      // Update auth cache
      const currentUser = this.authService.user;
      if (currentUser) {
        currentUser.image = publicUrl;
        this.authService.setUser(currentUser);
      }

      // Force Angular to detect changes
      this.cdr.detectChanges();

      // Show success toast
      this.showToast('Profile picture updated successfully!', 'success');
    } catch (err: any) {
      console.error('Error updating avatar:', err);
      this.showToast(err.message || 'Error updating profile picture', 'danger');
    } finally {
      this.uploading = false;
    }
  }



  async removeAvatar() {
    if (!this.userId) return;

    this.uploading = true;

    try {
      // Reset image to NULL in DB
      await this.supabaseService.update_profile_pic(this.userId, null);

      // Update local state
      this.imageUrl = '';
      if (this.currentUser) {
        this.currentUser.image = null as any;
      }

      // Update auth cache
      const currentUser = this.authService.user;
      if (currentUser) {
        currentUser.image = null as any;
        this.authService.setUser(currentUser);
      }

      this.showToast('Profile picture removed successfully', 'success');
    } catch (err: any) {
      console.error('Error removing avatar:', err);
      this.showToast(err.message || 'Error removing profile picture', 'danger');
    } finally {
      this.uploading = false;
    }
  }





  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
