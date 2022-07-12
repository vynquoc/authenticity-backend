const Brand = require('../models/brandModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.getAllBrands = catchAsync(async (req, res) => {
    const brands = await Brand.find()
    res.status(200).json({
        status: 'success',
        data: {
            brands
        }
    })
})

exports.createBrand = catchAsync(async (req, res) => {
    const newBrand = new Brand(req.body)
    await newBrand.save()
    res.status(201).json({
        status: 'success',
        message: 'Brand created!',
        data: {
            brand: newBrand
        }
    })
})

exports.getBrand = catchAsync(async (req, res, next) => {
    const brand = await Brand.findById(req.params.id)
    if (!brand) {
        return next(new AppError('Brand not found', 404))
    }
    res.status(200).json({
        status: 'success',
        brand
    })
})

exports.updateBrand = catchAsync(async (req, res, next) => {
    const updatedBrand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updatedBrand) {
        return next(new AppError('Brand not found', 404))
    }
    res.status(200).json({
        status: 'success',
        message: 'Brand updated',
        brand: updatedBrand
    })
})

exports.deleteBrand = catchAsync(async (req, res, next) => {
    const deletedBrand = await Brand.findByIdAndDelete(req.params.id)
    if (!deletedBrand) {
        return next(new AppError('Brand not found', 404))
    }
    res.status(200).json({
        status: 'success',
        message: 'Brand deleted',
        brand: deletedBrand
    })
})