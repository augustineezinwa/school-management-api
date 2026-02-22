const request = require("supertest");
const { createTestContext } = require("../../../../tests/integration/helpers/testApp");

describe("User functionality integration", () => {
    let ctx;
    let superToken;

    beforeAll(async () => {
        ctx = await createTestContext();
    });

    beforeEach(async () => {
        await ctx.clearDb();
        const { user } = await ctx.seedUser({ role: "super_admin", email: `super-user-func-${Date.now()}@example.com` });
        superToken = ctx.makeToken({ userId: user._id, role: "super_admin" });
    });

    afterAll(async () => {
        await ctx.close();
    });

    test("login succeeds with valid credentials", async () => {
        const school = await ctx.seedSchool({ name: "Login School", slug: "login-school" });
        const { user, password } = await ctx.seedUser({
            role: "school_admin",
            schoolId: school._id,
            email: `login-user-${Date.now()}@example.com`,
        });

        const res = await request(ctx.app).post("/api/auth/login").send({
            email: user.email,
            password,
        });

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.data.token).toBeTruthy();

        const found = await ctx.models.user.findById(user._id);
        expect(found).not.toBeNull();
        expect(found.email).toBe(user.email);
        expect(found.role).toBe("school_admin");
        expect(String(found.schoolId)).toBe(String(school._id));
    });

    test("change password succeeds and old password no longer works", async () => {
        const school = await ctx.seedSchool({ name: "Pwd School", slug: "pwd-school" });
        const { user, password } = await ctx.seedUser({
            role: "school_admin",
            schoolId: school._id,
            email: `pwd-user-${Date.now()}@example.com`,
        });

        const loginRes = await request(ctx.app).post("/api/auth/login").send({ email: user.email, password });
        const userToken = loginRes.body.data.token;

        const changeRes = await request(ctx.app)
            .patch("/api/users/change-password")
            .set("token", userToken)
            .send({ password, newPassword: "BrandNewPass123!" });

        expect(changeRes.status).toBe(200);
        expect(changeRes.body.ok).toBe(true);

        const oldLogin = await request(ctx.app).post("/api/auth/login").send({ email: user.email, password });
        expect(oldLogin.status).toBe(401);

        const newLogin = await request(ctx.app).post("/api/auth/login").send({ email: user.email, password: "BrandNewPass123!" });
        expect(newLogin.status).toBe(200);
        expect(newLogin.body.ok).toBe(true);

        const found = await ctx.models.user.findById(user._id);
        expect(found).not.toBeNull();
    });

    test("assign admin to school updates schoolId", async () => {
        const school = await ctx.seedSchool({ name: "Assign School", slug: "assign-school" });
        const { user: target } = await ctx.seedUser({
            role: "school_admin",
            schoolId: null,
            email: `assign-target-${Date.now()}@example.com`,
        });

        const res = await request(ctx.app)
            .patch(`/api/users/${target._id}/assign-school`)
            .set("token", superToken)
            .send({ schoolId: String(school._id) });

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(String(res.body.data.user.schoolId)).toBe(String(school._id));

        const found = await ctx.models.user.findById(target._id);
        expect(found).not.toBeNull();
        expect(String(found.schoolId)).toBe(String(school._id));
    });
});
