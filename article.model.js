const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
        type: String,
        required: true,
    },
    createdAt: {
        { type: Date, default: Date.now },
    },
    commentsCount: {
        type: Number
    },
    comments: [
      { body: String, date: Date, author: String }
    ],
    meta: {
      votes: Number,
    }
});
module.exports = mongoose.model('Todo', Todo);
