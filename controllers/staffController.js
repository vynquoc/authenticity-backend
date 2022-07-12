const Order = require('../models/orderModel')

const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.getOrders = catchAsync(async (req, res) => {
    let queryStatus = ''
    let orders
    if (req.user.role === 'nhân viên kiểm tra') {
        queryStatus = 'đang kiểm tra'
    }
    if (req.params.type === 'incoming-orders') queryStatus = 'người bán đang gửi hàng'
    if (req.params.type === 'received-orders') queryStatus = 'đã tiếp nhận'
    if (req.params.type === 'checked-orders') queryStatus = 'đã kiểm tra'
    if (req.params.type === 'shipped-orders') queryStatus = 'đã gửi hàng'
    if (queryStatus === 'đã kiểm tra') {
        orders = await Order.find({status: {'$in' : [queryStatus, 'đã hủy']}}).populate('product')
    } else {
        orders = await Order.find({status: {'$in' : [queryStatus]}}).populate('product')
    }
    res.status(200).json({
        status: 'success',
        orders
    })
})