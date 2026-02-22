module.exports = class Classroom { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels, serializers }={}){
        this.config              = config;
        this.utils               = utils;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.classroomsCollection     = "classrooms";
        this.classroomExposed         = [];
        this.httpExposed          = ['post=createClassroom', 'patch=manageClassroomById', 'get=getClassroomsBySchoolId', 'delete=deleteClassroomById'];
        this.classroomStatus         = 'active';
        this.fieldExposed = {
            default: {
                classroom: ["_id", "name", "level", "capacity", "status", "numberOfDesks", "numberOfComputers", "hasProjector", "schoolId", "createdAt", "updatedAt"]
            },
            createClassroom: {
                classroom: ["_id", "name", "level", "capacity", "status", "numberOfDesks", "numberOfComputers", "hasProjector", "schoolId", "createdAt", "updatedAt"]
            },
            getClassroomsBySchoolId: {
                classrooms: ["_id", "name", "level", "capacity", "status", "numberOfDesks", "numberOfComputers", "hasProjector", "schoolId", "createdAt", "updatedAt"]
            }
        };
        this.serialize = serializers.createSerializer(this.fieldExposed);    }

    async createClassroom({ __longToken, __schoolScope, name, level, capacity, numberOfDesks, numberOfComputers, hasProjector, schoolId }){
        const classroom = {name, level, capacity, numberOfDesks, numberOfComputers, hasProjector, schoolId };
       
        // Data validation
        let result = await this.validators.classroom.createClassRoom(classroom);
        if(result) return { errors: result };

        const classroomModel = this.mongomodels.classroom;
        const newClassroom = await classroomModel.create(classroom);
        return {
            classroom: newClassroom, 
        };
    }

    async manageClassroomById({ __longToken, __schoolScope, __params, capacity, numberOfDesks, numberOfComputers, hasProjector, status }){
        const id = __params.id;
        let result = await this.validators.classroom.manageClassroomById(__params);
        if(result) return { errors: result };

        const classroom = await this.mongomodels.classroom.findById(id);
        if(!classroom) return { errors: 'Classroom not found', code: 404 };

        classroom.capacity = capacity || classroom.capacity;
        classroom.numberOfDesks = numberOfDesks || classroom.numberOfDesks;
        classroom.numberOfComputers = numberOfComputers || classroom.numberOfComputers;
        classroom.hasProjector = hasProjector || classroom.hasProjector;
        classroom.status = status || classroom.status;

        // Data validation
        result = await this.validators.classroom.manageClassroomById(classroom);
        if(result) return { errors: result };

        await classroom.save();
        return {
            classroom: classroom, 
        };
    }

    async getClassroomsBySchoolId({ __longToken, __schoolScope, __params }) {
       let result = await this.validators.classroom.getClassroomsBySchoolId(__params);
       if(result) return { errors: result };

       const classrooms = await this.mongomodels.classroom.find({ schoolId: __params.schoolId });
       return {
        classrooms: classrooms,
       };
    }

    async deleteClassroomById({ __longToken, __schoolScope, __params }) {
        const id = __params.id;

        // Data validation
        let result = await this.validators.classroom.deleteClassroomById(__params);
        if(result) return { errors: result };

        const session = await this.mongomodels.classroom.startSession();
        try {
            session.startTransaction();
            const classroom = await this.mongomodels.classroom.findById(id);

            if(!classroom){ 
                await session.abortTransaction();
                return { errors: 'Classroom not found', code: 404 };
            }

            await this.mongomodels.student.deleteMany({ classroomId: classroom.id }).session(session);
            await this.mongomodels.classroom.deleteOne({ id: classroom.id }).session(session);
            await session.commitTransaction();
            return { classroom: classroom, message: 'Classroom deleted successfully', code: 204 };
        } catch (error) {
            await session.abortTransaction();
            return { errors: 'Failed to delete classroom', code: 500, details: error.message };
        } finally {
            session.endSession();
        }
    }

}
