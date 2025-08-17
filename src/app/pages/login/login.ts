import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BackendService } from '../../../core/services/backend.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm: FormGroup;
  forgotPasswordForm: FormGroup;
  resetPasswordForm: FormGroup;
  isLoading = false;
  resetPassword = false;
  showForgotPasswordModal = false;
  forgotPasswordStep: 'enterEmail' | 'enterOtpAndPassword' = 'enterEmail';
  userEmailForReset = '';

  constructor(private cdr: ChangeDetectorRef, private fb: FormBuilder, private backendService: BackendService, private toastr: ToastrService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/)
      ]],
    });

    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetPasswordForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['',[ 
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/)
      ]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.toastr.error('Please enter a valid email and password.');
      return;
    }

    this.isLoading = true;
    const formData = this.loginForm.value;

    this.backendService.login(formData).subscribe({
      next: (response: any) => {
        localStorage.setItem('authToken', response.token);
        this.toastr.success('Welcome back!', 'Login Successful');
        this.isLoading = false;
        this.loginForm.reset();
        this.cdr.markForCheck();
        // this.router.navigate(['/']);
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'An unknown error occurred.', 'Login Failed');
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  openForgotPasswordModal() {
    this.showForgotPasswordModal = true;
    this.forgotPasswordStep = 'enterEmail';
    this.forgotPasswordForm.reset();
    this.resetPasswordForm.reset();
  }

  closeForgotPasswordModal() {
    this.showForgotPasswordModal = false;
  }

  // --- User Submits Email to Get OTP ---
  onForgotPasswordSubmit() {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const email = this.forgotPasswordForm.value.email;

    this.backendService.forgotPasswordRequest({ email }).subscribe({
      next: (response: any) => {
        this.toastr.success(response.message, 'Check Your Email');
        this.forgotPasswordForm.reset()
        this.userEmailForReset = email;
        this.isLoading = false;
        this.forgotPasswordStep = 'enterOtpAndPassword'; 
        this.cdr.markForCheck();
      },
      error: (err) => {
        // Show the success message even on error for security (prevents email guessing)
        this.toastr.success('If an account with that email exists, an OTP has been sent.', 'Check Your Email');
        this.userEmailForReset = email;
        this.isLoading = false;
        this.forgotPasswordStep = 'enterOtpAndPassword';
        this.cdr.markForCheck();
      }
    });
  }

  // --- User Submits OTP and New Password ---
  onResetPasswordSubmit() {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;

    const payload = {
      email: this.userEmailForReset,
      otp: this.resetPasswordForm.value.otp,
      password: this.resetPasswordForm.value.password
    };

    this.backendService.resetPassword(payload).subscribe({
      next: (response: any) => {
        this.toastr.success(response.message, 'Success!');
        this.resetPasswordForm.reset()
        this.closeForgotPasswordModal();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toastr.error(err.error.message, 'Reset Failed');
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
