const request = require("supertest");
const { createTestContext } = require("../../../../tests/integration/helpers/testApp");

describe("Student functionality integration (super admin)", () => {
    let ctx;
    let superToken;

    beforeAll(async () => {
        ctx = await createTestContext();
    });

    beforeEach(async () => {
        await ctx.clearDb();
        const { user } = await ctx.seedUser({ role: "super_admin", email: `super-student-func-${Date.now()}@example.com` });
        superToken = ctx.makeToken({ userId: user._id, role: "super_admin" });
    });

    afterAll(async () => {
        await ctx.close();
    });

    test("enroll and fetch student by id", async () => {
        const school = await ctx.seedSchool({ name: "Student Func School", slug: "student-func-school" });
        const classroom = await ctx.seedClassroom(school._id, { name: "Student Func Class" });

        const enrollRes = await request(ctx.app)
            .post("/api/students")
            .set("token", superToken)
            .send({
                admissionNumber: "ADM-TEST-001",
                firstName: "John",
                lastName: "Doe",
                dateOfBirth: "2014-05-10",
                gender: "male",
                classroomId: String(classroom._id),
                schoolId: String(school._id),
            });

        expect(enrollRes.status).toBe(200);
        expect(enrollRes.body.ok).toBe(true);
        const studentId = enrollRes.body.data.student._id;

        const getRes = await request(ctx.app).get(`/api/students/${studentId}`).set("token", superToken);
        expect(getRes.status).toBe(200);
        expect(getRes.body.ok).toBe(true);
        expect(getRes.body.data.student.firstName).toBe("John");

        const found = await ctx.models.student.findById(studentId);
        expect(found).not.toBeNull();
        expect(found.firstName).toBe("John");
        expect(found.lastName).toBe("Doe");
        expect(found.admissionNumber).toBe("ADM-TEST-001");
        expect(String(found.classroomId)).toBe(String(classroom._id));
        expect(String(found.schoolId)).toBe(String(school._id));
    });

    test("update student profile persists new values", async () => {
        const school = await ctx.seedSchool({ name: "Update Profile School", slug: "update-profile-school" });
        const classroom = await ctx.seedClassroom(school._id, { name: "Update Profile Class" });
        const student = await ctx.seedStudent({
            schoolId: school._id,
            classroomId: classroom._id,
            overrides: {
                admissionNumber: "ADM-PROFILE-001",
                firstName: "Jane",
                lastName: "Smith",
                dateOfBirth: "2013-03-15",
                gender: "female",
                status: "active",
            },
        });

        const updateRes = await request(ctx.app)
            .patch(`/api/students/${student._id}`)
            .set("token", superToken)
            .send({
                admissionNumber: "ADM-PROFILE-002",
                firstName: "Janet",
                lastName: "Smith-Jones",
                dateOfBirth: "2013-03-20",
                gender: "female",
                status: "inactive",
            });

        expect(updateRes.status).toBe(200);
        expect(updateRes.body.ok).toBe(true);
        expect(updateRes.body.data.student.admissionNumber).toBe("ADM-PROFILE-002");
        expect(updateRes.body.data.student.firstName).toBe("Janet");
        expect(updateRes.body.data.student.lastName).toBe("Smith-Jones");
        expect(updateRes.body.data.student.status).toBe("inactive");

        const getRes = await request(ctx.app).get(`/api/students/${student._id}`).set("token", superToken);
        expect(getRes.status).toBe(200);
        expect(getRes.body.data.student.firstName).toBe("Janet");
        expect(getRes.body.data.student.lastName).toBe("Smith-Jones");
        expect(getRes.body.data.student.admissionNumber).toBe("ADM-PROFILE-002");
        expect(getRes.body.data.student.status).toBe("inactive");

        const found = await ctx.models.student.findById(student._id);
        expect(found).not.toBeNull();
        expect(found.firstName).toBe("Janet");
        expect(found.lastName).toBe("Smith-Jones");
        expect(found.admissionNumber).toBe("ADM-PROFILE-002");
        expect(found.status).toBe("inactive");
    });

    test("transfer student updates classroom and school", async () => {
        const schoolA = await ctx.seedSchool({ name: "Transfer School A", slug: "transfer-school-a" });
        const schoolB = await ctx.seedSchool({ name: "Transfer School B", slug: "transfer-school-b", email: "transfer-b@example.com" });
        const classA = await ctx.seedClassroom(schoolA._id, { name: "A-Class" });
        const classB = await ctx.seedClassroom(schoolB._id, { name: "B-Class" });
        const student = await ctx.seedStudent({ schoolId: schoolA._id, classroomId: classA._id });

        const transferRes = await request(ctx.app)
            .patch(`/api/students/${student._id}/transfer`)
            .set("token", superToken)
            .send({
                classroomId: String(classB._id),
                schoolId: String(schoolB._id),
            });


        expect(transferRes.status).toBe(200);
        expect(transferRes.body.ok).toBe(true);
        expect(transferRes.body.data.message).toBe('Student transferred successfully');
        expect(String(transferRes.body.data.student.classroomId)).toBe(String(classB._id));
        expect(String(transferRes.body.data.student.schoolId)).toBe(String(schoolB._id));

        const found = await ctx.models.student.findById(student._id);
        expect(found).not.toBeNull();
        expect(String(found.classroomId)).toBe(String(classB._id));
        expect(String(found.schoolId)).toBe(String(schoolB._id));
    });

    test("delete student removes record", async () => {
        const school = await ctx.seedSchool({ name: "Delete Student School", slug: "delete-student-school" });
        const classroom = await ctx.seedClassroom(school._id, { name: "Delete Student Class" });
        const student = await ctx.seedStudent({ schoolId: school._id, classroomId: classroom._id });

        const deleteRes = await request(ctx.app).delete(`/api/students/${student._id}`).set("token", superToken);
        expect(deleteRes.status).toBe(200);
        expect(deleteRes.body.ok).toBe(true);

        const found = await ctx.models.student.findById(student._id);
        expect(found).toBeNull();
    });
});

describe("Student functionality integration (school admin)", () => {
    let ctx;
    let schoolAdminToken;
    let school;

    beforeAll(async () => {
        ctx = await createTestContext();
    });

    beforeEach(async () => {
        await ctx.clearDb();
        school = await ctx.seedSchool({ name: "Student Func School", slug: "student-func-school" });
        const { user } = await ctx.seedUser({ role: "school_admin", schoolId: school._id, email: `school-admin-student-func-${Date.now()}@example.com` });
        schoolAdminToken = ctx.makeToken({ userId: user._id, role: "school_admin", schoolId: school._id });
    });

    afterAll(async () => {
        await ctx.close();
    });

    test("enroll and fetch student by id", async () => {
        const classroom = await ctx.seedClassroom(school._id, { name: "Student Func Class" });

        const enrollRes = await request(ctx.app).post("/api/students")
            .set("token", schoolAdminToken)
            .send({
                admissionNumber: "ADM-TEST-001",
                firstName: "John",
                lastName: "Doe",
                dateOfBirth: "2014-05-10",
                gender: "male",
                classroomId: String(classroom._id),
                schoolId: String(school._id),
            });

        expect(enrollRes.status).toBe(200);
        expect(enrollRes.body.ok).toBe(true);
        const studentId = enrollRes.body.data.student._id;

        const getRes = await request(ctx.app).get(`/api/students/${studentId}`).set("token", schoolAdminToken);
        expect(getRes.status).toBe(200);
        expect(getRes.body.ok).toBe(true);
        expect(getRes.body.data.student.firstName).toBe("John");

        const found = await ctx.models.student.findById(studentId);
        expect(found).not.toBeNull();
        expect(found.firstName).toBe("John");
        expect(found.lastName).toBe("Doe");
        expect(found.admissionNumber).toBe("ADM-TEST-001");
        expect(String(found.classroomId)).toBe(String(classroom._id));
        expect(String(found.schoolId)).toBe(String(school._id));
    });

    test("update student profile persists new values", async () => {
        const classroom = await ctx.seedClassroom(school._id, { name: "Update Profile Class" });
        const student = await ctx.seedStudent({
            schoolId: school._id,
            classroomId: classroom._id,
            overrides: {
                admissionNumber: "ADM-PROFILE-001",
                firstName: "Jane",
                lastName: "Smith",
                dateOfBirth: "2013-03-15",
                gender: "female",
                status: "active",
            },
        });

        const updateRes = await request(ctx.app)
            .patch(`/api/students/${student._id}`)
            .set("token", schoolAdminToken)
            .send({
                admissionNumber: "ADM-PROFILE-002",
                firstName: "Janet",
                lastName: "Smith-Jones",
                dateOfBirth: "2013-03-20",
                gender: "female",
                status: "inactive",
            });

        expect(updateRes.status).toBe(200);
        expect(updateRes.body.ok).toBe(true);
        expect(updateRes.body.data.student.admissionNumber).toBe("ADM-PROFILE-002");
        expect(updateRes.body.data.student.firstName).toBe("Janet");
        expect(updateRes.body.data.student.lastName).toBe("Smith-Jones");
        expect(updateRes.body.data.student.status).toBe("inactive");

        const getRes = await request(ctx.app).get(`/api/students/${student._id}`).set("token", schoolAdminToken);
        expect(getRes.status).toBe(200);
        expect(getRes.body.data.student.firstName).toBe("Janet");
        expect(getRes.body.data.student.lastName).toBe("Smith-Jones");
        expect(getRes.body.data.student.admissionNumber).toBe("ADM-PROFILE-002");
        expect(getRes.body.data.student.status).toBe("inactive");

        const found = await ctx.models.student.findById(student._id);
        expect(found).not.toBeNull();
        expect(found.firstName).toBe("Janet");
        expect(found.lastName).toBe("Smith-Jones");
        expect(found.admissionNumber).toBe("ADM-PROFILE-002");
        expect(found.status).toBe("inactive");
    });

    test("transfer student updates classroom and school", async () => {
        const classA = await ctx.seedClassroom(school._id, { name: "A-Class" });
        const classB = await ctx.seedClassroom(school._id, { name: "B-Class" });
        const student = await ctx.seedStudent({ schoolId: school._id, classroomId: classA._id });

        const transferRes = await request(ctx.app)
            .patch(`/api/students/${student._id}/transfer`)
            .set("token", schoolAdminToken)
            .send({
                classroomId: String(classB._id),
                schoolId: String(school._id),
            });


        expect(transferRes.status).toBe(200);
        expect(transferRes.body.ok).toBe(true);
        expect(transferRes.body.data.message).toBe('Student transferred successfully');
        expect(String(transferRes.body.data.student.classroomId)).toBe(String(classB._id));
        expect(String(transferRes.body.data.student.schoolId)).toBe(String(school._id));

        const found = await ctx.models.student.findById(student._id);
        expect(found).not.toBeNull();
        expect(String(found.classroomId)).toBe(String(classB._id));
        expect(String(found.schoolId)).toBe(String(school._id));
    });

    test("delete student removes record", async () => {
        const classroom = await ctx.seedClassroom(school._id, { name: "Delete Student Class" });
        const student = await ctx.seedStudent({ schoolId: school._id, classroomId: classroom._id });

        const deleteRes = await request(ctx.app).delete(`/api/students/${student._id}`).set("token", schoolAdminToken);
        expect(deleteRes.status).toBe(200);
        expect(deleteRes.body.ok).toBe(true);

        const found = await ctx.models.student.findById(student._id);
        expect(found).toBeNull();
    });
});
