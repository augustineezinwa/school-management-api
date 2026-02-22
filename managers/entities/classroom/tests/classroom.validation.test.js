const request = require("supertest");
const { createTestContext } = require("../../../../tests/integration/helpers/testApp");

describe("Classroom validation integration", () => {
    let ctx;
    let superToken;

    beforeAll(async () => {
        ctx = await createTestContext();
    });

    beforeEach(async () => {
        await ctx.clearDb();
        const { user } = await ctx.seedUser({ role: "super_admin", email: `super-${Date.now()}@example.com` });
        superToken = ctx.makeToken({ userId: user._id, role: "super_admin" });
    });

    afterAll(async () => {
        await ctx.close();
    });

    test("create classroom fails when required fields are missing", async () => {
        const res = await request(ctx.app).post("/api/classrooms").set("token", superToken).send({ name: "OnlyName" });
        expect(res.status).toBe(422);
        expect(res.body.ok).toBe(false);
        expect(res.body.message).toBe("validation failed");
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBe(3);
        expect(res.body.errors[0].message).toBe("level is required");
        expect(res.body.errors[1].message).toBe("capacity is required");
        expect(res.body.errors[2].message).toBe("schoolId is required");
    });

    test("manage classroom fails for invalid id", async () => {
        const res = await request(ctx.app)
            .patch("/api/classrooms/not-a-valid-id")
            .set("token", superToken)
            .send({ capacity: 80 });
        expect(res.status).toBe(422);
        expect(res.body.ok).toBe(false);
        expect(res.body.message).toBe("validation failed");
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBe(1);
        expect(res.body.errors[0].message).toBe("id has invalid length");
    });

    test("delete classroom fails for invalid id", async () => {
        const res = await request(ctx.app).delete("/api/classrooms/invalid-id").set("token", superToken);
        expect(res.status).toBe(422);
        expect(res.body.ok).toBe(false);
    });
});
