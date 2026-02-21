module.exports = class User { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels, serializers }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.usersCollection     = "users";
        this.userExposed         = [];
        this.httpExposed          = ['post=createUser', 'post=login', 'patch=changePassword', 'patch=manageUserById', 'patch=assignAdminToSchool'];
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

    async createUser({ __longToken, email, password, firstName, lastName, schoolId}){
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

    async login({ email, password }){
        let result = await this.validators.user.login({ email, password });
        if(result) return { errors: result };

        const user = await this.mongomodels.user.findOne({ email });
        if(!user) return { errors: 'Invalid email or password', code: 401 };

        const isPasswordValid = await this.tokenManager.comparePassword(password, user.password);
        if(!isPasswordValid) return { errors: 'Invalid email or password', code: 401 };

        const longToken = this.tokenManager.genLongToken({ userId: user.id, role: user.role, schoolId: user.schoolId });

        return { user: user, token: longToken, message: 'Login successful'};
    }

    async changePassword({ __headers, __longToken, password, newPassword}){
        let result = await this.validators.user.changePassword({ token: __headers.token, password, newPassword });
        if(result) return { errors: result };

        let decoded = this.tokenManager.verifyLongToken({token: __headers.token});
        if(!decoded) return { errors: 'Unauthorized', code: 401 };

        const user = await this.mongomodels.user.findById(decoded.userId);
        if(!user) return { errors: 'Unauthorized', code: 401 };

        const isPasswordValid = await this.tokenManager.comparePassword(password, user.password);
        if(!isPasswordValid) return { errors: 'old password is incorrect', code: 401 };

        const newHashedPassword = await this.tokenManager.hashPassword(newPassword);
        user.password = newHashedPassword;
        await user.save();
        return { user: user, message: 'Password changed successfully' };
    }

    async manageUserById({ __longToken, __userScope, __params, email, firstName, lastName, status, schoolId }){
        let result = await this.validators.user.manageUserById({ id: __params.id, email, firstName, lastName, status, schoolId });
        if(result) return { errors: result };

        const user = await this.mongomodels.user.findById(__params.id);
        if(!user) return { errors: 'User not found', code: 404 };

        user.email = email || user.email;
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.status = status || user.status;
        user.schoolId = schoolId || user.schoolId;

        await user.save();
        return { user: user, message: 'User updated successfully' };
    }

    async assignAdminToSchool({ __params, __longToken, schoolId }){
        const id = __params.id;
        let result = await this.validators.user.assignAdminToSchool(__params);
        if(result) return { errors: result };

        const school = await this.mongomodels.school.findById(schoolId);
        if(!school) return { errors: 'School not found', code: 404 };

        const user = await this.mongomodels.user.findById(id);
        if(!user) return { errors: 'User not found', code: 404 };

        user.schoolId = school.id;
        await user.save();
        return { user: user, message: 'Admin assigned to school successfully' };
    }
}
