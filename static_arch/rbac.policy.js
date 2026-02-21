module.exports = {
    "school.createSchool": {
      auth: "__longToken",
      allowedRoles: ["super_admin"],
      action: "create",
      layer: "school"
    },
  
    "user.createUser": {
      auth: "__longToken",
      allowedRoles: ["super_admin"],
    //   action: "create",
    //   layer: "school.user"
    },
  
    "classroom.createClassroom": {
      auth: "__longToken",
      allowedRoles: ["super_admin", "school_admin"],
      action: "create",
      layer: "school.classroom"
    },
  
    "student.enrollStudent": {
      auth: "__longToken",
      allowedRoles: ["super_admin", "school_admin"],
      action: "create",
      layer: "school.classroom.student"
    }
  };