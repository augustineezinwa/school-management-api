module.exports = class User { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels, serializers }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.usersCollection     = "users";
        this.userExposed         = [];
        this.httpExposed          = ['post=createUser'];
        this.userRole           = 'school_admin';
        this.userStatus         = 'active';

        this.fieldExposed = {
            default: {
                user: ["_id", "email", "firstName", "lastName", "role", "status", "schoolId", "createdAt", "updatedAt"]
            },
            createUser: {
                user: ["_id", "email", "firstName", "lastName", "role", "status", "schoolId", "createdAt", "updatedAt"]
            }
        };

        this.serialize = serializers.createSerializer(this.fieldExposed);
    }

    async createUser({email, password, firstName, lastName, schoolId}){
        const user = {email, password, firstName, lastName, role: this.userRole, schoolId };
       

        // Data validation
        let result = await this.validators.user.createUser(user);
        if(result) return { errors: result };

        const userModel = this.mongomodels.user;
        
        // Creation Logic
        const hashedPassword = await this.tokenManager.hashPassword(password);
        let createdUser     = {email, password: hashedPassword, firstName, lastName, role: this.userRole, status: this.userStatus, schoolId };

        const newUser = await userModel.create(createdUser);

        // Response
        return {
            user: newUser, 
        };
    }

}
