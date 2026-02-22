const request = require("supertest");
const { createTestContext } = require("../../../../tests/integration/helpers/testApp");

describe("Classroom authorization integration", () => {
    let ctx;

    beforeAll(async () => {
        ctx = await createTestContext();
    });

    beforeEach(async () => {
        await ctx.clearDb();
    });

    afterAll(async () => {
        await ctx.close();
    });

    test("school_admin cannot manage classroom from another school", async () => {
        const schoolA = await ctx.seedSchool({ name: "School A", slug: "school-a" });
        const schoolB = await ctx.seedSchool({ name: "School B", slug: "school-b", email: "b@example.com" });
        const classroomB = await ctx.seedClassroom(schoolB._id, { name: "B-Class" });
        const { user } = await ctx.seedUser({ role: "school_admin", schoolId: schoolA._id });
        const token = ctx.makeToken({ userId: user._id, role: "school_admin", schoolId: schoolA._id });

        const res = await request(ctx.app)
            .patch(`/api/classrooms/${classroomB._id}`)
            .set("token", token)
            .send({ capacity: 55 });

        expect(res.status).toBe(403);
        expect(res.body.ok).toBe(false);
    });

    test("school_admin can manage own classroom", async () => {
        const schoolA = await ctx.seedSchool({ name: "School A2", slug: "school-a2", email: "a2@example.com" });
        const classroomA = await ctx.seedClassroom(schoolA._id, { name: "A-Class" });
        const { user } = await ctx.seedUser({ role: "school_admin", schoolId: schoolA._id, email: "a-class-admin@example.com" });
        const token = ctx.makeToken({ userId: user._id, role: "school_admin", schoolId: schoolA._id });

        const res = await request(ctx.app)
            .patch(`/api/classrooms/${classroomA._id}`)
            .set("token", token)
            .send({ capacity: 55 });

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.data.classroom.capacity).toBe(55);
    });

    test("school_admin cannot list classrooms for another school", async () => {
        const schoolA = await ctx.seedSchool({ name: "School A3", slug: "school-a3", email: "a3@example.com" });
        const schoolB = await ctx.seedSchool({ name: "School B3", slug: "school-b3", email: "b3@example.com" });
        await ctx.seedClassroom(schoolB._id, { name: "B3-Class" });
        const { user } = await ctx.seedUser({ role: "school_admin", schoolId: schoolA._id, email: "a3-admin@example.com" });
        const token = ctx.makeToken({ userId: user._id, role: "school_admin", schoolId: schoolA._id });

        const res = await request(ctx.app).get(`/api/schools/${schoolB._id}/classrooms`).set("token", token);

        expect(res.status).toBe(403);
        expect(res.body.ok).toBe(false);
        expect(res.body.errors).toBe('forbidden');
    });
});
