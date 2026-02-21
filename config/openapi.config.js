const routesConfig = require("./routes.config");

function expressPathToOpenApi(path) {
    return path.replace(/:([a-zA-Z0-9_]+)/g, "{$1}");
}

function buildCommonResponses({ include404 = false, include409 = false }) {
    const errorSchema = {
        type: "object",
        properties: {
            ok: { type: "boolean", example: false },
            data: { type: "object", additionalProperties: true, example: {} },
            errors: {
                oneOf: [
                    { type: "string" },
                    {
                        type: "array",
                        items: {
                            oneOf: [{ type: "string" }, { type: "object", additionalProperties: true }],
                        },
                    },
                ],
                example: ["validation failed"],
            },
            message: { type: "string", example: "validation failed" },
        },
    };
    const responses = {
        400: {
            description: "Bad request / validation error",
            content: { "application/json": { schema: errorSchema } },
        },
        401: {
            description: "Unauthorized",
            content: { "application/json": { schema: errorSchema } },
        },
        403: {
            description: "Forbidden",
            content: { "application/json": { schema: errorSchema } },
        },
        500: {
            description: "Internal server error",
            content: { "application/json": { schema: errorSchema } },
        },
    };
    if (include404) {
        responses[404] = {
            description: "Resource not found",
            content: { "application/json": { schema: errorSchema } },
        };
    }
    if (include409) {
        responses[409] = {
            description: "Conflict (duplicate resource)",
            content: { "application/json": { schema: errorSchema } },
        };
    }
    return responses;
}

function buildSuccessEnvelopeSchema(dataSchema) {
    return {
        type: "object",
        properties: {
            ok: { type: "boolean", example: true },
            data: dataSchema || { type: "object", additionalProperties: true },
            errors: {
                oneOf: [{ type: "array", items: { type: "string" } }, { type: "string" }],
                example: [],
            },
            message: { type: "string", example: "" },
        },
    };
}

function buildSuccessExample(dataExample) {
    return {
        ok: true,
        data: dataExample || {},
        errors: [],
        message: "",
    };
}

function normalizeResponses(doc) {
    const responses = { ...(doc.responses || {}) };
    const successStatuses = [200, 201];
    for (const status of successStatuses) {
        if (responses[status] && !responses[status].content) {
            responses[status] = {
                ...responses[status],
                content: {
                    "application/json": {
                        schema: buildSuccessEnvelopeSchema(doc.successDataSchema),
                        example: buildSuccessExample(doc.successExample),
                    },
                },
            };
        }
    }
    return responses;
}

const componentSchemas = {
    User: {
        type: "object",
        properties: {
            _id: { type: "string" },
            email: { type: "string", format: "email" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            role: { type: "string", enum: ["school_admin", "super_admin"] },
            status: { type: "string", enum: ["active", "inactive"] },
            schoolId: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
        },
    },
    School: {
        type: "object",
        properties: {
            _id: { type: "string" },
            name: { type: "string" },
            slug: { type: "string" },
            email: { type: "string", format: "email" },
            phone: { type: "string" },
            address: { type: "string" },
            website: { type: "string" },
            motto: { type: "string" },
            establishedYear: { type: "string" },
            imageUrl: { type: "string" },
            status: { type: "string", enum: ["active", "inactive"] },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
        },
    },
    Classroom: {
        type: "object",
        properties: {
            _id: { type: "string" },
            name: { type: "string" },
            level: { type: "string" },
            capacity: { type: "number" },
            status: { type: "string", enum: ["active", "inactive"] },
            numberOfDesks: { type: "number" },
            numberOfComputers: { type: "number" },
            hasProjector: { type: "boolean" },
            schoolId: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
        },
    },
    Student: {
        type: "object",
        properties: {
            _id: { type: "string" },
            admissionNumber: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            dateOfBirth: { type: "string", format: "date" },
            gender: { type: "string", enum: ["male", "female"] },
            classroomId: { type: "string" },
            schoolId: { type: "string" },
            status: { type: "string", enum: ["active", "inactive"] },
            enrolledAt: { type: "string", format: "date-time" },
        },
    },
};

const componentExamples = {
    user: {
        _id: "65f0c3c6d2f0a2e7c7b4ab10",
        email: "admin@school.com",
        firstName: "Ada",
        lastName: "Lovelace",
        role: "school_admin",
        status: "active",
        schoolId: "65f0c3c6d2f0a2e7c7b4ab01",
        createdAt: "2026-02-20T10:00:00.000Z",
        updatedAt: "2026-02-20T10:00:00.000Z",
    },
    school: {
        _id: "65f0c3c6d2f0a2e7c7b4ab01",
        name: "Lakeside Academy",
        slug: "lakeside-academy",
        email: "info@lakeside.edu",
        phone: "+2348012345678",
        address: "12 Marina Road, Lagos",
        website: "https://lakeside.edu",
        motto: "Learn. Lead. Serve.",
        establishedYear: "2010",
        imageUrl: "https://lakeside.edu/logo.png",
        status: "active",
        createdAt: "2026-02-20T10:00:00.000Z",
        updatedAt: "2026-02-20T10:00:00.000Z",
    },
    classroom: {
        _id: "65f0c3c6d2f0a2e7c7b4ab31",
        name: "JSS 2A",
        level: "JSS2",
        capacity: 45,
        status: "active",
        numberOfDesks: 25,
        numberOfComputers: 10,
        hasProjector: true,
        schoolId: "65f0c3c6d2f0a2e7c7b4ab01",
        createdAt: "2026-02-20T10:00:00.000Z",
        updatedAt: "2026-02-20T10:00:00.000Z",
    },
    student: {
        _id: "65f0c3c6d2f0a2e7c7b4ab51",
        admissionNumber: "ADM-2026-0001",
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "2014-05-10",
        gender: "male",
        classroomId: "65f0c3c6d2f0a2e7c7b4ab31",
        schoolId: "65f0c3c6d2f0a2e7c7b4ab01",
        status: "active",
        createdAt: "2026-02-20T10:00:00.000Z",
        updatedAt: "2026-02-20T10:00:00.000Z",
        enrolledAt: "2026-02-20T10:00:00.000Z",
    },
};

const endpointDocs = {
    "user.login": {
        summary: "Authenticate user",
        tags: ["Auth"],
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        required: ["email", "password"],
                        properties: {
                            email: { type: "string", format: "email" },
                            password: { type: "string", minLength: 8 },
                        },
                    },
                    example: { email: "admin@school.com", password: "securePass123" },
                },
            },
        },
        responses: {
            200: {
                description: "Login successful",
                content: {
                    "application/json": {
                        schema: buildSuccessEnvelopeSchema({
                            type: "object",
                            properties: {
                                user: { $ref: "#/components/schemas/User" },
                                token: { type: "string" },
                                message: { type: "string" },
                            },
                        }),
                        examples: {
                            success: {
                                value: {
                                    ok: true,
                                    data: {
                                        user: componentExamples.user,
                                        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                                        message: "Login successful",
                                    },
                                    errors: [],
                                    message: "",
                                },
                            },
                        },
                    },
                },
            },
            ...buildCommonResponses({}),
        },
    },
    "token.v1_createShortToken": {
        summary: "Create short token from long token",
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        successDataSchema: {
            type: "object",
            properties: { shortToken: { type: "string" } },
        },
        successExample: { shortToken: "eyJhbGciOi..." },
        responses: {
            200: {
                description: "Short token created",
                content: {
                    "application/json": {
                        schema: buildSuccessEnvelopeSchema({
                            type: "object",
                            properties: { shortToken: { type: "string" } },
                        }),
                        example: {
                            ok: true,
                            data: { shortToken: "eyJhbGciOi..." },
                            errors: [],
                            message: "",
                        },
                    },
                },
            },
            ...buildCommonResponses({}),
        },
    },
    "user.createUser": {
        summary: "Create user",
        tags: ["Users"],
        security: [{ bearerAuth: [] }],
        successDataSchema: { type: "object", properties: { user: { $ref: "#/components/schemas/User" } } },
        successExample: { user: componentExamples.user },
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        required: ["email", "password", "firstName", "lastName"],
                        properties: {
                            email: { type: "string", format: "email" },
                            password: { type: "string", minLength: 8 },
                            firstName: { type: "string" },
                            lastName: { type: "string" },
                            schoolId: { type: "string", description: "Mongo ObjectId" },
                        },
                    },
                    example: {
                        email: "new.admin@school.com",
                        password: "securePass123",
                        firstName: "Grace",
                        lastName: "Hopper",
                        schoolId: "65f0c3c6d2f0a2e7c7b4ab01",
                    },
                },
            },
        },
        responses: {
            200: { description: "User created" },
            ...buildCommonResponses({ include409: true }),
        },
    },
    "user.changePassword": {
        summary: "Change current user password",
        tags: ["Users"],
        security: [{ bearerAuth: [] }],
        successDataSchema: {
            type: "object",
            properties: {
                user: { $ref: "#/components/schemas/User" },
                message: { type: "string" },
            },
        },
        successExample: { user: componentExamples.user, message: "Password changed successfully" },
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        required: ["password", "newPassword"],
                        properties: {
                            password: { type: "string" },
                            newPassword: { type: "string", minLength: 8 },
                        },
                    },
                    example: { password: "oldPassword123", newPassword: "newPassword456" },
                },
            },
        },
        responses: {
            200: { description: "Password changed" },
            ...buildCommonResponses({}),
        },
    },
    "user.manageUserById": {
        summary: "Update user profile by id",
        tags: ["Users"],
        security: [{ bearerAuth: [] }],
        successDataSchema: {
            type: "object",
            properties: {
                user: { $ref: "#/components/schemas/User" },
                message: { type: "string" },
            },
        },
        successExample: { user: componentExamples.user, message: "User updated successfully" },
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            firstName: { type: "string" },
                            lastName: { type: "string" },
                            email: { type: "string" },
                            status: { type: "string", enum: ["active", "inactive"] },
                        },
                    },
                    example: { firstName: "Ada", lastName: "Lovelace", email: "ada@lovelace.com", status: "active" },
                },
            },
        },
        responses: {
            200: { description: "User updated" },
            ...buildCommonResponses({ include404: true }),
        },
    },
    "user.assignAdminToSchool": {
        summary: "Assign admin to school",
        tags: ["Users"],
        security: [{ bearerAuth: [] }],
        successDataSchema: {
            type: "object",
            properties: {
                user: { $ref: "#/components/schemas/User" },
                message: { type: "string" },
            },
        },
        successExample: { user: componentExamples.user, message: "Admin assigned to school successfully" },
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        required: ["schoolId"],
                        properties: { schoolId: { type: "string" } },
                    },
                    example: { schoolId: "65f0c3c6d2f0a2e7c7b4ab01" },
                },
            },
        },
        responses: {
            200: { description: "Admin assigned to school" },
            ...buildCommonResponses({ include404: true }),
        },
    },
    "school.createSchool": {
        summary: "Create school",
        tags: ["Schools"],
        security: [{ bearerAuth: [] }],
        successDataSchema: { type: "object", properties: { school: { $ref: "#/components/schemas/School" } } },
        successExample: { school: componentExamples.school },
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        required: ["name", "email", "phone", "address", "establishedYear"],
                        properties: {
                            name: { type: "string" },
                            email: { type: "string", format: "email" },
                            phone: { type: "string" },
                            address: { type: "string" },
                            website: { type: "string" },
                            motto: { type: "string" },
                            establishedYear: { type: "string", example: "2020" },
                            imageUrl: { type: "string" },
                        },
                    },
                    example: {
                        name: "Lakeside Academy",
                        email: "info@lakeside.edu",
                        phone: "+2348012345678",
                        address: "12 Marina Road, Lagos",
                        website: "https://lakeside.edu",
                        motto: "Learn. Lead. Serve.",
                        establishedYear: "2010",
                    },
                },
            },
        },
        responses: {
            200: { description: "School created" },
            ...buildCommonResponses({ include409: true }),
        },
    },
    "school.getSchools": {
        summary: "List schools",
        tags: ["Schools"],
        security: [{ bearerAuth: [] }],
        successDataSchema: {
            type: "object",
            properties: { schools: { type: "array", items: { $ref: "#/components/schemas/School" } } },
        },
        successExample: { schools: [componentExamples.school] },
        responses: { 200: { description: "Schools fetched" }, ...buildCommonResponses({}) },
    },
    "school.getSchoolById": {
        summary: "Get school by id",
        tags: ["Schools"],
        security: [{ bearerAuth: [] }],
        successDataSchema: { type: "object", properties: { school: { $ref: "#/components/schemas/School" } } },
        successExample: { school: componentExamples.school },
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "School fetched" }, ...buildCommonResponses({ include404: true }) },
    },
    "school.updateSchoolById": {
        summary: "Update school by id",
        tags: ["Schools"],
        security: [{ bearerAuth: [] }],
        successDataSchema: { type: "object", properties: { school: { $ref: "#/components/schemas/School" } } },
        successExample: { school: { ...componentExamples.school, name: "Updated School Name" } },
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        required: ["name", "email", "phone", "address", "establishedYear"],
                        properties: {
                            name: { type: "string" },
                            email: { type: "string", format: "email" },
                            phone: { type: "string" },
                            address: { type: "string" },
                            website: { type: "string" },
                            motto: { type: "string" },
                            establishedYear: { type: "string" },
                            imageUrl: { type: "string" },
                        },
                    },
                    example: {
                        name: "Updated School Name",
                        email: "info@lakeside.edu",
                        phone: "+2348012345678",
                        address: "12 Marina Road, Lagos",
                        website: "https://lakeside.edu",
                        motto: "Excellence Always",
                        establishedYear: "2010",
                        imageUrl: "https://lakeside.edu/logo.png",
                    },
                },
            },
        },
        responses: { 200: { description: "School updated" }, ...buildCommonResponses({ include404: true }) },
    },
    "school.deleteSchoolById": {
        summary: "Delete school by id",
        tags: ["Schools"],
        security: [{ bearerAuth: [] }],
        successDataSchema: {
            type: "object",
            properties: {
                school: { $ref: "#/components/schemas/School" },
                message: { type: "string" },
                code: { type: "number", example: 204 },
            },
        },
        successExample: { school: componentExamples.school, message: "School deleted successfully", code: 204 },
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "School deleted" }, ...buildCommonResponses({ include404: true }) },
    },
    "school.updateSchoolProfile": {
        summary: "Update school profile (partial update)",
        tags: ["Schools"],
        security: [{ bearerAuth: [] }],
        successDataSchema: { type: "object", properties: { school: { $ref: "#/components/schemas/School" } } },
        successExample: { school: { ...componentExamples.school, motto: "Excellence Always" } },
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            email: { type: "string", format: "email" },
                            phone: { type: "string" },
                            address: { type: "string" },
                            website: { type: "string" },
                            motto: { type: "string" },
                            establishedYear: { type: "string" },
                            imageUrl: { type: "string" },
                        },
                    },
                    example: {
                        name: "Lakeside Academy",
                        email: "info@lakeside.edu",
                        phone: "+2348012345678",
                        address: "12 Marina Road, Lagos",
                        website: "https://lakeside.edu",
                        motto: "Excellence Always",
                        establishedYear: "2010",
                        imageUrl: "https://lakeside.edu/logo.png",
                    },
                },
            },
        },
        responses: { 200: { description: "School profile updated" }, ...buildCommonResponses({ include404: true }) },
    },
    "classroom.createClassroom": {
        summary: "Create classroom",
        tags: ["Classrooms"],
        security: [{ bearerAuth: [] }],
        successDataSchema: { type: "object", properties: { classroom: { $ref: "#/components/schemas/Classroom" } } },
        successExample: { classroom: componentExamples.classroom },
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        required: ["name", "level", "capacity", "schoolId"],
                        properties: {
                            name: { type: "string" },
                            level: { type: "string" },
                            capacity: { type: "number" },
                            numberOfDesks: { type: "number" },
                            numberOfComputers: { type: "number" },
                            hasProjector: { type: "boolean" },
                            schoolId: { type: "string" },
                        },
                    },
                    example: {
                        name: "JSS 2A",
                        level: "JSS2",
                        capacity: 45,
                        numberOfDesks: 25,
                        numberOfComputers: 10,
                        hasProjector: true,
                        schoolId: "65f0c3c6d2f0a2e7c7b4ab01",
                    },
                },
            },
        },
        responses: { 200: { description: "Classroom created" }, ...buildCommonResponses({ include409: true }) },
    },
    "classroom.manageClassroomById": {
        summary: "Update classroom by id",
        tags: ["Classrooms"],
        security: [{ bearerAuth: [] }],
        successDataSchema: { type: "object", properties: { classroom: { $ref: "#/components/schemas/Classroom" } } },
        successExample: { classroom: { ...componentExamples.classroom, capacity: 50 } },
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            capacity: { type: "number" },
                            numberOfDesks: { type: "number" },
                            numberOfComputers: { type: "number" },
                            hasProjector: { type: "boolean" },
                            status: { type: "string", enum: ["active", "inactive"] },
                        },
                    },
                    example: {
                        capacity: 50,
                        numberOfDesks: 30,
                        numberOfComputers: 15,
                        hasProjector: true,
                        status: "active",
                    },
                },
            },
        },
        responses: { 200: { description: "Classroom updated" }, ...buildCommonResponses({ include404: true }) },
    },
    "classroom.getClassroomsBySchoolId": {
        summary: "List classrooms by school id",
        tags: ["Classrooms"],
        security: [{ bearerAuth: [] }],
        successDataSchema: {
            type: "object",
            properties: { classrooms: { type: "array", items: { $ref: "#/components/schemas/Classroom" } } },
        },
        successExample: { classrooms: [componentExamples.classroom] },
        parameters: [{ name: "schoolId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Classrooms fetched" }, ...buildCommonResponses({}) },
    },
    "classroom.deleteClassroomById": {
        summary: "Delete classroom by id",
        tags: ["Classrooms"],
        security: [{ bearerAuth: [] }],
        successDataSchema: {
            type: "object",
            properties: {
                classroom: { $ref: "#/components/schemas/Classroom" },
                message: { type: "string" },
                code: { type: "number", example: 204 },
            },
        },
        successExample: { classroom: componentExamples.classroom, message: "Classroom deleted successfully", code: 204 },
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Classroom deleted" }, ...buildCommonResponses({ include404: true }) },
    },
    "student.enrollStudent": {
        summary: "Enroll student",
        tags: ["Students"],
        security: [{ bearerAuth: [] }],
        successDataSchema: { type: "object", properties: { student: { $ref: "#/components/schemas/Student" } } },
        successExample: { student: componentExamples.student },
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        required: ["admissionNumber", "firstName", "lastName", "dateOfBirth", "gender", "classroomId", "schoolId"],
                        properties: {
                            admissionNumber: { type: "string" },
                            firstName: { type: "string" },
                            lastName: { type: "string" },
                            dateOfBirth: { type: "string", format: "date" },
                            gender: { type: "string", enum: ["male", "female"] },
                            classroomId: { type: "string" },
                            schoolId: { type: "string" },
                        },
                    },
                    example: {
                        admissionNumber: "ADM-2026-0001",
                        firstName: "John",
                        lastName: "Doe",
                        dateOfBirth: "2014-05-10",
                        gender: "male",
                        classroomId: "65f0c3c6d2f0a2e7c7b4ab31",
                        schoolId: "65f0c3c6d2f0a2e7c7b4ab01",
                    },
                },
            },
        },
        responses: { 200: { description: "Student enrolled" }, ...buildCommonResponses({ include404: true }) },
    },
    "student.getStudents": {
        summary: "List students",
        tags: ["Students"],
        security: [{ bearerAuth: [] }],
        successDataSchema: {
            type: "object",
            properties: { students: { type: "array", items: { $ref: "#/components/schemas/Student" } } },
        },
        successExample: { students: [componentExamples.student] },
        responses: { 200: { description: "Students fetched" }, ...buildCommonResponses({}) },
    },
    "student.getStudentById": {
        summary: "Get student by id",
        tags: ["Students"],
        security: [{ bearerAuth: [] }],
        successDataSchema: { type: "object", properties: { student: { $ref: "#/components/schemas/Student" } } },
        successExample: { student: componentExamples.student },
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Student fetched" }, ...buildCommonResponses({ include404: true }) },
    },
    "student.updateStudentProfileById": {
        summary: "Update student profile by id",
        tags: ["Students"],
        security: [{ bearerAuth: [] }],
        successDataSchema: { type: "object", properties: { student: { $ref: "#/components/schemas/Student" } } },
        successExample: { student: { ...componentExamples.student, firstName: "Jane" } },
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        required: ["admissionNumber", "firstName", "lastName", "dateOfBirth", "gender", "status"],
                        properties: {
                            admissionNumber: { type: "string" },
                            firstName: { type: "string" },
                            lastName: { type: "string" },
                            dateOfBirth: { type: "string", format: "date" },
                            gender: { type: "string", enum: ["male", "female"] },
                            status: { type: "string", enum: ["active", "inactive"] },
                        },
                    },
                    example: {
                        admissionNumber: "ADM-2026-0001",
                        firstName: "Jane",
                        lastName: "Doe",
                        dateOfBirth: "2014-05-10",
                        gender: "female",
                        status: "active",
                    },
                },
            },
        },
        responses: { 200: { description: "Student updated" }, ...buildCommonResponses({ include404: true }) },
    },
    "student.deleteStudentById": {
        summary: "Delete student by id",
        tags: ["Students"],
        security: [{ bearerAuth: [] }],
        successDataSchema: {
            type: "object",
            properties: {
                student: { $ref: "#/components/schemas/Student" },
                message: { type: "string" },
                code: { type: "number", example: 204 },
            },
        },
        successExample: { student: componentExamples.student, message: "Student deleted successfully", code: 204 },
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Student deleted" }, ...buildCommonResponses({ include404: true }) },
    },
    "student.transferStudent": {
        summary: "Transfer student to another classroom/school",
        tags: ["Students"],
        security: [{ bearerAuth: [] }],
        successDataSchema: {
            type: "object",
            properties: {
                student: { $ref: "#/components/schemas/Student" },
                message: { type: "string" },
                code: { type: "number", example: 200 },
            },
        },
        successExample: {
            student: { ...componentExamples.student, classroomId: "65f0c3c6d2f0a2e7c7b4ab32" },
            message: "Student transferred successfully",
            code: 200,
        },
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        required: ["classroomId", "schoolId"],
                        properties: { classroomId: { type: "string" }, schoolId: { type: "string" } },
                    },
                    example: {
                        classroomId: "65f0c3c6d2f0a2e7c7b4ab32",
                        schoolId: "65f0c3c6d2f0a2e7c7b4ab01",
                    },
                },
            },
        },
        responses: { 200: { description: "Student transferred" }, ...buildCommonResponses({ include404: true }) },
    },
};

const paths = {};

for (const route of routesConfig.routes) {
    const target = route.target;
    const doc = endpointDocs[target] || {
        summary: target,
        tags: ["General"],
        responses: buildCommonResponses({}),
    };
    const method = (route.method || "get").toLowerCase();
    const oaPath = expressPathToOpenApi(`${routesConfig.basePath}${route.path}`);
    if (!paths[oaPath]) paths[oaPath] = {};
    paths[oaPath][method] = {
        summary: doc.summary,
        tags: doc.tags,
        security: doc.security,
        parameters: doc.parameters,
        requestBody: doc.requestBody,
        responses: normalizeResponses(doc),
    };
}

module.exports = {
    openapi: "3.0.3",
    info: {
        title: "School Management API",
        version: "1.0.0",
        description: "Exhaustive route documentation generated from routes config and manager contracts.",
    },
    servers: [{ url: "http://localhost:5111", description: "Local server" }],
    tags: [
        { name: "Auth" },
        { name: "Users" },
        { name: "Schools" },
        { name: "Classrooms" },
        { name: "Students" },
        { name: "General" },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
        schemas: componentSchemas,
    },
    paths,
};
