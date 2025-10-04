import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BackendService } from '../../../core/services/backend.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {
  isFaculty: boolean = false;
  signupForm: FormGroup;
  otpForm: FormGroup;
  otpSent = false;
  isLoading = false;
  email: string = "";

  courses: any = ['No Preference'];

  constructor(private route: ActivatedRoute, private cdr: ChangeDetectorRef, private fb: FormBuilder, private backendService: BackendService, private toastr: ToastrService, private router: Router) {
    this.signupForm = this.fb.group({
      fullname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      courseId: [''],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]],
      agreeToTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.isFaculty = !!data['isFaculty'];
    });

    this.route.queryParamMap.subscribe(params => {
      const courseId = params.get('id');
      if (courseId) {
        this.signupForm.patchValue({ courseId });
      } else {
        this.router.navigate(['courses']);
        return;
      }
    }); 
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: any } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword?.hasError('passwordMismatch')) {
      delete confirmPassword.errors?.['passwordMismatch'];
      confirmPassword?.updateValueAndValidity({ onlySelf: true });
    }
    
    return null;
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.toastr.error('Please correct the errors in the form.', 'Invalid Form');
      Object.keys(this.signupForm.controls).forEach(key => {
        this.signupForm.get(key)?.markAsTouched();
      });
      return;
    }
    if (this.isLoading) return

    if (!this.signupForm.value.courseId) {
      this.router.navigate(['courses']);
      return;
    }
    
    this.isLoading = true;
    const formData = this.signupForm.value;    

    this.backendService.sendOtp(formData).subscribe({
      next: (response: any) => {
        this.toastr.success(response.message || 'OTP sent successfully!', 'Check Your Email');
        this.email = this.signupForm.value.email
        this.otpSent = true;
        this.isLoading = false;
        this.signupForm.reset();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'An unknown error occurred.', 'Signup Failed');
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  verifyOtp() {
    if (this.otpForm.invalid) {
      this.toastr.error('Please enter a valid 6-digit OTP.');
      return;
    }

    this.isLoading = true;
    const verificationData = {
      email: this.email,
      otp: this.otpForm.value.otp
    };

    const verificationObservable = this.isFaculty ? this.backendService.verifyAdminOtp(verificationData) : this.backendService.verifyOtp(verificationData);

    verificationObservable.subscribe({
      next: (response: any) => {
        this.toastr.success('Account created successfully!', 'Welcome!');
        this.isLoading = false;
        this.otpSent = false;
        this.otpForm.reset();
        this.email = '';
        this.cdr.markForCheck();
        const loginPath = this.isFaculty ? 'admin/login' : 'login'
        this.router.navigate([loginPath]);
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'Verification failed. Please try again.', 'Error');
        this.isLoading = false;
        this.otpSent = false;
        this.otpForm.reset();
        this.cdr.markForCheck();
      }
    });
  }

  onSubmitFaculty() {
    if (this.signupForm.invalid) {
      this.toastr.error('Please correct the errors in the form.', 'Invalid Form');
      this.signupForm.markAllAsTouched();
      return;
    }
    if (this.isLoading) return;
    
    this.isLoading = true;
    const facultyData = this.signupForm.value; // Exclude the empty 'course' field

    // You would create a new service method for this
    this.backendService.sendFacultyOtp(facultyData).subscribe({
      next: (response: any) => {
        this.toastr.success(response.message || 'OTP sent successfully!', 'Check Your Email');
        this.email = this.signupForm.value.email;
        this.otpSent = true;
        this.isLoading = false;
        this.signupForm.reset();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'An unknown error occurred.', 'Signup Failed');
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}