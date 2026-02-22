const request = require("supertest");
const { createTestContext } = require("../../../../tests/integration/helpers/testApp");

describe("School validation integration", () => {
    let ctx;
    let superToken;

    beforeAll(async () => {
        ctx = await createTestContext();
    });

    beforeEach(async () => {
        await ctx.clearDb();
        const { user } = await ctx.seedUser({ role: "super_admin", email: `super-school-${Date.now()}@example.com` });
        superToken = ctx.makeToken({ userId: user._id, role: "super_admin" });
    });

    afterAll(async () => {
        await ctx.close();
    });

    test("create school fails when required fields are missing", async () => {
        const res = await request(ctx.app).post("/api/schools").set("token", superToken).send({ name: "NoEmailSchool" });
        expect(res.status).toBe(422);
        expect(res.body.ok).toBe(false);
        expect(res.body.errors[0].message).toBe("email is required");
        expect(res.body.errors[1].message).toBe("phone is required");
        expect(res.body.errors[2].message).toBe("address is required");
        expect(res.body.errors[3].message).toBe("establishedYear is required");
    });

    test("update school fails with invalid id", async () => {
        const res = await request(ctx.app).put("/api/schools/invalid-id").set("token", superToken).send({
            name: "Updated",
            email: "u@example.com",
            phone: "+2348012345678",
            address: "Somewhere",
            establishedYear: "2011",
        });
        expect(res.status).toBe(422);
        expect(res.body.ok).toBe(false);
    });

    test("update school profile fails with invalid established year", async () => {
        const school = await ctx.seedSchool({ name: "Val School", slug: "val-school", email: "val-school@example.com" });
        const res = await request(ctx.app)
            .patch(`/api/schools/${school._id}/profile`)
            .set("token", superToken)
            .send({
                name: "Val School",
                email: "val-school@example.com",
                phone: "+2348012345678",
                address: "Lagos",
                establishedYear: "123020",
            });
        expect(res.status).toBe(422);
        expect(res.body.errors[0].message).toBe("establishedYear has invalid format");
        expect(res.body.ok).toBe(false);
    });
});
