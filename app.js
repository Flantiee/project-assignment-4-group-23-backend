import express from 'express';
import cors from 'cors';
import expressJWT from 'express-jwt';
import jwtConfig from './config/jwtConfig.js';
const { jwtSecretKey } = jwtConfig;

// 引入路由
import userRouter from './router/user.js';
import productRouter from './router/product.js';
import cartRouter from './router/cart.js';
import checkOutRouter from './router/checkout.js';

// 构造服务器实例
const app = express();

// 获取并注册cors中间件
app.use(cors());

// upload imag
app.use('/uploads/', express.static('public/uploads/'));

// 解析 JSON 请求体
app.use(express.json());

// 配置解析表单的中间件
app.use(express.urlencoded({ extended: false }));

// 优化 res.send 代码, 配置新的返回属性，封装组件
app.use((req, res, next) => {
    // @ts-ignore
    res.cc = (err, status = 1) => {
        res.send({
            status,
            message: err instanceof Error ? err.message : err,
        });
    };
    next();
});

// 指定哪些接口不需要 token 验证
app.use(
    expressJWT({
        secret: jwtSecretKey,
    }).unless({
        path: [/^\/user\/register/, /^\/user\/login/],
    })
);

// 路由
app.use('/user', userRouter);
app.use('/products', productRouter);
app.use('/cart', cartRouter);
app.use('/checkout', checkOutRouter);

// 错误级中间件
app.use((err, req, res, next) => {
    // token错误
    if (err.name === 'UnauthorizedError') return res.cc('Identity Validation Failed');
    // 未知错误
    res.cc(err);
});

// 启动服务器
app.listen(7777, () => {
    console.log('server running at: http://127.0.0.1:7777');
});