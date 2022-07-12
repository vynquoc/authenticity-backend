const express = require('express')
const newsController = require('../controllers/newsController')
const authController = require('../controllers/authController')

const router = express.Router()

router.route('/').post(authController.protect, authController.checkRole('admin'), newsController.createNews).get(newsController.getAllNews)
router.route('/get-newest-newses').get(newsController.getNewestNews)
router.route('/:slug').get(newsController.getNews).delete(authController.protect, authController.checkRole('admin'), newsController.deleteNews)


module.exports = router