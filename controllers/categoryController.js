const Category = require('../models/categoryModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.getAllCategories = catchAsync(async (req, res, next) => {
    const categories = await Category.find()
    if (!categories) {
        return next(new AppError('Category not found', 404))
    }
    res.status(200).json({
        status: 'success',
        data: {
            categories: categories
        }
    })
})

exports.createCategory = catchAsync(async (req, res) => {
    const newCategory = new Category(req.body)
    await newCategory.save()
    res.status(201).json({
        status: 'success',
        message: 'Category created',
        data: {
            category: newCategory
        }
    })
})

exports.getCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findById(req.params.id)
    if (!category) {
        return next(new AppError('Category not found', 404))
    }
    res.status(200).json({
        status: 'success',
        category: category
    })
})

exports.updateCategory = catchAsync(async (req, res, next) => {
    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updatedCategory) {
        return next(new AppError('Category not found', 404))
    }
    res.status(200).json({
        status: 'success',
        message: 'Category updated',
        data: {
            category: updatedCategory
        }
    })
})

exports.deleteCategory = catchAsync(async (req, res, next) => {
    const deletedCategory = await Category.findOneAndDelete(req.params.id)
    if (!deletedCategory) {
        return next(new AppError('Category not found', 404))
    }
    res.status(204).json({
        status: 'success'
    })
})

