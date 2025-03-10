const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    text: {
        type: String,
        required: true
    },
    name: { //name of user not of post
        type: String
    },
    avatar: {
        type: String
    },
    likes: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            }
        }
    ],
    comments: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            },
            text: {
                type: String,
                required: true
            },
            name: { //name of user not of post
                type: String
            },
            avatar: {
                type: String
            },
            date:{
                type: Date,
                defaut: Date.now
            }

        }
    ],
    date:{
        type: Date,
        defaut: Date.now
    }
});

module.exports = Post = mongoose.model('post', PostSchema);