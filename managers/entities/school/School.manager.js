module.exports = class School { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels, serializers }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.schoolsCollection     = "schools";
        this.schoolExposed         = [];
        this.httpExposed          = ['post=createSchool', 'get=getSchools', 'get=getSchoolById','put=updateSchoolById', 'delete=deleteSchoolById', 'patch=updateSchoolProfile'];
        this.schoolStatus         = 'active';
        this.utils               = utils;
        this.fieldExposed = {
            default: {
                school: ["_id", "name", "slug", "email", "phone", "address", "website", "motto", "establishedYear", "imageUrl", "status", "createdAt", "updatedAt"]
            },
            createSchool: {
                school: ["_id", "name", "slug", "email", "phone", "address", "website", "motto", "establishedYear", "imageUrl", "status", "createdAt", "updatedAt"]
            },
            updateSchoolById: {
                school: ["_id", "name", "slug", "email", "phone", "address", "website", "motto", "establishedYear", "imageUrl", "status", "createdAt", "updatedAt"]
            },
            getSchools: {
                schools: ["_id", "name", "slug", "email", "phone", "address", "website", "motto", "establishedYear", "imageUrl", "status", "createdAt", "updatedAt"]
            }
        };
        this.serialize = serializers.createSerializer(this.fieldExposed);
    }

    async createSchool({ __longToken, name, email, phone, address, website, motto, establishedYear, imageUrl }){
        const slug = this.utils.slugify(name || '');
        const school = {name, slug, email, phone, address, website, motto, establishedYear, imageUrl };
       
        // Data validation
        let result = await this.validators.school.createSchool(school);
        if(result) return { errors: result, code: 422 };

        const schoolModel = this.mongomodels.school;
        const newSchool = await schoolModel.create(school);
        return {
            school: newSchool, 
        };
    }

    async getSchools({ __longToken }){
        const schools = await this.mongomodels.school.find({});
        return {
            schools: schools, 
        };
    }

    async getSchoolById({ __longToken, __schoolScope, __params }){
        const id = __params.id;
        
        // Data validation
        let result = await this.validators.school.getSchoolById(__params);
        if(result) return { errors: result, code: 422 };


        const school = await this.mongomodels.school.findById(id);
        if(!school) return { errors: 'School not found', code: 404 };
        return {
            school: school, 
        }; 
    }

    async updateSchoolById({ __longToken, __params, name, email, phone, address, website, motto, establishedYear, imageUrl }){
        const id = __params.id;
        const body = { id, name, email, phone, address, website, motto, establishedYear, imageUrl };

        // Data validation
        let result = await this.validators.school.updateSchoolById(body);
        if(result) return { errors: result, code: 422 };

        const school = await this.mongomodels.school.findByIdAndUpdate(id, body, { new: true });
        if(!school) return { errors: 'School not found', code: 404 };
        return {
            school: school, 
        };
    }

    async deleteSchoolById({ __longToken, __params }) {
        const id = __params.id;
    
        // Validate
        const result = await this.validators.school.deleteSchoolById(__params);
        if (result) return { errors: result, code: 422 };
    
        const session = await this.mongomodels.school.startSession();
    
        try {
            session.startTransaction();
            const school = await this.mongomodels.school.findById(id).session(session);
    
            if (!school) {
                await session.abortTransaction();
                return {
                    errors: 'School not found',
                    code: 404
                };
            }
    
            await this.mongomodels.user.updateMany({ schoolId: school._id }, { schoolId: null }, { session });
            await this.mongomodels.student.deleteMany({ schoolId: school._id }, { session });
            await this.mongomodels.classroom.deleteMany({ schoolId: school._id }, { session });
            await this.mongomodels.school.deleteOne({ _id: school._id }, { session });
            await session.commitTransaction();
    
            return {
                message: 'School deleted successfully',
                code: 200
            };
    
        } catch (error) {
            console.error(error);
            await session.abortTransaction();
            return {
                errors: 'Failed to delete school',
                code: 500,
                details: error.message
            };
        } finally {
            session.endSession();
        }
    }

    async updateSchoolProfile({ __longToken, __schoolScope, __params, name, email, phone, address, website, motto, establishedYear, imageUrl }){
        const id = __params.id;
        let result = await this.validators.school.getSchoolById(__params);
        if(result) return { errors: result, code: 422 };

        const school = await this.mongomodels.school.findById(id);
        if(!school) return { errors: 'School not found', code: 404 };

        school.name = name || school.name;
        school.email = email || school.email;
        school.phone = phone || school.phone;
        school.address = address || school.address;
        school.website = website || school.website;
        school.motto = motto || school.motto;
        school.establishedYear = establishedYear || school.establishedYear;
        school.imageUrl = imageUrl || school.imageUrl;

        // Data validation
        result = await this.validators.school.updateSchoolProfile(school);
        if(result) return { errors: result, code: 422 };

        await school.save();
        return { school: school };
    }

}
