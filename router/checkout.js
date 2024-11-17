// 先引入express框架
const express = require('express')

// 创建路由
const router = express.Router()

// handler_midleware
const checkoutHandler = require('../router_handler/checkout.js')

// get CheckOut Detail
router.get('/', checkoutHandler.getCheckOutDetail)

// confirm checkout
router.post('/', checkoutHandler.confirmCheckOut)

// getPreviousOrderList
router.get('/previous', checkoutHandler.getPreviousOrderList)





module.exports = router