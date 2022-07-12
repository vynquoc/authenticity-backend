const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const productRouter = require('./routes/productRoutes')
const userRouter = require('./routes/userRoutes')
const brandRouter = require('./routes/brandRoutes')
const categoryRouter = require('./routes/categoryRoutes')
const newsRouter = require('./routes/newsRoutes')
const bidRouter = require('./routes/bidRoutes')
const askRouter = require('./routes/askRoutes')
const orderRouter = require('./routes/orderRoutes')
const viewRouter = require('./routes/viewRoutes')
const adminRouter = require('./routes/adminRoutes')
const staffRouter = require('./routes/staffRoutes')
const commentRouter = require('./routes/commentRoutes')

const app = express()


if (process.env.NODE_ENV === 'development') app.use(morgan('dev'))


app.use(express.json())
app.use(cors())

//ROUTES
app.use('/api/products', productRouter)
app.use('/api/users', userRouter)
app.use('/api/brands', brandRouter)
app.use('/api/categories', categoryRouter)
app.use('/api/news', newsRouter)
app.use('/api/bids', bidRouter)
app.use('/api/asks', askRouter)
app.use('/api/orders', orderRouter)
app.use('/api', viewRouter)
app.use('/api/admin', adminRouter)
app.use('/api/staff', staffRouter)
app.use('/api/comments', commentRouter)
//handle not existed routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
})

app.use(globalErrorHandler)

module.exports = app