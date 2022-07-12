const Comment = require('../models/commentModel')

const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.createComment = catchAsync(async (req, res, next) => {
    const comment = new Comment({
        content: req.body.content,
        news: req.body.news,
        postedBy: req.user
    })
    comment.save()
    res.status(201).json({
        status: 'success',
        comment
    })
})


