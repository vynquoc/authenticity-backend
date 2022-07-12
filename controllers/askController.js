const Ask = require('../models/askModel')
const ShippingInfo = require('../models/shippingInfoModel')
const catchAsync = require('../utils/catchAsync')

exports.createAsk = catchAsync(async (req, res) => {
    const { address, phoneNumber, province, district, ward } = req.body.shippingInfo
    const shippingInfo = await ShippingInfo.findOneAndUpdate({
        user: req.user
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
    const ask = await Ask.findOneAndUpdate({
        user: req.user,
        product: req.body.product,
        productSize: req.body.productSize
    }, {
        price: req.body.price,
        totalPrice: req.body.totalPrice,
        shippingInfo: shippingInfo,
        expireDate: Date.now() + req.body.expireDays * 24 * 60 * 60 * 1000,
        updatedAt: Date.now()
    }, {
        new: true,
        upsert: true
    })
    await ask.save()
    res.status(201).json({
        status: 'success',
        message: 'Place ask successfully',
        ask: ask
    })
})
exports.deleteAsk = catchAsync(async (req, res) => {
    console.log(req.params.id)
    const deletedAsk = await Ask.findByIdAndDelete(req.params.id)
    if (!deletedAsk) {
        return next(new AppError('No product found', 404))
    }
    res.status(204).json({
        status: "success",
        ask: deletedAsk
    })
})
exports.getProductAsks = catchAsync(async (req, res) => {
    const asks = await Ask.find({ product: req.params.productId })
    res.status(200).json({
        status: 'success',
        results: asks.length,
        asks: asks
    })
})