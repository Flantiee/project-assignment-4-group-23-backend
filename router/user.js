// 先引入express框架
const express = require('express')

// 创建路由
const router = express.Router()

// handler_midleware
const userHandler = require('../router_handler/user')


// register
router.post('/register', userHandler.regUser)

// login-router 
router.post('/login', userHandler.login)

// update user
router.put('/update', userHandler.updateUser)

module.exports = router