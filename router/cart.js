// 先引入express框架
const express = require('express')

// 创建路由
const router = express.Router()

// handler_midleware
const cartHandler = require('../router_handler/cart')


// create
router.post('/', cartHandler.create)

// update
router.put('/', cartHandler.update)

router.get('/', cartHandler.getCartListById)

router.delete('/', cartHandler.delete)


module.exports = router