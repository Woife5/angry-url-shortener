const mongoose = require('mongoose');

const shortSchema = new mongoose.Schema(
    {
        shortPath: {
            type: String,
            required: true,
            unique: true,
        },
        url: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        lastUsed: {
            type: Date,
            expires: 86400000 * 365, // entries expire after 1 year
            default: Date.now,
        },
    },
    {
        autoCreate: true,
    }
);

const shortModel = mongoose.model('Short', shortSchema);

module.exports = shortModel;
