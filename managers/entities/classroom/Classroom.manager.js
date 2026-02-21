module.exports = class ClassRoom { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels, serializers }={}){
        this.config              = config;
        this.utils               = utils;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.classroomsCollection     = "classrooms";
        this.classroomExposed         = [];
        this.httpExposed          = ['post=createClassroom', 'patch=manageClassroomById' ];
        this.classroomStatus         = 'active';
        this.fieldExposed = {
            default: {
                classroom: ["_id", "name", "level", "capacity", "status", "numberOfDesks", "numberOfComputers", "hasProjector", "schoolId", "createdAt", "updatedAt"]
            },
            createClassRoom: {
                classroom: ["_id", "name", "level", "capacity", "status", "numberOfDesks", "numberOfComputers", "hasProjector", "schoolId", "createdAt", "updatedAt"]
            }
        };
        this.serialize = serializers.createSerializer(this.fieldExposed);    }

    async createClassroom({name, level, capacity, numberOfDesks, numberOfComputers, hasProjector, schoolId}){
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

    async manageClassroomById({ __params, capacity, numberOfDesks, numberOfComputers, hasProjector }){
        const id = __params.id;
        if(!id) return { errors: 'Classroom ID is required' };

        const classroom = await this.mongomodels.classroom.findById(id);
        if(!classroom) return { errors: 'Classroom not found', code: 404 };

        classroom.capacity = capacity || classroom.capacity;
        classroom.numberOfDesks = numberOfDesks || classroom.numberOfDesks;
        classroom.numberOfComputers = numberOfComputers || classroom.numberOfComputers;
        classroom.hasProjector = hasProjector || classroom.hasProjector;

        // Data validation
        let result = await this.validators.classroom.manageClassroomById(classroom);
        if(result) return { errors: result };

        await classroom.save();
        return {
            classroom: classroom, 
        };
    }

}
