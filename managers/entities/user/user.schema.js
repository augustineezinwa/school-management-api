

module.exports = {
    createUser: [
        {
            model: 'email',
            required: true,
        },
        {
            model: 'password',
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
            model: 'schoolId',
            required: false
        },
    ],
}


