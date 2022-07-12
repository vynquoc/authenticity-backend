const express = require('express')
const staffController = require('../controllers/staffController')
const authController = require('../controllers/authController')
const router = express.Router()

router.route('/get-orders/:type').get(authController.protect, authController.checkRole(['nhân viên xử lý', 'nhân viên kiểm tra']) , staffController.getOrders)


module.exports = router
