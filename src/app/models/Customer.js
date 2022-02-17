const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Customer = new Schema({
    data: [{
        dateCheckin: { type: String, default: 'null' },
        timeCheckin: {
            first: { type: String, default: 'null' },
            last: { type: String, default: 'null' },
        },
    }],
});


module.exports = mongoose.model('Customer', Customer)