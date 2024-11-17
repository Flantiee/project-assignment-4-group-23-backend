// 先引入express框架
import express from 'express';

// 创建路由
const router = express.Router()

// handler_midleware
import cartHandler from '../router_handler/cart.js'


// create
router.post('/', cartHandler.create)

// update
router.put('/', cartHandler.update)

router.get('/', cartHandler.getCartListById)

router.delete('/', cartHandler.deleteRecord)


export default router