const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Member = new Schema({
    avatar: {type: String},
    username: {type: String},
    email: { type: String },
    phone: { type: Number},
    address: { type: String},
    createdAt: { type: Date, default: Date.now},
    updateAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Member', Member);