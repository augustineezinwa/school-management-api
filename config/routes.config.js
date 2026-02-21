module.exports = {
    basePath: "/api",
    routes: [
        // Auth / token
        { method: "post", path: "/auth/login", target: "user.login" },
        { method: "post", path: "/tokens/short", target: "token.v1_createShortToken" },

        // Users
        { method: "post", path: "/users", target: "user.createUser" },
        { method: "patch", path: "/users/change-password", target: "user.changePassword" },
        { method: "patch", path: "/users/:id", target: "user.manageUserById" },
        { method: "patch", path: "/users/:id/assign-school", target: "user.assignAdminToSchool" },

        // Schools
        { method: "post", path: "/schools", target: "school.createSchool" },
        { method: "get", path: "/schools", target: "school.getSchools" },
        { method: "get", path: "/schools/:id", target: "school.getSchoolById" },
        { method: "put", path: "/schools/:id", target: "school.updateSchoolById" },
        { method: "delete", path: "/schools/:id", target: "school.deleteSchoolById" },
        { method: "patch", path: "/schools/:id/profile", target: "school.updateSchoolProfile" },

        // Classrooms
        { method: "post", path: "/classrooms", target: "classroom.createClassroom" },
        { method: "patch", path: "/classrooms/:id", target: "classroom.manageClassroomById" },
        { method: "delete", path: "/classrooms/:id", target: "classroom.deleteClassroomById" },
        { method: "get", path: "/schools/:schoolId/classrooms", target: "classroom.getClassroomsBySchoolId" },

        // Students
        { method: "post", path: "/students", target: "student.enrollStudent" },
        { method: "get", path: "/students", target: "student.getStudents" },
        { method: "get", path: "/students/:id", target: "student.getStudentById" },
        { method: "patch", path: "/students/:id", target: "student.updateStudentProfileById" },
        { method: "delete", path: "/students/:id", target: "student.deleteStudentById" },
        { method: "patch", path: "/students/:id/transfer", target: "student.transferStudent" },
    ],
};
