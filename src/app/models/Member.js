const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Member = new Schema({
    avatar: {type: String},
    username: {type: String},
    email: { type: String },
    phone: { type: Number},
    address: { type: String},
    data: [{
        dateCheckin: { type: String, default: 'null' },
        timeCheckin: {
            first: { type: String, default: 'null' },
            last: { type: String, default: 'null' },
        },
    }],
    createdAt: { type: Date, default: Date.now},
    updateAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Member', Member);