const mongoose = require('mongoose')
const Schema = mongoose.Schema

const shippingInfoSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    phoneNumber: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    province: {
        type: String,
        required: true
    },
    district: {
        type: String
    },
    ward: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

const ShippingInfo = mongoose.model('ShippingInfo', shippingInfoSchema)

module.exports = ShippingInfo