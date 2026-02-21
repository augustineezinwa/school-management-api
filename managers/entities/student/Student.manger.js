module.exports = class Student { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels, serializers }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.studentsCollection     = "students";
        this.studentExposed         = [];
        this.httpExposed          = ['post=enrollStudent', 'get=getStudents', 'get=getStudentById', 'patch=updateStudentProfileById', 'delete=deleteStudentById', 'patch=transferStudent'];
        this.studentStatus         = 'active';
        this.utils               = utils;
        this.fieldExposed = {
            default: {
                student: ["_id", "admissionNumber", "firstName", "lastName", "dateOfBirth", "gender", "classroomId", "schoolId", "status", "createdAt", "updatedAt", "enrolledAt"]
            },
            enrollStudent: {
                student: ["_id", "admissionNumber", "firstName", "lastName", "dateOfBirth", "gender", "classroomId", "schoolId", "status", "createdAt", "updatedAt", "enrolledAt"]
            },
            updateStudentById: {
                student: ["_id", "admissionNumber", "firstName", "lastName", "dateOfBirth", "gender", "classroomId", "schoolId", "status", "createdAt", "updatedAt", "enrolledAt"]
            }
        };
        this.serialize = serializers.createSerializer(this.fieldExposed);
    }

    async enrollStudent({admissionNumber, firstName, lastName, dateOfBirth, gender, classroomId, schoolId}){
        const student = {admissionNumber, firstName, lastName, dateOfBirth, gender, classroomId, schoolId, enrolledAt: new Date() };
       
        // Data validation
        let result = await this.validators.student.enrollStudent(student);
        if(result) return { errors: result };

        const classroom = await this.mongomodels.classroom.findOne({ id: classroomId, schoolId });
        if(!classroom) return { errors: 'Classroom not found', code: 404 };

        // check capacity
        if(await this.isClassroomCapacityFull(classroom)) return { errors: 'Classroom is full', code: 400 };


        const studentModel = this.mongomodels.student;
        const newStudent = await studentModel.create(student);
        return {
            student: newStudent
        };
    }

    async getStudents(){
        const students = await this.mongomodels.student.find({});
        return {
            students: students, 
        };
    }

    async getStudentById({ __params }){
        const id = __params.id;
        
        // Data validation
        let result = await this.validators.student.getStudentById(__params);
        if(result) return { errors: result };


        const student = await this.mongomodels.student.findById(id);
        if(!student) return { errors: 'Student not found', code: 404 };
        return {
            student: student, 
        }; 
    }

    async updateStudentProfileById({ __params, admissionNumber, firstName, lastName, dateOfBirth, gender, status }){
        const id = __params.id;
        let result = await this.validators.student.getStudentById(__params);
        if(result) return { errors: result };

        const student = await this.mongomodels.student.findById(id);
        if(!student) return { errors: 'Student not found', code: 404 };

        student.admissionNumber = admissionNumber || student.admissionNumber;
        student.firstName = firstName || student.firstName;
        student.lastName = lastName || student.lastName;
        student.dateOfBirth = dateOfBirth || new Date(student.dateOfBirth).toISOString().slice(0, 10);
        student.gender = gender || student.gender;
        student.status = status || student.status;


        // Data validation
        result = await this.validators.student.updateStudentProfileById(student);
        if(result) return { errors: result };

        await student.save();
        return {
            student: student, 
        };
    }

    async deleteStudentById({ __params }){
        const id = __params.id;

        // Data validation
        let result = await this.validators.student.deleteStudentById(__params);
        if(result) return { errors: result };

        const student = await this.mongomodels.student.findByIdAndDelete(id);
        if(!student) return { errors: 'Student not found', code: 404 };
        return {
            student: student, 
            message: 'Student deleted successfully',
            code: 204
        };
    }

    async transferStudent({ __params, classroomId, schoolId }){
        const id = __params.id;
        let result = await this.validators.student.transferStudent({ id, classroomId, schoolId });
        if(result) return { errors: result };

        const student = await this.mongomodels.student.findById(id);
        if(!student) return { errors: 'Student not found', code: 404 };

        const school = await this.mongomodels.school.findById(schoolId);
        if(!school) return { errors: 'School not found', code: 404 };

        const classroom = await this.mongomodels.classroom.findOne({ schoolId, id: classroomId });
        if(!classroom) return { errors: 'Classroom not found', code: 404 };

        // check capacity
        if(await this.isClassroomCapacityFull(classroom)) return { errors: 'Classroom is full', code: 400 };

        student.classroomId = classroom.id;
        student.schoolId = school.id;

        // Data validation
        result = await this.validators.student.transferStudent(student);
        if(result) return { errors: result };

        await student.save();
        return {
            student: student,
            message: 'Student transferred successfully',
            code: 200
        };
    }

    async isClassroomCapacityFull(classroom) {
        const students = await this.mongomodels.student.find({ classroomId: classroom.id });
        return students.length >= classroom.capacity;
    }

}
