const mongoose = require('mongoose')
const Schema = mongoose.Schema

const askSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },
    productSize: {
        type: String
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    price: {
        type: Number,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true
    },
    expireDate: {
        type: Date,

    },
    isMatched: {
        type: Boolean,
        default: false
    },
    shippingInfo: {
        type: Schema.Types.ObjectId,
        ref: 'ShippingInfo'
    },
    matchedAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})

askSchema.virtual('isExpired').get(function () {
    return this.expireDate < Date.now()
})

askSchema.pre(/^find/, function (next) {
    this.populate(
        { path: 'product', select: 'name images slug' }
    ).populate({
        path: 'user'
    }).populate({
        path: 'productSize',
        select: 'name'
    })
    next()
})

const Ask = mongoose.model('Ask', askSchema)
module.exports = Ask