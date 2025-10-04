import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  public get authToken(): string | null {
    if (isPlatformBrowser(this.platformId)) return localStorage.getItem('authToken');
    return null;
  }

  // Called from your login component on successful login
  login(response: any): void {
    if (isPlatformBrowser(this.platformId)) {
      // clear old session
      this.logout();

      localStorage.setItem('authToken', response.token);
      localStorage.setItem('studentId', response.studentId);
      localStorage.setItem('role', response.role);
      localStorage.setItem('roleId', response.roleId);
    }
  }

  adminLogin(response: any): void {
    if (isPlatformBrowser(this.platformId)) {
      this.logout();
console.log(response);

      localStorage.setItem('admin_authToken', response.token);
      localStorage.setItem('adminId', response.admin.id);
      localStorage.setItem('admin_roleId', response.admin.role_id);
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      ['authToken', 'studentId', 'role', 'roleId', 'admin_authToken', 'adminId', 'admin_roleId'].forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
        }
      });
    }
  }
}