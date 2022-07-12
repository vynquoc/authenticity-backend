const User = require('../models/userModel')
const Brand = require('../models/brandModel')
const Category = require('../models/categoryModel')
const Product = require('../models/productModel')
const Order = require('../models/orderModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const moment = require('moment')

exports.getAllStaffs = catchAsync(async (req, res) => {
    const staffs = await User.find({role: {'$in': ['nhân viên kiểm tra', 'nhân viên xử lý', 'nhân viên hỗ trợ']}})
    res.status(200).json({
        status: 'success',
        staffs
    })
})

exports.getCategoriesAndBrands = catchAsync(async (req, res) => {
    const categories = await Category.find()
    const brands = await Brand.find()
    res.status(200).json({
        status: 'success',
        categories,
        brands
    })
})

exports.getAllProducts = catchAsync(async (req, res) => {
    // const products = await Product.find()
    // res.status(200).json({
    //     status: 'success',
    //     products
    // })
    const kw = req.query.s
    console.log(kw)
    let products
    if (kw !== '') {
        products = await Product.find({$text : { $search: kw }}).populate('category brand').select('category brand name id colorway slug images')
    } else {
        products = await Product.find().sort({'createdAt': -1})
    }
    
    res.status(200).json({
        products
    })
})

exports.getOrderStatistics = catchAsync(async (req, res) => {
    const today = moment().set('month', 9).endOf('month').toDate()
    // console.log(moment().set('month', 7).endOf('month').toDate())
    // console.log(moment(today).startOf('month').toDate())
    const order = await Order.aggregate([
            {
                // $match: {status: {'$in': ['hoàn thành', 'đã hủy']}, createdAt: {$lte: moment(today).endOf('month').toDate(), $gte: moment(today).startOf('month').toDate()}}
                $match: {status: {'$in': ['hoàn thành', 'đã hủy']}}
            },
            {   
                $group: { _id: '$status', count: {$sum: 1}}
            }
    ])
    res.status(200).json({
        status: 'success',
        data: order
        })
})

exports.getProductStatistics = catchAsync(async (req, res) => {
    const type = req.params.type
 
 
    let data = []
    if (type === 'category') {
        const product = await Product.aggregate([
            {
                $group: {_id: '$category', count: {$sum : 1}}
            },
        ])
        for (const obj of product) {
            const category = await Category.findById(obj._id)
            data.push({
                type: category.name,
                count: obj.count
            })
        }
    } 
    if (type === 'brand') {
        const product = await Product.aggregate([
            {
                $group: {_id: '$brand', count: {$sum : 1}}
            },
        ])
        for (const obj of product) {
            const brand = await Brand.findById(obj._id)
            data.push({
                type: brand.name,
                count: obj.count
            })
        }
    }
    res.status(200).json({
        status: 'success',
        data: data
    })
})

exports.getRevenueStatistics = catchAsync(async (req, res) => {
    const revenue = await Order.aggregate([
        {
            $match: {status: 'hoàn thành'}
        },
        {
            $group: {
                _id: {month: {$month: "$createdAt"}},
                sum: {$sum: "$profit"}
            }
        },
        {
            $sort: {
                '_id.month': 1
            }
        }
    ])
    let data = []
    for (const obj of revenue) {
        data.push({
            month: `T${obj._id.month}`,
            revenue: obj.sum
        })
    }
    res.status(200).json({
        status: 'success',
        data: data
    })
})