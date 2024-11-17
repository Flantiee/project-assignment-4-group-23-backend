// 引入 express 框架
import express from 'express';

// 创建路由
const router = express.Router();

// 引入 handler_middleware
import productHandler from '../router_handler/product.js';

// create
router.post('/', productHandler.create);

// update
router.put('/', productHandler.update);

// 获取一个产品的详情
router.get('/:id', productHandler.getDetail);

// 获取产品列表
router.get('/', productHandler.getProductsByList);

// 删除一个产品
router.delete('/:id', productHandler.deleteProduct);

export default router;