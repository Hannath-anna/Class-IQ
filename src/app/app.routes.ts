import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: "auth",
        loadComponent: () => import("./layout/admin-layout/admin-layout").then(c => c.AdminLayout),
        children: [
            {
                path: "courses",
                loadComponent: () => import("./pages/admin-courses/admin-courses").then(c => c.AdminCourses)
            }
        ]
    },
    {
        path: "",
        loadComponent: () => import("./pages/login/login").then(c => c.Login),
    }
];
