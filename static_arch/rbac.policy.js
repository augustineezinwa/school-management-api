module.exports = {
    "school.createSchool": {
      auth: "__longToken",
      allowedRoles: ["super_admin"]
    },

    "school.getSchools": {
      auth: "__longToken",
      allowedRoles: ["super_admin", "school_admin"]
    },

    "school.getSchoolById": {
      auth: "__longToken",
      allowedRoles: ["super_admin", "school_admin"]
    },

    "school.updateSchoolById": {
      auth: "__longToken",
      allowedRoles: ["super_admin"]
    },

    "school.deleteSchoolById": {
      auth: "__longToken",
      allowedRoles: ["super_admin"]
    },

    "school.updateSchoolProfile": {
      auth: "__longToken",
      allowedRoles: ["super_admin", "school_admin"]
    },
  
    "user.createUser": {
      auth: "__longToken",
      allowedRoles: ["super_admin"]
    },

    "user.changePassword": {
      auth: "__longToken",
      allowedRoles: ["super_admin", "school_admin"]
    },

    "user.manageUserById": {
      auth: "__longToken",
      allowedRoles: ["super_admin"]
    },

    "token.v1_createShortToken": {
      auth: "__longToken",
      allowedRoles: ["super_admin", "school_admin"]
    },
  
    "classroom.createClassroom": {
      auth: "__longToken",
      allowedRoles: ["super_admin", "school_admin"]
    },

    "classroom.manageClassroomById": {
      auth: "__longToken",
      allowedRoles: ["super_admin", "school_admin"]
    },

    "classroom.getClassroomsBySchoolId": {
      auth: "__longToken",
      allowedRoles: ["super_admin", "school_admin"]
    },

    "classroom.deleteClassroomById": {
      auth: "__longToken",
      allowedRoles: ["super_admin", "school_admin"]
    },
  
    "student.enrollStudent": {
      auth: "__longToken",
      allowedRoles: ["super_admin", "school_admin"]
    },

    "student.getStudents": {
      auth: "__longToken",
      allowedRoles: ["super_admin", "school_admin"]
    },

    "student.getStudentById": {
      auth: "__longToken",
      allowedRoles: ["super_admin", "school_admin"]
    },

    "student.updateStudentProfileById": {
      auth: "__longToken",
      allowedRoles: ["super_admin", "school_admin"]
    },

    "student.deleteStudentById": {
      auth: "__longToken",
      allowedRoles: ["super_admin", "school_admin"]
    },

    "student.transferStudent": {
      auth: "__longToken",
      allowedRoles: ["super_admin", "school_admin"]
    }
  };