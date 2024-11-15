// 引入express框架
const express = require('express')

// 构造服务器实例
const app = express()

// 获取并注册cors中间件
const cors = require('cors')
app.use(cors())

// 解析 JSON 请求体
app.use(express.json());
// 配置解析表单的中间件
app.use(express.urlencoded({ extended: false }))

// 优化 res.send代码,配置新的返回属性,自行封装组件
app.use((req, res, next) => {
    // @ts-ignore
    res.cc = (err, status = 1) => {
        res.send({
            status,
            message: err instanceof Error ? err.message : err
        })
    }
    next()
})

// 引入分析token的中间件和加密串
const { jwtSecretKey } = require('./config')
const expressJWT = require('express-jwt')
// 指定哪些接口不需要token验证
// @ts-ignore
app.use(expressJWT({
    secret: jwtSecretKey
}).unless({
    path: [
        /^\/user\/register/,
        /^\/user\/login/
    ]
}))

// routers
const userRouter = require('./router/user')
app.use('/user', userRouter)

// 错误级中间件
app.use((err, req, res, next) => {
    // token错误
    if (err.name == 'UnauthorizedError') return res.cc('Identity Validation Failed')
    // 未知错误
    res.cc(err)
})

app.listen(7777, () => {
    console.log('server running at : http://127.0.0.1:7777')
})