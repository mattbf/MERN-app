const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//const PrettyUrl = require('./Utils/PrettyUrl');

let Article = new Schema({
    title: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    body: {
        type: Object,
        required: true,
    },
    createdAt: {
        type: Date, default: Date.now ,
    },
    comments: [
      { body: String, date: { type: Date, default: Date.now }, author: String }
    ],
    meta: {
      votes: Number,
    },
    slug: {
      type: String
    }
});
module.exports = mongoose.model('Article', Article);
