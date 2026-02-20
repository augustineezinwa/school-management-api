const mongoose = require('mongoose');

const SchoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    website: {
        type: String,
        required: false,
    },
    motto: {
        type: String,
        required: false,
    },
    establishedYear: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'inactive'],
        default: 'active',
    }
}, {timestamps: true });

module.exports = mongoose.models.schools || mongoose.model('schools', SchoolSchema);