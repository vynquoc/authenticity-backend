const mongoose = require('mongoose')
const Schema = mongoose.Schema

const bidSchema = new Schema({
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
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

bidSchema.virtual('isExpired').get(function () {
    return this.expireDate < Date.now()
})

bidSchema.pre(/^find/, function (next) {
    this.populate(
        { path: 'product', select: 'name images slug' }
    ).populate({
        path: 'user'
    }).populate({
        path: 'productSize',
        select: 'name'
    }).populate({
        path: 'shippingInfo'
    })
    next()
})
const Bid = mongoose.model('Bid', bidSchema)
module.exports = Bid