const request = require("supertest");
const { createTestContext } = require("../../../../tests/integration/helpers/testApp");

describe("User authorization integration", () => {
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

    test("school_admin cannot manage another user", async () => {
        const school = await ctx.seedSchool({ name: "User Auth School", slug: "user-auth-school" });
        const { user: actor } = await ctx.seedUser({ role: "school_admin", schoolId: school._id, email: "actor-user-auth@example.com" });
        const { user: target } = await ctx.seedUser({ role: "school_admin", schoolId: school._id, email: "target-user-auth@example.com" });
        const token = ctx.makeToken({ userId: actor._id, role: "school_admin", schoolId: school._id });

        const res = await request(ctx.app)
            .patch(`/api/users/${target._id}`)
            .set("token", token)
            .send({ firstName: "Hacked" });

        expect(res.status).toBe(403);
        expect(res.body.ok).toBe(false);
    });

    test("school_admin cannot assign admin to another school", async () => {
        const school = await ctx.seedSchool({ name: "User Auth School", slug: "user-auth-school" });
        const { user: actor } = await ctx.seedUser({ role: "school_admin", schoolId: school._id, email: "actor-user-auth@example.com" });
        const { user: target } = await ctx.seedUser({ role: "school_admin", schoolId: school._id, email: "target-user-auth@example.com" });
        const token = ctx.makeToken({ userId: actor._id, role: "school_admin", schoolId: school._id });

        const res = await request(ctx.app)
            .patch(`/api/users/${target._id}/assign-school`)
            .set("token", token)
            .send({ schoolId: school._id });

        expect(res.status).toBe(403);
        expect(res.body.ok).toBe(false);
    });

    test("school_admin can manage self", async () => {
        const school = await ctx.seedSchool({ name: "User Auth School 2", slug: "user-auth-school-2", email: "ua2@example.com" });
        const { user } = await ctx.seedUser({ role: "school_admin", schoolId: school._id, email: "self-user-auth@example.com" });
        const token = ctx.makeToken({ userId: user._id, role: "school_admin", schoolId: school._id });

        const res = await request(ctx.app)
            .patch(`/api/users/${user._id}`)
            .set("token", token)
            .send({ firstName: "UpdatedSelf" });

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.data.user.firstName).toBe("UpdatedSelf");
    });

    test("super_admin can manage any user", async () => {
        const school = await ctx.seedSchool({ name: "User Auth School 3", slug: "user-auth-school-3", email: "ua3@example.com" });
        const { user: superAdmin } = await ctx.seedUser({ role: "super_admin", email: "super-user-auth@example.com" });
        const { user: target } = await ctx.seedUser({ role: "school_admin", schoolId: school._id, email: "target-user-auth-3@example.com" });
        const token = ctx.makeToken({ userId: superAdmin._id, role: "super_admin" });

        const res = await request(ctx.app)
            .patch(`/api/users/${target._id}`)
            .set("token", token)
            .send({ firstName: "BySuperAdmin" });

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.data.user.firstName).toBe("BySuperAdmin");
    });
});
