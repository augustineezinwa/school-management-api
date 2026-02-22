const request = require("supertest");
const { createTestContext } = require("../../../../tests/integration/helpers/testApp");

describe("Classroom functionality integration", () => {
    let ctx;
    let superToken;

    beforeAll(async () => {
        ctx = await createTestContext();
    });

    beforeEach(async () => {
        await ctx.clearDb();
        const { user } = await ctx.seedUser({ role: "super_admin", email: `super-func-${Date.now()}@example.com` });
        superToken = ctx.makeToken({ userId: user._id, role: "super_admin" });
    });

    afterAll(async () => {
        await ctx.close();
    });

    test("create and list classrooms by school", async () => {
        const school = await ctx.seedSchool({ name: "Func School", slug: "func-school" });

        const createClassroomResponse = await request(ctx.app)
            .post("/api/classrooms")
            .set("token", superToken)
            .send({
                name: "JS1",
                level: "JSS1",
                capacity: 40,
                numberOfDesks: 20,
                numberOfComputers: 5,
                hasProjector: false,
                schoolId: String(school._id),
            });

        expect(createClassroomResponse.status).toBe(200);
        expect(createClassroomResponse.body.ok).toBe(true);

        const listClassroomsResponse = await request(ctx.app).get(`/api/schools/${school._id}/classrooms`).set("token", superToken);
        expect(listClassroomsResponse.status).toBe(200);
        expect(listClassroomsResponse.body.ok).toBe(true);
        expect(Array.isArray(listClassroomsResponse.body.data.classrooms)).toBe(true);
        expect(listClassroomsResponse.body.data.classrooms.length).toBe(1);

        const classroomId = createClassroomResponse.body.data.classroom._id;
        const found = await ctx.models.classroom.findById(classroomId);
        expect(found).not.toBeNull();
        expect(found.name).toBe("JS1");
        expect(found.level).toBe("JSS1");
        expect(String(found.schoolId)).toBe(String(school._id));
    });

    test("manage classroom updates capacity and equipment", async () => {
        const school = await ctx.seedSchool({ name: "Manage School", slug: "manage-school" });
        const classroom = await ctx.seedClassroom(school._id, {
            name: "JS1",
            level: "JSS1",
            capacity: 30,
            numberOfDesks: 15,
            numberOfComputers: 3,
            hasProjector: false,
        });

        const manageClassroomResponse = await request(ctx.app)
            .patch(`/api/classrooms/${classroom._id}`)
            .set("token", superToken)
            .send({
                capacity: 45,
                numberOfDesks: 25,
                numberOfComputers: 10,
                hasProjector: true,
                status: "active",
            });

        expect(manageClassroomResponse.status).toBe(200);
        expect(manageClassroomResponse.body.ok).toBe(true);
        expect(manageClassroomResponse.body.data.classroom.capacity).toBe(45);
        expect(manageClassroomResponse.body.data.classroom.numberOfDesks).toBe(25);
        expect(manageClassroomResponse.body.data.classroom.numberOfComputers).toBe(10);
        expect(manageClassroomResponse.body.data.classroom.hasProjector).toBe(true);
        expect(manageClassroomResponse.body.data.classroom.status).toBe("active");

        const classroomListResponse = await request(ctx.app).get(`/api/schools/${school._id}/classrooms`).set("token", superToken);
        expect(classroomListResponse.status).toBe(200);
        const updated = classroomListResponse.body.data.classrooms.find((c) => String(c._id) === String(classroom._id));
        expect(updated).toBeDefined();
        expect(updated.capacity).toBe(45);
        expect(updated.hasProjector).toBe(true);

        const found = await ctx.models.classroom.findById(classroom._id);
        expect(found).not.toBeNull();
        expect(found.capacity).toBe(45);
        expect(found.numberOfDesks).toBe(25);
        expect(found.numberOfComputers).toBe(10);
        expect(found.hasProjector).toBe(true);
        expect(found.status).toBe("active");
    });

    /**
     * This test is skipped because we are using mongoose memory db for better performance in tests.
     * mongoose memory db doesnt support transactions.
     * 
     * To run this test, you need to use a real mongodb instance.
     * You can set the TEST_MONGO_URI environment variable to the uri of your mongodb instance.
     * For example:
     * process.env.TEST_MONGO_URI = "mongodb://localhost:27017/test";
     * 
     * Then run the test with the command:
     * npm run test:integration:classroom.functionality.test
     * 
     * This will run the test against the real mongodb instance.
     */
    xtest("delete classroom cascades to students in that classroom", async () => {
        const school = await ctx.seedSchool({ name: "Cascade School", slug: "cascade-school" });
        const classroom = await ctx.seedClassroom(school._id, { name: "Cascade Class" });
        await ctx.seedStudent({ schoolId: school._id, classroomId: classroom._id });

        const deleteClassroomResponse = await request(ctx.app).delete(`/api/classrooms/${classroom._id}`).set("token", superToken);
        expect(deleteClassroomResponse.status).toBe(200);
        expect(deleteClassroomResponse.body.ok).toBe(true);

        const remainingStudents = await ctx.models.student.find({ classroomId: classroom._id });
        expect(remainingStudents.length).toBe(0);
    });
});
