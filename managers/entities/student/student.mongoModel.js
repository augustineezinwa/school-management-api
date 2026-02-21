const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    admissionNumber: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    dateOfBirth: {
        type: Date,
        required: true,
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female'],
    },
    classroomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'classrooms',
        required: true,
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'schools',
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    enrolledAt: {
        type: Date,
        required: true,
    },
});

StudentSchema.index({ admissionNumber: 1, schoolId: 1 }, { unique: true,  collation: { strength: 2, locale: 'en' } });

module.exports = mongoose.models.students || mongoose.model('students', StudentSchema);