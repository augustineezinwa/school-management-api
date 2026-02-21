require("dotenv").config();
const mongoose = require("mongoose");

async function run() {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI is required");

    await mongoose.connect(uri, {
        dbName: process.env.MONGO_DATABASE_NAME,
    });

    const User = require("../managers/entities/user/user.mongoModel");
    const School = require("../managers/entities/school/school.mongoModel");
    const ClassRoom = require("../managers/entities/classroom/classroom.mongoModel");
    const Student = require("../managers/entities/student/student.mongoModel");

    const models = [User, School, ClassRoom, Student];

    for (const model of models) {
        await model.createIndexes();
    }

    await mongoose.disconnect();
    console.log("sync complete.");
}
// Run the script
run().catch(async (err) => {
    console.error("sync failed:", err);
    try { await mongoose.disconnect(); } catch (_) { }
    process.exit(1);
});