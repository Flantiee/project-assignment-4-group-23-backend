// 引入express框架
const express = require('express')

// 构造服务器实例
const app = express()

// 获取并注册cors中间件
const cors = require('cors')
app.use(cors())

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

app.listen(7777, () => {
    console.log('server running at : http://127.0.0.1:7777')
})