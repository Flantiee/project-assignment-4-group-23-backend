// 先引入express框架
const express = require('express')

// 创建路由
const router = express.Router()

// handler_midleware
const productHandler = require('../router_handler/product')


// create
router.post('/', productHandler.create)

// update
router.put('/', productHandler.update)

// get one user
router.get('/:id', productHandler.getDetail)

router.get('/', productHandler.getProductsByList)

router.delete('/:id', productHandler.delete)

module.exports = router