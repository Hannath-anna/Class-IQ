import { Injectable } from "@angular/core";
import { environments } from "../../../environments/environment"
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
    providedIn: "root"
})
export class BackendService {
    private apiUrl = `${environments.api_url}/api`;
    constructor(private http: HttpClient) {}

    getCourses(): Observable<any> {
        return this.http.get(`${this.apiUrl}/courses`);
    }

    getCourseInfo(id: any): Observable<any> {
        return this.http.get(`${this.apiUrl}/courses/course?id=${id}`);
    }

    addCourse(courseData: FormData): Observable<any> {
        return this.http.post(`${this.apiUrl}/courses`, courseData);
    }

    updateCourse(id: string, formData: FormData): Observable<any> {
        const params = new HttpParams().set('id', id);
        return this.http.patch(`${this.apiUrl}/courses`, formData, { params });
    }

    updateCourseBlockStatus(id: string, isBlocked: boolean): Observable<any> {
        const params = new HttpParams().set('id', id);
        const body = { isBlocked };
        return this.http.patch(`${this.apiUrl}/courses/block`, body, { params });
    }

    deleteCourse(id: string): Observable<any> {
        const params = new HttpParams().set('id', id);
        return this.http.delete(`${this.apiUrl}/courses`, { params });
    }

    sendOtp(signupData: FormData) {
        return this.http.post(`${this.apiUrl}/auth/otp-request`, signupData)
    }
    
    verifyOtp(data: {email: string, otp: number}) {
        return this.http.post(`${this.apiUrl}/auth/verify-otp`, data)
    }
    
    login(loginData: FormData) {
        return this.http.post(`${this.apiUrl}/auth/login`, loginData)
    }
    
    forgotPasswordRequest(data: any) {
        return this.http.post(`${this.apiUrl}/auth/forget-password`, data)
    }
    
    resetPassword(data: any) {
        return this.http.post(`${this.apiUrl}/auth/reset-password`, data)
    }
    
    getAllUsers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/users`);
    }
    
    blockStudent(id: any, isBlocked: boolean): Observable<any> {
        const params = new HttpParams().set('id', id);
        return this.http.patch(`${this.apiUrl}/users/block`, {isBlocked}, {params});
    }
    
    verifyStudent(id: string) {
        const params = new HttpParams().set('id', id);
        return this.http.patch(`${this.apiUrl}/users/verify`, null, {params});
    }
    
    getProfile(studentid: any): Observable<any> {
        return this.http.get(`${this.apiUrl}/profile?studentid=${studentid}`);
    }
    
    updateProfile(studentid: any, formData: FormData): Observable<any> {
        console.log(studentid);
        
        return this.http.put(`${this.apiUrl}/profile?studentid=${studentid}`, formData);
    }
    
    sendFacultyOtp(signupData: FormData) {
        return this.http.post(`${this.apiUrl}/admin/signup`, signupData)
    }
    
    verifyAdminOtp(data: {email: string, otp: number}) {
        return this.http.post(`${this.apiUrl}/admin/verify-otp`, data)
    }

    adminLogin(loginData: FormData) {
        return this.http.post(`${this.apiUrl}/admin/login`, loginData)
    }
}