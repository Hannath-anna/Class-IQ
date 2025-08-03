import { Injectable } from "@angular/core";
import { environments } from "../../../environments/environment"
import { HttpClient } from "@angular/common/http";
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
}