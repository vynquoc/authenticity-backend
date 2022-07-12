const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const Ask = require('../models/askModel')
const Bid = require('../models/bidModel')
const Order = require('../models/orderModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const User = require('../models/userModel')
exports.getProductDetail = catchAsync(async (req, res, next) => {
    
    const product = await Product.findOne({ slug: req.params.slug })
    if (!product) {
        return next(new AppError('Product not found!', 404))
    }
    const today = new Date()
    const lowestAsks = await Ask.aggregate([
        { $match: { product: product._id, isMatched: false, expireDate: {$gt: today} } },
        { $group: { _id: '$productSize', lowestPrice: { $min: '$price' }, "askDetail": { "$first": "$$ROOT" } } }
    ])
    const highestBids = await Bid.aggregate([
        { $match: { product: product._id, isMatched: false, expireDate: {$gt: today} } },
        { $group: { _id: '$productSize', highestPrice: { $max: '$price' }, "bidDetail": { "$first": "$$ROOT" } } }
    ])

    res.status(200).json({
        status: 'success',
        product,
        lowestAsks,
        highestBids
    })
   
})

exports.getSizeLastSale = catchAsync(async (req, res) => {
    const {product, size} = req.params
    const lastSale = await Order.findOne({product: product, productSize: size, status: 'hoàn thành'}).sort({'createdAt': -1})
    res.status(200).json({
        lastSale: lastSale ? lastSale.salePrice : null
    })
})
exports.getSizeAllSale = catchAsync(async (req, res) => {
    const {product, size} = req.params
    const sales = await Order.find({product: product, productSize: size, status: 'hoàn thành'}).sort({'createdAt': -1})
    res.status(200).json({
        sales
    })
})
exports.getSizeAllAsk = catchAsync(async (req, res) => {
    const {product, size} = req.params
    const asks = await Ask.find({product: product, productSize: size, isMatched: false}).sort({'createdAt': -1})
    res.status(200).json({
        asks
    })
})
exports.getSizeAllBid = catchAsync(async (req, res) => {
    const {product, size} = req.params
    const bids = await Bid.find({product: product, productSize: size, isMatched: false}).sort({'createdAt': -1})
    res.status(200).json({
        bids
    })
})
exports.getAskAndBid = catchAsync(async (req, res, next) => {
    const { slug } = req.params
    const { size } = req.query
    const product = await Product.findOne({ slug: slug })
    if (!product) {
        return next(new AppError('Product not found!', 404))
    }
    const lowestAsk = await Ask.find({ product: product._id, productSize: size, isMatched: false, expireDate: {$gt: Date.now()} }).sort([['price', 'ascending']])
    const highestBid = await Bid.find({ product: product._id, productSize: size, isMatched: false, expireDate: {$gt: Date.now()} }).sort([['price', 'descending']])
    res.status(200).json({
        status: 'success',
        product: product,
        lowestAsk: lowestAsk[0] ? lowestAsk[0] : null,
        highestBid: highestBid[0] ? highestBid[0] : null
    })
})

exports.getUserOrders = catchAsync(async (req, res, next) => {
    const user = req.user
  
    const bids = await Bid.find({user: user, isMatched: true})
    const ids = bids.map(bid => bid._id)
    
   const orders = await Order.find({bid: {$in: ids}, status: 'hoàn thành'}).populate('bid')
   const total = orders.reduce((sum, curr) => sum + curr.salePrice, 0)
    res.status(200).json({
        status: 'success',
        orders: {
            count: orders.length,
            sum: total
        }
    })
})

exports.getUserBids = catchAsync(async (req, res, next) => {
    const bids = await Bid.find({ user: req.params.userId, isMatched: false })
    let results = []
    for (const bid of bids) {
        const lowestAsk = await Ask.find({ product: bid.product, productSize: bid.productSize, isMatched: false }).sort([['price', 'ascending']])
        const highestBid = await Bid.find({ product: bid.product, productSize: bid.productSize, isMatched: false }).sort([['price', 'descending']])
        results.push({
            lowestAsk: lowestAsk[0] ? lowestAsk[0].price : null,
            highestBid: highestBid[0] ? highestBid[0].price : null,
            bidInfo: {
                bidId: bid.id,
                productName: bid.product.name,
                slug: bid.product.slug,
                productImage: bid.product.images.smallImageUrl,
                productSize: bid.productSize,
                price: bid.price,
                expireDate: bid.isExpired ? 'Đã hết hạn' : bid.expireDate
            }
        })
    }
    res.status(200).json({
        status: 'success',
        data: {
            bids: results
        }
    })
})

exports.getBuyingPending = catchAsync(async (req, res, next) => {
    const bids = await Bid.find({ user: req.params.userId, isMatched: true })
    let orders = []
    for (const bid of bids) {
        const order = await Order.findOne({ bid: bid, status: { '$in': ['người bán đang gửi hàng', 'đang xử lý', 'đã gửi hàng'] } }).populate({ path: 'bid', select: '+price' })
        if (order) {
            orders.push({
                orderId: order.Id,
                productName: order.bid.product.name,
                productSize: order.bid.productSize,
                productImage: order.bid.product.images.smallImageUrl,
                slug: order.bid.product.slug,
                orderNumber: order.orderNumber,
                purchaseDate: order.createdAt,
                purchasePrice: order.bid.price,
                status: order.status
            })
        }
    }
    res.status(200).json({
        status: 'success',
        data: {
            orders
        }
    })
})

exports.getBuyingHistory = catchAsync(async (req, res, next) => {
    const bids = await Bid.find({ user: req.params.userId, isMatched: true })

    let orders = []
    for (const bid of bids) {
        const order = await Order.findOne({ bid: bid, status: { '$in': ['hoàn thành', 'đã hủy'] } }).populate({ path: 'bid', select: '+price' })
        if (order) {
            orders.push({
                orderId: order.Id,
                productName: order.bid.product.name,
                productSize: order.bid.productSize,
                productImage: order.bid.product.images.smallImageUrl,
                slug: order.bid.product.slug,
                orderNumber: order.orderNumber,
                purchaseDate: order.createdAt,
                purchasePrice: order.bid.price,
                status: order.status
            })
        }
    }
    res.status(200).json({
        status: 'success',
        data: {
            orders
        }
    })
})

exports.getUserAsks = catchAsync(async (req, res, next) => {
    const asks = await Ask.find({ user: req.params.userId, isMatched: false })
    let results = []
    for (const ask of asks) {
        const lowestAsk = await Ask.find({ product: ask.product, productSize: ask.productSize, isMatched: false }).sort([['price', 'ascending']])
        const highestBid = await Bid.find({ product: ask.product, productSize: ask.productSize, isMatched: false }).sort([['price', 'descending']])
        results.push({
            lowestAsk: lowestAsk[0] ? lowestAsk[0].price : null,
            highestBid: highestBid[0] ? highestBid[0].price : null,
            askInfo: {
                askId: ask.id,
                productName: ask.product.name,
                productImage: ask.product.images.smallImageUrl,
                slug: ask.product.slug,
                productSize: ask.productSize,
                price: ask.price,
                expireDate: ask.isExpired ? 'Đã hết hạn' : ask.expireDate
            }
        })
    }
    res.status(200).json({
        status: 'success',
        data: {
            asks: results
        }
    })
})


exports.getAskingPending = catchAsync(async (req, res, next) => {
    const asks = await Ask.find({ user: req.params.userId, isMatched: true })

    let orders = []
    for (const ask of asks) {
        const order = await Order.findOne({ ask: ask, status: { '$in': ['người bán đang gửi hàng', 'đang xử lý', 'đã gửi hàng'] } }).populate({ path: 'ask', select: '+price' })
        if (order) {
            orders.push({
                orderId: order.id,
                productName: order.ask.product.name,
                productSize: order.ask.productSize,
                productImage: order.ask.product.images.smallImageUrl,
                slug: order.ask.product.slug,
                orderNumber: order.orderNumber,
                purchaseDate: order.createdAt,
                purchasePrice: order.ask.price,
                status: order.status
            })
        }
    }
    res.status(200).json({
        status: 'success',
        data: {
            orders
        }
    })
})

exports.getAskingHistory = catchAsync(async (req, res, next) => {
    const asks = await Ask.find({ user: req.params.userId, isMatched: true })

    let orders = []
    for (const ask of asks) {
        const order = await Order.findOne({ ask: ask, status: { '$in': ['hoàn thành', 'đã hủy'] } }).populate({ path: 'ask', select: '+price' })
        if (order) {
            orders.push({
                orderId: order.Id,
                productName: order.ask.product.name,
                productSize: order.ask.productSize,
                productImage: order.ask.product.images.smallImageUrl,
                slug: order.ask.product.slug,
                orderNumber: order.orderNumber,
                purchaseDate: order.createdAt,
                purchasePrice: order.ask.price,
                status: order.status
            })
        }
    }
    res.status(200).json({
        status: 'success',
        data: {
            orders
        }
    })
})

exports.getNewestSneakers = catchAsync(async (req, res, next) => {
    const category = await Category.findOne({ name: 'sneakers' })
    const products = await Product.find({ category: category }).sort({ createdAt: 'desc' }).limit(5)
    res.status(200).json({
        status: 'success',
        data: products
    })
})
exports.getNewestStreetwear = catchAsync(async (req, res, next) => {
    const category = await Category.findOne({ name: 'streetwear' })
    const products = await Product.find({ category: category }).sort({ createdAt: 'desc' }).limit(5)
    res.status(200).json({
        status: 'success',
        data: products
    })
})

exports.getNewestCollectibles = catchAsync(async (req, res, next) => {
    const category = await Category.findOne({ name: 'collectibles' })
    const products = await Product.find({ category: category }).sort({ releaseDate: 'desc' }).limit(5)
    res.status(200).json({
        status: 'success',
        data: products
    })
})

exports.searchProducts = catchAsync(async (req, res, next) => {
    const kw = req.query.s
    const products = await Product.find({$text : { $search: kw }}).select('brand name id colorway slug images')
    res.status(200).json({
        results: products.length,
        products
    })
})

exports.addFollowingProduct = catchAsync(async (req, res, next) => {
    const {productId, size} = req.body
    const product = await Product.findById(productId)
    const user = await User.findById(req.user._id)
    console.log(req.user)
    if (!user) return next(new AppError('Vui lòng đăng nhập !', 400))
    const newArr = [...user.followingProducts, {product, size}]
    const updatedUser = await User.findByIdAndUpdate(user._id, {followingProducts: newArr}, {new: true})
  
    res.status(200).json({
        status: 'success',
        message: 'Add successful',
        user: updatedUser
    })
})

exports.getFollowingProducts = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.userId).populate('followingProducts.product')
    const arr = user.followingProducts
    const results = []
    for (a of arr) {
        const lowestAsk = await Ask.find({ product: a.product, productSize: a.size, isMatched: false, expireDate: {$gt: Date.now()} }).sort([['price', 'ascending']])
        const lastSale = await Order.find({product: a.product, productSize: a.size, status: 'hoàn thành'}).sort({salePrice: -1}).limit(1)
        results.push({
            followingId: a._id,
            productName: a.product.name,
            productImage: a.product.images.smallImageUrl,
            productSize: a.size,
            productSlug: a.product.slug,
            lowestAsk: lowestAsk[0]?.price,
            lastSale: lastSale[0]?.salePrice
        })
    }
    res.status(201).json({
        status: 'success',
        results
    })
})

exports.deleteFollowingProduct = catchAsync(async (req, res, next) => {
    const arr = req.user.followingProducts
    const newArr = arr.filter(a => a._id.toString() !== req.params.followingId)
    const updatedUser = await User.findByIdAndUpdate(req.user._id, {followingProducts: newArr}, {new: true})
    console.log(updatedUser.followingProducts)
    res.status(200).json({
        status: 'success',
        updatedFollowing: updatedUser.followingProducts
    })
})