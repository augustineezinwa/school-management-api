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
        },
        {
            model: 'numberOfDesks',
            required: false,
        },
        {
            model: 'numberOfComputers',
            required: false,
        },
        {
            model: 'hasProjector',
            required: false,
        },
        {
            model: 'schoolId',
            required: true,
        },
    ],
}