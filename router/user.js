// 引入 express 框架
import express from 'express';

// 创建路由
const router = express.Router();

// 引入路由处理函数
import userHandler from '../router_handler/user.js';

// 注册路由
router.post('/register', userHandler.regUser);

// 登录路由
router.post('/login', userHandler.login);

// 更新用户信息
router.put('/update', userHandler.updateUser);

// 导出路由
export default router;