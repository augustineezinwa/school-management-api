const request = require("supertest");
const { createTestContext } = require("../../../../tests/integration/helpers/testApp");

describe("User validation integration", () => {
    let ctx;
    let superToken;

    beforeAll(async () => {
        ctx = await createTestContext();
    });

    beforeEach(async () => {
        await ctx.clearDb();
        const { user } = await ctx.seedUser({ role: "super_admin", email: `super-user-val-${Date.now()}@example.com` });
        superToken = ctx.makeToken({ userId: user._id, role: "super_admin" });
    });

    afterAll(async () => {
        await ctx.close();
    });

    test("create user fails when required fields are missing", async () => {
        const res = await request(ctx.app).post("/api/users").set("token", superToken).send({
            email: "incomplete@example.com",
            firstName: "NoPassword",
        });
        expect(res.status).toBe(422);
        expect(res.body.ok).toBe(false);
        expect(res.body.message).toBe("validation failed");
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBe(2);
        expect(res.body.errors[0].message).toBe("password is required");
        expect(res.body.errors[1].message).toBe("lastName is required");
    });

    test("login fails when password is missing", async () => {
        const res = await request(ctx.app).post("/api/auth/login").send({ email: "test@example.com" });
        expect(res.status).toBe(422);
        expect(res.body.ok).toBe(false);
        expect(res.body.message).toBe("validation failed");
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBe(1);
        expect(res.body.errors[0].message).toBe("password is required");
    });

    test("login fails when email is missing", async () => {
        const res = await request(ctx.app).post("/api/auth/login").send({ password: "test@example.com" });
        expect(res.status).toBe(422);
        expect(res.body.ok).toBe(false);
        expect(res.body.message).toBe("validation failed");
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBe(1);
        expect(res.body.errors[0].message).toBe("email is required");
        
    });

    test("manage user fails with invalid id", async () => {
        const res = await request(ctx.app).patch("/api/users/not-valid-id").set("token", superToken).send({ firstName: "NewName" });
        expect(res.status).toBe(422);
        expect(res.body.ok).toBe(false);
    });
});
