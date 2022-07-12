const Product = require('./../models/productModel')
const Brand = require('../models/brandModel')
const Ask = require('../models/askModel')
const Bid = require('../models/bidModel')
const Category = require('../models/categoryModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.getAllProducts = catchAsync(async (req, res, next) => {
    console.log(req.query)
    const page = req.query.page * 1 || 1
    const limit = 36
    const skip = (page - 1) * limit
    let filter = {}
    for (const q in req.query) {
        if (q === 'category') {
            const category = await Category.findOne({ name: req.query[q] })
            if (category) {
                filter.category = category
            }
        }
        if (q === 'brand') {
            const brand = await Brand.findOne({ name: req.query[q] })
            if (brand) {
                filter.brand = brand
            }
        }
    }
    // const highestBids = await Bid.aggregate([
    //     { $match: { product: product._id, isMatched: false } },
    //     { $group: { _id: '$productSize', highestPrice: { $max: '$price' }, "bidDetail": { "$first": "$$ROOT" } } }
    // ])
    
    const query = Product.find(filter).sort({ createdAt: 'desc' }).skip(skip).limit(limit)
    const products = await query
    let results = []
    for (const product of products) {
        let avgAsk
        let sum = 0
        const avgAsks = await Ask.aggregate([ 
            { $match: { product: product._id, isMatched: false } },
            { $group: { _id: '$productSize', lowestPrice: { $min: '$price' }}},
           
        ])
        avgAsks.forEach(ask => {
            if (ask.lowestPrice) {
                sum += ask.lowestPrice
            }
        })
        avgAsk = Math.ceil(sum / avgAsks.length)
        results.push({
            _id: product._id,
            name: product.name,
            images: product.images,
            slug: product.slug,
            asks: product.asks,
            averagePrice: avgAsk
        })
    }
    const totalProducts = await Product.find(filter)
    res.status(200).json({
        status: 'success',
        results: products.length,
        products: results,
        pagination: {
            page,
            limit,
            totalProducts: totalProducts.length
        }
    })
})


exports.createProduct = catchAsync(async (req, res, next) => {
    const newProduct = new Product(req.body)
    await newProduct.save()
    res.status(201).json({
        status: 'success',
        message: 'Product created !',
        product: newProduct
    })
})

exports.getProduct = catchAsync(async (req, res, next) => {
    console.log(1232323)
    const product = await Product.findById(req.params.id)
    if (!product) {
        return next(new AppError('No product found', 404))
    }
    res.status(200).json({
        status: 'success',
        data: {
            product
        }
    })
})

exports.updateProduct = catchAsync(async (req, res, next) => {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    })
    if (!updatedProduct) {
        return next(new AppError('No product found', 404))
    }
    res.status(200).json({
        status: 'success',
        data: {
            product: updatedProduct
        }
    })
    console.log('haha')
})

exports.deleteProduct = catchAsync(async (req, res, next) => {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id)
    if (!deletedProduct) {
        return next(new AppError('No product found', 404))
    }
    res.status(204).json({
        status: "success",
        data: {
            product: deletedProduct
        }
    })
})