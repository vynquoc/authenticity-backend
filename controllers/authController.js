const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const User = require('../models/userModel')
const ShippingInfo = require('../models/shippingInfoModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

const createToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        role: req.body.role,
        shoeSize: req.body.shoeSize,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    })

    const token = createToken(newUser._id)

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })
})

exports.login = catchAsync(async (req, res, next) => {
    const username = req.body.username
    const password = req.body.password

    //check if username and password exist
    if (!username || !password) {
        return next(new AppError('Tài khoản và mật khẩu không được để trống', 400))
        // return res.status(400).json({
        //     status: 'failed',
        //     message: 'Tài khoản và mật khẩu không được để trống'
        // })
    }
    //check if user exits && password is correct
    const user = await User.findOne({ username }).select('+password')

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Tài khoản hoặc mật khẩu không đúng', 401))
     
    }
    const shippingInfo = await ShippingInfo.findOne({ user })
    // if everything ok, send token to client
    const token = createToken(user._id)
    res.status(200).json({
        status: 'success',
        token,
        user: {
            id: user._id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
            shoeSize: user.shoeSize,
            level: user.level,
            shippingInfo: shippingInfo
        }
    })
})

exports.getUserByToken = catchAsync(async (req, res) => {
    let token, decoded
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }
    // console.log(token)
    if (!token) {
        return res.status(200).json({
            user: {}
        })
    }

    try {
        decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    } catch (error) {
        return res.status(200).json({
            user: {}
        })
    }

    //check if user still exists
    const user = await User.findById(decoded.id)
    if (!user) {
        return res.status(200).json({
            user: {}
        })
    }
    const shippingInfo = await ShippingInfo.findOne({ user })
    return res.status(200).json({
        user: {
            id: user._id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
            shoeSize: user.shoeSize,
            level: user.level,
            shippingInfo: shippingInfo
        }
    })

})

exports.protect = catchAsync(async (req, res, next) => {
    // get token and check
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }
    if (!token) {
        return next(new AppError('Please log in !', 401))
    }
    //validate token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    //check if user still exists
    const user = await User.findById(decoded.id)
    if (!user) {
        return next(new AppError('User no longer exists', 401))
    }
    req.user = user
    next()
})

exports.checkRole = (role) => {
    return (req, res, next) => {
        // role 'admin'
        if (!role.includes(req.user.role)) {
            return next(new AppError('You do not have permission', 403))
        }
        next()
    }
}