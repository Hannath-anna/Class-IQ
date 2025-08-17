import { ChangeDetectorRef, Component } from '@angular/core';
import { BackendService } from '../../../core/services/backend.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-auth-request',
  imports: [
    CommonModule
  ],
  templateUrl: './admin-auth-request.html',
  styleUrl: './admin-auth-request.css'
})
export class AdminAuthRequest {
  users: any[] = [];
  isLoading = true;
  constructor(private backendService: BackendService,private cdr: ChangeDetectorRef, private toastr: ToastrService) {}

  ngOnInit() {
    this.backendService.getAllUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.isLoading = false;
        this.cdr.markForCheck()
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'Failed to load users.');
        this.cdr.markForCheck()
      }
    })
  }

  verifyUser(user: string): void {}

  toggleBlockUser(user: any): void {}
}