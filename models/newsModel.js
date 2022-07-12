const mongoose = require('mongoose')
const Schema = mongoose.Schema

const newsSchema = new Schema({
    title: {
        type: String
    }, 
    content: {
        type: String
    },
    thumbnail: {
        type: String
    },
    slug: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
newsSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'comments'
      
    }).populate({
        path: 'createdBy'
    })
    next()
})

newsSchema.virtual('comments', {
    ref: 'Comment',
    foreignField: 'news',
    localField: '_id',
})

const News = mongoose.model('News', newsSchema)
module.exports = News