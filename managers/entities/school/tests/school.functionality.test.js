const request = require("supertest");
const { createTestContext } = require("../../../../tests/integration/helpers/testApp");

describe("School functionality integration", () => {
    let ctx;
    let superToken;

    beforeAll(async () => {
        ctx = await createTestContext();
    });

    beforeEach(async () => {
        await ctx.clearDb();
        const { user } = await ctx.seedUser({ role: "super_admin", email: `super-school-func-${Date.now()}@example.com` });
        superToken = ctx.makeToken({ userId: user._id, role: "super_admin" });
    });

    afterAll(async () => {
        await ctx.close();
    });

    test("create and fetch school by id", async () => {
        const createRes = await request(ctx.app)
            .post("/api/schools")
            .set("token", superToken)
            .send({
                name: "Function School",
                email: "function-school@example.com",
                phone: "+2348012345678",
                address: "12 Marina Road, Lagos",
                website: "https://function-school.example.com",
                motto: "Build with purpose",
                establishedYear: "2012",
                imageUrl: "https://function-school.example.com/logo.png",
            });

        expect(createRes.status).toBe(200);
        expect(createRes.body.ok).toBe(true);
        const schoolId = createRes.body.data.school._id;

        const getRes = await request(ctx.app).get(`/api/schools/${schoolId}`).set("token", superToken);
        expect(getRes.status).toBe(200);
        expect(getRes.body.ok).toBe(true);
        expect(getRes.body.data.school.name).toBe("Function School");

        const found = await ctx.models.school.findById(schoolId);
        expect(found).not.toBeNull();
        expect(found.name).toBe("Function School");
        expect(found.email).toBe("function-school@example.com");
    });

    test("update school by id persists new values", async () => {
        const school = await ctx.seedSchool({ name: "Old School", slug: "old-school", email: "old-school@example.com" });

        const updateRes = await request(ctx.app)
            .put(`/api/schools/${school._id}`)
            .set("token", superToken)
            .send({
                name: "Updated School Name",
                email: "updated-school@example.com",
                phone: "+2348011111111",
                address: "Updated Address",
                website: "https://updated-school.example.com",
                motto: "Updated Motto",
                establishedYear: "2015",
                imageUrl: "https://updated-school.example.com/logo.png",
            });

        expect(updateRes.status).toBe(200);
        expect(updateRes.body.ok).toBe(true);
        expect(updateRes.body.data.school.name).toBe("Updated School Name");

        const found = await ctx.models.school.findById(school._id);
        expect(found).not.toBeNull();
        expect(found.name).toBe("Updated School Name");
        expect(found.email).toBe("updated-school@example.com");
    });

    xtest("delete school removes school document", async () => {
        const school = await ctx.seedSchool({ name: "Delete School", slug: "delete-school", email: "delete-school@example.com" });

        const delRes = await request(ctx.app).delete(`/api/schools/${school._id}`).set("token", superToken);
        expect(delRes.status).toBe(200);
        expect(delRes.body.ok).toBe(true);
        expect(delRes.body.data.message).toBe("School deleted successfully");

        const found = await ctx.models.school.findById(school._id);
        expect(found).toBeNull();
    });
});
