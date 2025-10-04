import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: "",
        loadComponent: () => import("./layout/admin-layout/admin-layout").then(c => c.AdminLayout),
        children: [
            {
                path: "profile",
                loadComponent: () => import("./pages/student-profile/student-profile").then(c => c.StudentProfile),
            },
            {
                path: "requests",
                loadComponent: () => import("./pages/admin-auth-request/admin-auth-request").then(c => c.AdminAuthRequest)
            },
            {
                path: "course-list",
                loadComponent: () => import("./pages/admin-courses/admin-courses").then(c => c.AdminCourses)
            },
        ]
    },
    {
        path: "admin/profile",
        loadComponent: () => import("./pages/admin-profile/admin-profile").then(c => c.AdminProfile),
    },
    {
        path: "courses",
        loadComponent: () => import("./pages/courses-list/courses-list").then(c => c.CoursesList)
    },
    {
        path: "login",
        loadComponent: () => import("./pages/login/login").then(c => c.Login),
        data: { isFaculty: false }
    },
    {
        path: "admin/login",
        loadComponent: () => import("./pages/login/login").then(c => c.Login),
        data: { isFaculty: true }
    },
    {
        path: "signup",
        loadComponent: () => import("./pages/signup/signup").then(c => c.Signup),
        data: { isFaculty: false }
    },
    {
        path: "admin/signup",
        loadComponent: () => import("./pages/signup/signup").then(c => c.Signup),
        data: { isFaculty: true }
    }
];

// export const routes: Routes = [
//   // Student Signup Route
//   { 
//     path: 'signup', 
//     component: Signup,
//     data: { isFaculty: false } // Pass data to the component
//   },
//   // Faculty Signup Route
//   { 
//     path: 'faculty-signup', // Or whatever path you want
//     component: Signup,
//     data: { isFaculty: true } // Pass data to the component
//   },
// ];
