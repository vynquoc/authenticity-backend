const mongoose = require('mongoose')
const Schema = mongoose.Schema

const orderSchema = new Schema({
    bid: {
        type: Schema.Types.ObjectId,
        ref: 'Bid'
    },
    ask: {
        type: Schema.Types.ObjectId,
        ref: 'Ask'
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },
    productSize: {
        type: String
    },
    salePrice: {
        type: Number
    },
    profit: {
        type: Number
    },
    orderNumber: {
        type: String,
    },
    status: {
        type: String,
        enum: ['người bán đang gửi hàng', 'đã tiếp nhận', 'đang kiểm tra', 'đã kiểm tra', 'đã gửi hàng', 'hoàn thành', 'đã hủy'],
        default: 'người bán đang gửi hàng'
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
    },
    checkedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})
orderSchema.index({status: 'text'})
orderSchema.pre('save', function (next) {
    this.orderNumber = `${this.bid._id.toString().slice(-6)}-${this.ask._id.toString().slice(-6)}`.toUpperCase()
    next()
})
orderSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'product',
        select: 'name images'
    })
    next()
})
const Order = mongoose.model('Order', orderSchema)
module.exports = Order