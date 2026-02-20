const mongoose = require('mongoose');

const ClassroomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    level: {
        type: String,
        required: true,
    },
    capacity: {
        type: Number,
        required: true,
        default: 0,
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    numberOfDesks: {
        type: Number,
        required: false,
        default: 0,
    },
    numberOfComputers: {
        type: Number,
        required: true,
        default: 0,
    },
    hasProjector: {
        type: Boolean,
        required: false,
        default: false,
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'schools',
        required: true,
    },

}, {timestamps: true });

ClassroomSchema.index({ name: 1, schoolId: 1 }, { unique: true, locale: 'en', collation: { strength: 2 } });

module.exports = mongoose.models.classrooms || mongoose.model('classrooms', ClassroomSchema);