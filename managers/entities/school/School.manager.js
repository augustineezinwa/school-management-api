module.exports = class School { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels, serializers }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.schoolsCollection     = "schools";
        this.schoolExposed         = [];
        this.httpExposed          = ['post=createSchool'];
        this.schoolStatus         = 'active';
        this.utils               = utils;
        this.fieldExposed = {
            default: {
                school: ["_id", "name", "slug", "email", "phone", "address", "website", "motto", "establishedYear", "imageUrl", "status", "createdAt", "updatedAt"]
            },
            createSchool: {
                school: ["_id", "name", "slug", "email", "phone", "address", "website", "motto", "establishedYear", "imageUrl", "status", "createdAt", "updatedAt"]
            }
        };
        this.serialize = serializers.createSerializer(this.fieldExposed);
    }

    async createSchool({name, email, phone, address, website, motto, establishedYear, imageUrl}){
        const slug = this.utils.slugify(name || '');
        const school = {name, slug, email, phone, address, website, motto, establishedYear, imageUrl };
       
        // Data validation
        let result = await this.validators.school.createSchool(school);
        if(result) return { errors: result };

        const schoolModel = this.mongomodels.school;
        const newSchool = await schoolModel.create(school);
        return {
            school: newSchool, 
        };
    }

}
