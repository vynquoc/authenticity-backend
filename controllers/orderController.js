const Order = require('../models/orderModel')
const Bid = require('../models/bidModel')
const Ask = require('../models/askModel')
const ShippingInfo = require('../models/shippingInfoModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const sendEmail = require('../utils/sendEmail')
const stripe = require("stripe")(process.env.STRIPE_SK)

exports.createOrder = catchAsync(async (req, res) => {
    let bid, ask
    //CHECK CREATE ORDER BY BUYING
    if (!req.body.bid) {
        //GET SHIPPING INFO BY USER
        const { address, phoneNumber, province, district, ward } = req.body.shippingInfo
        const shippingInfo = await ShippingInfo.findOneAndUpdate({
            user: req.user,
        },
            {
                address,
                phoneNumber,
                province,
                district,
                ward
            },
            {
                new: true,
                upsert: true
            }
        )

        bid = await Bid.create({
            user: req.user,
            product: req.body.product,
            productSize: req.body.productSize,
            price: req.body.price,
            totalPrice: req.body.totalPrice,
            isMatched: true,
            shippingInfo: shippingInfo
        })
        ask = await Ask.findByIdAndUpdate(req.body.ask, { isMatched: true }, { new: true })
    }
    //CHECK CREATE ORDER BY SELLING
    if (!req.body.ask) {
        ask = await Ask.create({
            user: req.user,
            product: req.body.product,
            productSize: req.body.productSize,
            price: req.body.price,
            totalPrice: req.body.totalPrice,
            isMatched: true
        })
        bid = await Bid.findByIdAndUpdate(req.body.bid, { isMatched: true }, { new: true })
    }

    const order = new Order({
        ask,
        bid,
        product: req.body.product,
        productSize: req.body.productSize,
        salePrice: bid.price,
        profit: (parseFloat(bid.totalPrice - bid.price) + parseFloat(ask.price - ask.totalPrice)).toFixed(2)
    })
    
    order.save()
    sendEmail(bid.user.email, 'Thông báo mua sản phẩm', 'buysuccess', {
        productName: req.body.product.name,
        orderNumber: `${bid._id.toString().slice(-6)}-${ask._id.toString().slice(-6)}`.toUpperCase(),
        imgPath: req.body.product.images.imageUrl
    })
    sendEmail(ask.user.email, 'Thông báo bán sản phẩm', 'sellsuccess', {
        productName: req.body.product.name,
        orderNumber: `${bid._id.toString().slice(-6)}-${ask._id.toString().slice(-6)}`.toUpperCase(),
        imgPath: req.body.product.images.imageUrl
    })
    res.status(201).json({
        status: 'success',
        message: 'Order Created!',
        order: {
            ...order,
            orderNumber: `${bid._id.toString().slice(-6)}-${ask._id.toString().slice(-6)}`.toUpperCase()
        }
    })
})

exports.findOrder = catchAsync(async (req, res) => {
    const order = await Order.findById(req.params.id)
    res.status(200).json({
        status: 'success',
        data: {
            order
        }
    })
})

exports.updateOrder = catchAsync(async (req, res, next) => {
    const user = req.user
    let order
    if (req.body.status === 'đã kiểm tra' || req.body.status === 'đã hủy') {
        order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status, updatedAt: Date.now(), checkedBy: user, updatedBy: user }, { new: true })
    }
    order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status, updatedAt: Date.now(), updatedBy: user }, { new: true }).populate('bid ask')
    
    if (!order) {
        return next(new AppError('Order not found', 404))
    }
   
    console.log(order)
    if (order.status === 'đã hủy') {
        const bid = await Bid.findByIdAndUpdate(order.bid._id, {isMatched: false}, {new: true})
        const ask = await Ask.findByIdAndDelete(order.ask._id)
        sendEmail(order.bid.user.email, 'Thông báo hủy đơn hàng', 'buyerCancel', {
            productName: order.product.name,
            orderNumber: order.orderNumber,
            imgPath: order.product.images.imageUrl
        })
        sendEmail(order.ask.user.email, 'Thông báo hủy đơn hàng', 'sellerCancel', {
            productName: order.product.name,
            orderNumber: order.orderNumber,
            imgPath: order.product.images.imageUrl
        })
    }
    res.status(200).json({
        status: 'success',
        message: 'Order Updated',
        order
    })
})