// 先引入express框架
import express from 'express';

// 创建路由
const router = express.Router();

// handler_midleware
import checkoutHandler from '../router_handler/checkout.js';

// 获取结账详情
router.get('/', checkoutHandler.getCheckOutDetail);

// 确认结账
router.post('/', checkoutHandler.confirmCheckOut);

// 获取之前的订单列表
router.get('/previous', checkoutHandler.getPreviousOrderList);

export default router;