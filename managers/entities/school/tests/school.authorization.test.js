const request = require("supertest");
const { createTestContext } = require("../../../../tests/integration/helpers/testApp");

describe("School authorization integration", () => {
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

    test("school_admin cannot view another school", async () => {
        const schoolA = await ctx.seedSchool({ name: "Auth School A", slug: "auth-school-a" });
        const schoolB = await ctx.seedSchool({ name: "Auth School B", slug: "auth-school-b", email: "b-auth@example.com" });
        const { user } = await ctx.seedUser({ role: "school_admin", schoolId: schoolA._id });
        const token = ctx.makeToken({ userId: user._id, role: "school_admin", schoolId: schoolA._id });

        const res = await request(ctx.app).get(`/api/schools/${schoolB._id}`).set("token", token);
        expect(res.status).toBe(403);
        expect(res.body.ok).toBe(false);
    });

    test("school_admin can view own school", async () => {
        const schoolA = await ctx.seedSchool({ name: "Auth School A2", slug: "auth-school-a2", email: "a2-auth@example.com" });
        const { user } = await ctx.seedUser({ role: "school_admin", schoolId: schoolA._id, email: "a2-admin@example.com" });
        const token = ctx.makeToken({ userId: user._id, role: "school_admin", schoolId: schoolA._id });

        const res = await request(ctx.app).get(`/api/schools/${schoolA._id}`).set("token", token);
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(String(res.body.data.school._id)).toBe(String(schoolA._id));
    });

    test("school_admin cannot list all schools", async () => {
        const schoolA = await ctx.seedSchool({ name: "Auth School A3", slug: "auth-school-a3", email: "a3-auth@example.com" });
        const { user } = await ctx.seedUser({ role: "school_admin", schoolId: schoolA._id, email: "a3-admin@example.com" });
        const token = ctx.makeToken({ userId: user._id, role: "school_admin", schoolId: schoolA._id });

        const res = await request(ctx.app).get("/api/schools").set("token", token);
        expect(res.status).toBe(403);
        expect(res.body.ok).toBe(false);
    });
});
