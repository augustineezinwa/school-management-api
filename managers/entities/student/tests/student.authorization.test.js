const request = require("supertest");
const { createTestContext } = require("../../../../tests/integration/helpers/testApp");

describe("Student authorization integration", () => {
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

    test("school_admin cannot access student from another school", async () => {
        const schoolA = await ctx.seedSchool({ name: "Student Auth A", slug: "student-auth-a" });
        const schoolB = await ctx.seedSchool({ name: "Student Auth B", slug: "student-auth-b", email: "st-b@example.com" });
        const classB = await ctx.seedClassroom(schoolB._id, { name: "B-Class-Student" });
        const studentB = await ctx.seedStudent({ schoolId: schoolB._id, classroomId: classB._id });
        const { user } = await ctx.seedUser({ role: "school_admin", schoolId: schoolA._id, email: "student-auth-a-admin@example.com" });
        const token = ctx.makeToken({ userId: user._id, role: "school_admin", schoolId: schoolA._id });

        const res = await request(ctx.app).get(`/api/students/${studentB._id}`).set("token", token);
        expect(res.status).toBe(403);
        expect(res.body.ok).toBe(false);
    });

    test("school_admin can access own student", async () => {
        const schoolA = await ctx.seedSchool({ name: "Student Auth A2", slug: "student-auth-a2", email: "st-a2@example.com" });
        const classA = await ctx.seedClassroom(schoolA._id, { name: "A2-Class-Student" });
        const studentA = await ctx.seedStudent({ schoolId: schoolA._id, classroomId: classA._id });
        const { user } = await ctx.seedUser({ role: "school_admin", schoolId: schoolA._id, email: "student-auth-a2-admin@example.com" });
        const token = ctx.makeToken({ userId: user._id, role: "school_admin", schoolId: schoolA._id });

        const res = await request(ctx.app).get(`/api/students/${studentA._id}`).set("token", token);
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.data.student).toBeDefined();
        expect(String(res.body.data.student._id)).toBe(String(studentA._id));
    });

    test("school_admin cannot delete student from another school", async () => {
        const schoolA = await ctx.seedSchool({ name: "Student Auth A3", slug: "student-auth-a3", email: "st-a3@example.com" });
        const schoolB = await ctx.seedSchool({ name: "Student Auth B3", slug: "student-auth-b3", email: "st-b3@example.com" });
        const classB = await ctx.seedClassroom(schoolB._id, { name: "B3-Class-Student" });
        const studentB = await ctx.seedStudent({ schoolId: schoolB._id, classroomId: classB._id });
        const { user } = await ctx.seedUser({ role: "school_admin", schoolId: schoolA._id, email: "student-auth-a3-admin@example.com" });
        const token = ctx.makeToken({ userId: user._id, role: "school_admin", schoolId: schoolA._id });

        const res = await request(ctx.app).delete(`/api/students/${studentB._id}`).set("token", token);
        expect(res.status).toBe(403);
        expect(res.body.ok).toBe(false);
    });
});
