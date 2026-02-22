const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");

let sharedMongo = {
    mongod: null,
    uri: null,
};

function clearRequire(modulePath) {
    try {
        delete require.cache[require.resolve(modulePath)];
    } catch (err) {
        // ignore missing module in cache
    }
}

function createStubs() {
    const cortex = {
        nodeType: "test-node",
        sub: () => {},
        AsyncEmitToAllOf: () => {},
    };
    const oyster = {
        call: async () => ({}),
    };
    const cache = {
        db: () => ({ add: () => {}, get: () => null, delete: () => {} }),
    };
    const aeon = {};
    return { cortex, oyster, cache, aeon };
}

function buildTestApp({ userApi, routesConfig }) {
    const app = express();
    app.use(cors({ origin: "*" }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    const basePath = routesConfig?.basePath || "/api";
    const routes = routesConfig?.routes || [];

    routes.forEach((route) => {
        const method = (route.method || "get").toLowerCase();
        const routePath = `${basePath}${route.path}`;
        const [moduleName, fnName] = (route.target || "").split(".");
        if (!moduleName || !fnName || typeof app[method] !== "function") return;

        app[method](routePath, (req, res, next) => {
            req.params = { ...(req.params || {}), moduleName, fnName };
            return userApi.mw(req, res, next);
        });
    });

    app.all("/api/:moduleName/:fnName", userApi.mw);
    app.all("/api/:moduleName/:fnName/:id", userApi.mw);
    return app;
}

async function createTestContext() {
    if (!sharedMongo.mongod) {
        sharedMongo.mongod = await MongoMemoryServer.create({
            instance: { port: 0 },
        });
        sharedMongo.uri = sharedMongo.mongod.getUri();
    }
    const mongoUri = process.env.TEST_MONGO_URI || sharedMongo.uri;

    process.env.ENV = "test";
    process.env.MONGO_URI = mongoUri;
    process.env.LONG_TOKEN_SECRET = process.env.LONG_TOKEN_SECRET || "test-long-secret";
    process.env.SHORT_TOKEN_SECRET = process.env.SHORT_TOKEN_SECRET || "test-short-secret";
    process.env.NACL_SECRET = process.env.NACL_SECRET || "test-nacl-secret";
    process.env.USER_PORT = process.env.USER_PORT || "5111";

    clearRequire("../../config/index.config");
    clearRequire("../../loaders/ManagersLoader");

    const connectMongo = require("../../../connect/mongo");
    connectMongo({ uri: mongoUri });
    await mongoose.connection.asPromise();

    const config = require("../../../config/index.config");
    const ManagersLoader = require("../../../loaders/ManagersLoader");
    const stubs = createStubs();
    const loader = new ManagersLoader({ config, ...stubs });
    const managers = loader.load();
    const app = buildTestApp({ userApi: managers.userApi, routesConfig: config.routesConfig });

    const models = managers.user.mongomodels;

    const makeToken = ({ userId, role = "school_admin", schoolId = null }) =>
        jwt.sign({ userId: String(userId), role, schoolId: schoolId ? String(schoolId) : null }, config.dotEnv.LONG_TOKEN_SECRET, {
            expiresIn: "1h",
        });

    const seedSchool = async (overrides = {}) => {
        const school = await models.school.create({
            name: overrides.name || `School ${Date.now()}-${Math.random()}`,
            slug: overrides.slug || `school-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
            email: overrides.email || `school-${Date.now()}@example.com`,
            phone: overrides.phone || "+2348012345678",
            address: overrides.address || "12 Marina Road, Lagos",
            website: overrides.website || "https://school.example.com",
            motto: overrides.motto || "Learn and lead",
            establishedYear: overrides.establishedYear || "2010",
            imageUrl: overrides.imageUrl || "https://school.example.com/logo.png",
            ...overrides,
        });
        return school;
    };

    const seedUser = async (overrides = {}) => {
        const password = overrides.password || "Pass12345!";
        const hashed = await bcrypt.hash(password, 10);
        const user = await models.user.create({
            email: overrides.email || `user-${Date.now()}@example.com`,
            password: hashed,
            firstName: overrides.firstName || "Test",
            lastName: overrides.lastName || "User",
            role: overrides.role || "school_admin",
            status: overrides.status || "active",
            schoolId: overrides.schoolId || null,
        });
        return { user, password };
    };

    const seedClassroom = async (schoolId, overrides = {}) => {
        return models.classroom.create({
            name: overrides.name || `Class ${Date.now()}`,
            level: overrides.level || "JSS2",
            capacity: overrides.capacity || 40,
            numberOfDesks: overrides.numberOfDesks || 20,
            numberOfComputers: overrides.numberOfComputers || 10,
            hasProjector: overrides.hasProjector ?? true,
            status: overrides.status || "active",
            schoolId,
        });
    };

    const seedStudent = async ({ schoolId, classroomId, overrides = {} }) => {
        return models.student.create({
            admissionNumber: overrides.admissionNumber || `ADM-${Date.now()}`,
            firstName: overrides.firstName || "John",
            lastName: overrides.lastName || "Doe",
            dateOfBirth: overrides.dateOfBirth || new Date("2014-05-10"),
            gender: overrides.gender || "male",
            classroomId,
            schoolId,
            status: overrides.status || "active",
            enrolledAt: overrides.enrolledAt || new Date(),
        });
    };

    const clearDb = async () => {
        const collections = Object.values(mongoose.connection.collections);
        for (const collection of collections) {
            await collection.deleteMany({});
        }
    };

    const close = async () => {
        if (mongoose.connection.readyState) {
            await mongoose.connection.dropDatabase();
            await mongoose.disconnect();
        }

        if (sharedMongo.mongod) {
            await sharedMongo.mongod.stop();
            sharedMongo = { mongod: null, uri: null };
        }
    };

    return {
        app,
        config,
        managers,
        models,
        makeToken,
        seedSchool,
        seedUser,
        seedClassroom,
        seedStudent,
        clearDb,
        close,
    };
}

module.exports = { createTestContext };
