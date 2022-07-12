const express = require('express')
const adminController = require('../controllers/adminController')
const router = express.Router()

router.route('/get-staffs').get(adminController.getAllStaffs)
router.route('/get-categories-brands').get(adminController.getCategoriesAndBrands)
router.route('/get-all-products').get(adminController.getAllProducts)
router.route('/get-order-statistics').get(adminController.getOrderStatistics)
router.route('/get-product-statistics/:type').get(adminController.getProductStatistics)
router.route('/get-revenue-statistics').get(adminController.getRevenueStatistics)

module.exports = router