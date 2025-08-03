import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: "",
        loadComponent: () => import("./layout/admin-layout/admin-layout").then(c => c.AdminLayout),
        children: [
            {
                path: "",
                loadComponent: () => import("./pages/admin-courses/admin-courses").then(c => c.AdminCourses)
            }
        ]
    }
];
