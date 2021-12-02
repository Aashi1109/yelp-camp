const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const collegeSchema = Schema({
    name: {
        type: String,
        required: true
    },
    city: {
        type: String
    },
    status: {
        type: String,
        enum: {
            values: ['affiliated', 'deemed', 'autonomous'],
            message: '{VALUE} is not present in list'
        },
        lowercase: true
    }
})

module.exports = mongoose.model('College', collegeSchema);

