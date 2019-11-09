const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {
        type: String
    },
    body: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    status: {
        type: String,
        default: 'public'
    },
    allowComment: {
        type: Boolean,
        default: true
    },
    postDate: {
        type: Date,
        default: Date.now
    },
    comments: [{
        commentBody: {
            type: String
        },
        commentUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        commentDate: {
            type: Date,
            default:Date.now
        }
    }]

});

module.exports = mongoose.model('post', postSchema); 