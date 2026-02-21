module.exports = {
    "school.createSchool": {
      auth: "__longToken",
      allowedRoles: ["super_admin"]
    },

    "school.getSchools": {
      auth: "__longToken",
      allowedRoles: ["super_admin"]
    },

    "school.getSchoolById": {
      auth: "__longToken",
      allowedRoles: ["super_admin", "school_admin"],
      layer: "school",
      action: "read",
      scope: "school",
      nodeId: { schoolIdPath: "params.id" }
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
      allowedRoles: ["super_admin", "school_admin"],
      layer: "school",
      action: "config",
      scope: "school",
      nodeId: { schoolIdPath: "params.id" }
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
      allowedRoles: ["super_admin", "school_admin"],
      scope: "user",
      nodeId: { userIdPath: "params.id" }
    },

    "user.assignAdminToSchool": {
      auth: "__longToken",
      allowedRoles: ["super_admin"],
    },

    "token.v1_createShortToken": {
      auth: "__longToken",
      allowedRoles: ["super_admin"]
    },
  
    "classroom.createClassroom": {
      auth: "__longToken",
      allowedRoles: ["super_admin", "school_admin"],
      layer: "school.classroom",
      action: "create",
      scope: "school",
      nodeId: { schoolIdPath: "body.schoolId" }
    },

    "classroom.manageClassroomById": {
      auth: "__longToken",
      allowedRoles: ["super_admin", "school_admin"],
      layer: "school.classroom",
      action: "config",
      scope: "school",
      nodeId: { resourceType: "classroom", resourceIdPath: "params.id" }
    },

    "classroom.getClassroomsBySchoolId": {
      auth: "__longToken",
      allowedRoles: ["super_admin", "school_admin"],
      layer: "school.classroom",
      action: "read",
      scope: "school",
      nodeId: { schoolIdPath: ["params.schoolId", "params.id"] }
    },

    "classroom.deleteClassroomById": {
      auth: "__longToken",
      allowedRoles: ["super_admin", "school_admin"],
      layer: "school.classroom",
      action: "config",
      scope: "school",
      nodeId: { resourceType: "classroom", resourceIdPath: "params.id" }
    },
  
    "student.enrollStudent": {
      auth: "__longToken",
      allowedRoles: ["super_admin", "school_admin"],
      layer: "school.classroom.student",
      action: "create",
      scope: "school",
      nodeId: { schoolIdPath: "body.schoolId" }
    },

    "student.getStudents": {
      auth: "__longToken",
      allowedRoles: ["super_admin"]
    },

    "student.getStudentById": {
      auth: "__longToken",
      allowedRoles: ["super_admin", "school_admin"],
      layer: "school.classroom.student",
      action: "read",
      scope: "school",
      nodeId: { resourceType: "student", resourceIdPath: "params.id" }
    },

    "student.updateStudentProfileById": {
      auth: "__longToken",
      allowedRoles: ["super_admin", "school_admin"],
      layer: "school.classroom.student",
      action: "config",
      scope: "school",
      nodeId: { resourceType: "student", resourceIdPath: "params.id" }
    },

    "student.deleteStudentById": {
      auth: "__longToken",
      allowedRoles: ["super_admin", "school_admin"],
      layer: "school.classroom.student",
      action: "config",
      scope: "school",
      nodeId: { resourceType: "student", resourceIdPath: "params.id" }
    },

    "student.transferStudent": {
      auth: "__longToken",
      allowedRoles: ["super_admin", "school_admin"],
      layer: "school.classroom.student",
      action: "config",
      scope: "school",
      nodeId: { schoolIdPath: "body.schoolId" },
      fromNodeId: { resourceType: "student", resourceIdPath: "params.id" }
    }
  };