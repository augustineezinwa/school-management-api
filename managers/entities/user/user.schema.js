

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
    login: [
        {
            model: 'email',
            required: true,
        },
        {
            model: 'password',
            required: true,
        },
    ],
    changePassword: [
        {
            model: 'token',
            required: true,
        },
        {
            model: 'password',
            required: true,
        },
        {
            path: 'newPassword',
            type: 'string',
            length: {min: 8, max: 500},
            required: true,
        },
    ],
    manageUserById: [
        {
            model: 'id',
            required: true,
        },
        {
            model: 'email',
            required: false,
        },
        {
            model: 'firstName',
            required: false,
        },
        {
            model: 'lastName',
            required: false,
        },
        {
            model: 'status',
            required: false,
        },
        {
            model: 'schoolId',
            required: false,
        },
    ],
}


