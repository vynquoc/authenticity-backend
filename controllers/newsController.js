const News = require('../models/newsModel')
const slugify = require('slugify')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')


exports.createNews = catchAsync(async (req, res, next) => {
    const newNews = new News({
        title: req.body.title,
        content: req.body.content,
        thumbnail: req.body.thumbnail,
        slug: slugify(req.body.title, { lower: true }),
        createdBy: req.user
    })
    await newNews.save()
    res.status(201).json({
        status: 'success',
        message: 'News created !',
        news: newNews
    })
})

exports.getAllNews = catchAsync(async (req, res, next) => {
    const newses = await News.find().sort({createdAt: -1}).populate('createdBy')
    res.status(200).json({
        status: 'success',
        newses
    })
})

exports.getNews = catchAsync(async (req, res, next) => {
    const slug = req.params.slug
    const news = await News.findOne({slug: slug}).populate('createdBy')
    if (!news) next(new AppError('không tìm thấy', 404))
    res.status(200).json({
        status: 'success',
        news
    })
})
exports.getNewestNews = catchAsync(async (req, res) => {
    const newses = await News.find().limit(5).sort({createdAt: -1})
    res.status(200).json({
        status: 'success',
        newses
    })
})

exports.deleteNews = catchAsync(async (req, res) => {
    const slug = req.params.slug
    const deletedNews = await News.findOneAndDelete({slug: slug})
    res.status(200).json({
        status: 'success',    
            deletedNews
    })
})