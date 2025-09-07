import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: "",
        loadComponent: () => import("./layout/admin-layout/admin-layout").then(c => c.AdminLayout),
        children: [
            {
                path: "profile",
                loadComponent: () => import("./pages/student-profile/student-profile").then(c => c.StudentProfile)
            },
            {
                path: "requests",
                loadComponent: () => import("./pages/admin-auth-request/admin-auth-request").then(c => c.AdminAuthRequest)
            },
            {
                path: "courses",
                loadComponent: () => import("./pages/admin-courses/admin-courses").then(c => c.AdminCourses)
            },
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
