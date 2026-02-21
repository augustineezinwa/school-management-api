module.exports = {
    enrollStudent: [
        {
            path: 'admissionNumber',
            type: 'string',
            length: {min: 1, max: 100},
            required: true,
        },
        {
            model: 'firstName',
            required: true,
        },
        {
            model: 'lastName',
            required: true,
        },
        {
            path: 'dateOfBirth',
            format: 'date',
            required: true,
        },
        {
            model: 'gender',
            required: true,
        },
        {
            model: 'classroomId',
            required: true,
        },
        {
            model: 'schoolId',
            required: true,
        },
    ],
    updateStudentProfileById: [
        {
            path: 'admissionNumber',
            type: 'string',
            length: {min: 1, max: 100},
            required: true,
        },
        {
            model: 'firstName',
            required: true,
        },
        {
            model: 'lastName',
            required: true,
        },
        {
            path: 'dateOfBirth',
            type: 'date',
            required: true,
        },
        {
            model: 'gender',
            required: true,
        },
        {
            model: 'status',
            required: true,
        }
    ],

    deleteStudentById: [
        {
            model: 'id',
            required: true,
        },
    ],
    getStudentById: [
        {
            model: 'id',
            required: true,
        },
    ],
    transferStudent: [
        {
            model: 'classroomId',
            required: true,
        },
        {
            model: 'schoolId',
            required: true,
        },
        {
            model: 'id',
            required: true,
        }
    ],
}