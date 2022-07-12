const express = require('express')
const askController = require('../controllers/askController')
const authController = require('../controllers/authController')

const router = express.Router()

router.route('/').post(authController.protect, authController.checkRole('người dùng'), askController.createAsk)
router.route('/delete/:id').delete(askController.deleteAsk)
router.route('/:productId').get(askController.getProductAsks)


module.exports = router