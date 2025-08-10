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
}