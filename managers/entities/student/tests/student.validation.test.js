const request = require("supertest");
const { createTestContext } = require("../../../../tests/integration/helpers/testApp");

describe("Student validation integration", () => {
    let ctx;
    let superToken;

    beforeAll(async () => {
        ctx = await createTestContext();
    });

    beforeEach(async () => {
        await ctx.clearDb();
        const { user } = await ctx.seedUser({ role: "super_admin", email: `super-student-${Date.now()}@example.com` });
        superToken = ctx.makeToken({ userId: user._id, role: "super_admin" });
    });

    afterAll(async () => {
        await ctx.close();
    });

    test("enroll student fails when required fields are missing", async () => {
        const res = await request(ctx.app).post("/api/students").set("token", superToken).send({ firstName: "OnlyFirstName" });
        expect(res.status).toBe(422);
        expect(res.body.ok).toBe(false);
        expect(res.body.message).toBe("validation failed");
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBe(6);
        expect(res.body.errors[0].message).toBe("admissionNumber is required");
        expect(res.body.errors[1].message).toBe("lastName is required");
        expect(res.body.errors[2].message).toBe("dateOfBirth is required");
        expect(res.body.errors[3].message).toBe("gender is required");
        expect(res.body.errors[4].message).toBe("classroomId is required");
        expect(res.body.errors[5].message).toBe("schoolId is required");
    });

    test("get student by id fails with invalid id", async () => {
        const res = await request(ctx.app).get("/api/students/not-valid-id").set("token", superToken);
        expect(res.status).toBe(422);
        expect(res.body.ok).toBe(false);
        expect(res.body.message).toBe("validation failed");
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBe(1);
        expect(res.body.errors[0].message).toBe("id has invalid length");
    });

    test("transfer student fails when required fields are missing", async () => {
        const res = await request(ctx.app).patch("/api/students/64f0c3c6d2f0a2e7c7b4ab51/transfer").set("token", superToken).send({});
        expect(res.status).toBe(422);
        expect(res.body.ok).toBe(false);
        expect(res.body.message).toBe("validation failed");
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBe(2);
        expect(res.body.errors[0].message).toBe("classroomId is required");
        expect(res.body.errors[1].message).toBe("schoolId is required");
    });
});
