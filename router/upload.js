// 先引入express框架
const express = require('express')

// 创建路由
const router = express.Router()

// handler_midleware
const uploadHandler = require('../router_handler/upload')


// register
router.post('/', uploadHandler.upload)


module.exports = router