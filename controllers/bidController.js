const Bid = require('../models/bidModel')
const ShippingInfo = require('../models/shippingInfoModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.createBid = catchAsync(async (req, res) => {
    const { address, phoneNumber, province, district, ward } = req.body.shippingInfo
    //check if info updated
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

    const bid = await Bid.findOneAndUpdate({
        user: req.user,
        product: req.body.product,
        productSize: req.body.productSize,
    }, {
        price: req.body.price,
        totalPrice: req.body.totalPrice,
        shippingInfo: shippingInfo,
        expireDate: Date.now() + req.body.expireDays * 24 * 60 * 60 * 1000,
        updatedAt: Date.now()
    },
        {
            new: true,
            upsert: true
        })

    await shippingInfo.save()
    await bid.save()

    res.status(201).json({
        status: 'success',
        message: 'Bid is live',
        bid: bid
    })
})

exports.deleteBid = catchAsync(async (req, res) => {
    console.log(req.params.id)
    const deletedBid = await Bid.findByIdAndDelete(req.params.id)
    if (!deletedBid) {
        return next(new AppError('No product found', 404))
    }
    res.status(204).json({
       
        status: "success",
        bid: deletedBid
    
    })
})

exports.getProductBids = catchAsync(async (req, res) => {
    const bids = await Bid.find({ product: req.params.productId })
    res.status(200).json({
        status: 'success',
        results: bids.length,
        bids: bids
    })
})

exports.getSizeBids = catchAsync(async (req, res) => {
    const bids = await Bid.find({ product: req.params.productId, productSize: req.params.size }).sort({ price: -1 })

    res.status(200).json({
        status: 'success',
        data: {
            bids: bids,
            highestBid: bids[0]
        }
    })
})
