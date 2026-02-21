module.exports = {
    createSchool: [
        {
            model: 'name',
            required: true,
        },
        {
            model: 'email',
            required: true,
        },
        {
            model: 'phone',
            required: true,
        },
        {
            model: 'address',
            required: true,
        },
        {
            path: "website",
            required: false,
            type: "string",
            regex: /^(https?:\/\/)([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?$/i,
        },
        {
            path: "motto",
            type: "string",
            length: {min: 3, max: 200},
            required: false,
        },
        {
            path: "establishedYear",
            required: true,
            type: "string",
            regex: /^(17|18|19|20|21|22|23|24|25|26|27|28|29|30)\d{2}$/,
        },
        {
            path: 'imageUrl',
            required: false,
            type: "string",
            regex: /^(https?:\/\/)([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?$/i,
        },
    ],
    updateSchoolById: [
        {
            model: 'id',
            required: true,
        },
        {
            model: 'name',
            required: true,
        },
        {
            model: 'email',
            required: true,
        },
        {
            model: 'phone',
            required: true,
        },
        {
            model: 'address',
            required: true,
        },
        {
            path: "website",
            required: false,
            type: "string",
            regex: /^(https?:\/\/)([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?$/i,
        },
        {
            path: "motto",
            type: "string",
            length: {min: 3, max: 200},
            required: false,
        },
        {
            path: "establishedYear",
            required: true,
            type: "string",
            regex: /^(17|18|19|20|21|22|23|24|25|26|27|28|29|30)\d{2}$/,
        },
        {
            path: 'imageUrl',
            required: false,
            type: "string",
            regex: /^(https?:\/\/)([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?$/i,
        },
    ],
    updateSchoolProfile: [
        {
            model: 'name',
            required: true,
        },
        {
            model: 'email',
            required: true,
        },
        {
            model: 'phone',
            required: true,
        },
        {
            model: 'address',
            required: true,
        },
        {
            path: "website",
            required: false,
            type: "string",
            regex: /^(https?:\/\/)([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?$/i,
        },
        {
            path: "motto",
            type: "string",
            length: {min: 3, max: 200},
            required: false,
        },
        {
            path: "establishedYear",
            required: true,
            type: "string",
            regex: /^(17|18|19|20|21|22|23|24|25|26|27|28|29|30)\d{2}$/,
        },
        {
            path: 'imageUrl',
            required: false,
            type: "string",
            regex: /^(https?:\/\/)([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?$/i,
        },
    ],
    getSchoolById: [
        {
            path: 'id',
            type: 'string',
            length: {min: 1, max: 50},
            required: true,
        },
    ],
    deleteSchoolById: [
        {
            path: 'id',
            type: 'string',
            length: {min: 1, max: 50},
            required: true,
        },
    ],
}