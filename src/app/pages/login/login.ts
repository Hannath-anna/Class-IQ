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
  isLoading = false;

  constructor(private cdr: ChangeDetectorRef, private fb: FormBuilder, private backendService: BackendService, private toastr: ToastrService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, 
        // Validators.minLength(6)
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
        // On success, store the token and navigate
        console.log(response);
        
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
}
