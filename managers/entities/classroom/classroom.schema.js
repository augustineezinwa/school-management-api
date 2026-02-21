module.exports = {
    createClassRoom: [
        {
            model: 'name',
            required: true,
        },
        { 
            path: 'level',
            required: true,
            type: 'string',
            length: {min: 1, max: 100},
        },
        {
            path: 'capacity',
            required: true,
            type: 'number',
            default: 0,
        },
        {
            path: 'numberOfDesks',
            type: 'number',
            required: false,
            default: 0,
        },
        {
            path: 'numberOfComputers',
            type: 'number',
            required: true,
            default: 0,
            required: false,
        },
        {
            path: 'hasProjector',
            type: 'boolean',
            required: false,
            default: false,
        },
        {
            model: 'schoolId',
            required: true,
        },
    ],
    manageClassroomById: [
        {
            path: 'numberOfDesks',
            type: 'number',
            required: false,
            default: 0,
        },
        {
            path: 'numberOfComputers',
            type: 'number',
            required: true,
            default: 0,
            required: false,
        },
        {
            path: 'hasProjector',
            type: 'boolean',
            required: false,
            default: false,
        }
    ]
}