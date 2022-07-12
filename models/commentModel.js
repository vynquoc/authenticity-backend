const mongoose = require('mongoose')
const Schema = mongoose.Schema


const commentSchema = new Schema({
    content: {
        type: String
    },
    news: {
        type: Schema.Types.ObjectId,
        ref: 'News'
    },
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

commentSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'postedBy',
        select: 'name'
    })
    next()
})


const Comment = mongoose.model('Comment', commentSchema)


module.exports = Comment