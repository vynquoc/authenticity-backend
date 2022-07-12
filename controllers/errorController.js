const AppError = require('../utils/appError')

//turn DB error to operational error to read
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`
    return new AppError(message, 400)
}

const handleDuplicateFieldsDB = err => {
    let field
    const value = Object.keys(err.keyValue)
    if (value[0] === 'username') {
        field = 'Tài khoản'
    } else if (value[0]) {
        field = 'Email'
    }
    const message = `${field} đã tồn tại !`
    return new AppError(message, 400)
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message)
    const message = `${errors.join('-')}`
    return new AppError(message, 400)
}

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
}

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
        // Programming or other unknown error
    } else {
        // console.log('---> ERROR --->', err)

        res.status(500).json({
            status: 'failed',
            message: 'something wrong'
        })
    }
}

const handleJWTExpired = err => {
    return new AppError('Your token has expired! Please log in again', 401)
}


const handleJWTError = err => {
    return new AppError('Vui lòng đăng nhập lại', 401)
}

module.exports = ((err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'
    if (process.env.NODE_ENV === 'development') {
        let error = { ...err }
        if (error.code === 11000) error = handleDuplicateFieldsDB(error)
        sendErrorDev(err, res)
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err }
        const mes = err.message
        error = { ...error, message: mes }
        if (error.name === 'CastError') error = handleCastErrorDB(error)
        if (error.code === 11000) error = handleDuplicateFieldsDB(error)
        if (error.name === 'JsonWebTokenError') error = handleJWTError(error)
        if (error.name === 'TokenExpiredError') error = handleJWTExpired(error)
        if (err.name === 'ValidationError') error = handleValidationErrorDB(error)
        sendErrorProd(error, res)

    }
})