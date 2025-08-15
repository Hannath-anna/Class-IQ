import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: "",
        loadComponent: () => import("./layout/admin-layout/admin-layout").then(c => c.AdminLayout),
        children: [
            {
                path: "courses",
                loadComponent: () => import("./pages/admin-courses/admin-courses").then(c => c.AdminCourses)
            }
        ]
    },
    {
        path: "login",
        loadComponent: () => import("./pages/login/login").then(c => c.Login),
    },
    {
        path: "signup",
        loadComponent: () => import("./pages/signup/signup").then(c => c.Signup),
    }
];
