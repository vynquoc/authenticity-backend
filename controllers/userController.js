const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find()
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    })
})

exports.createUser = catchAsync(async (req, res, next) => {
    const newUser = new User(req.body)
    await newUser.save()
    res.status(201).json({
        status: 'success',
        newUser
    })
})

exports.getUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id)
    if (!user) {
        return next(new AppError('User not found', 404))
    }
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
})

exports.updateUser = catchAsync(async (req, res, next) => {
    console.log(req.body.active)
    const active = req.body.active === 'true' ? true : false 
    const updatedUser = await User.findByIdAndUpdate(req.params.id, {...req.body, active: active}, { new: true })
    if (!updatedUser) {
        return next(new AppError('User not found', 404))
    }
    res.status(200).json({
        status: 'success',
        message: 'User Updated!',
        updatedUser
    })
})

exports.deleteUser = catchAsync(async (req, res, next) => {
    const deletedUser = await User.findByIdAndDelete(req.params.id)
    if (!deletedUser) {
        return next(new AppError('User not found', 404))
    }
    res.status(200).json({
        status: 'success',
        message: 'User deleted!',
        deletedUser
    })
})

