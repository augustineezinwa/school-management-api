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
        this.httpExposed          = ['post=createClassroom'];
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

}
