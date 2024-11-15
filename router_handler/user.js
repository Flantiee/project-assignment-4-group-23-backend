
const db = require('../db')
// 获取密码加密模块
const bcrypt = require('bcryptjs')
// 用这个包来生成 Token 字符串
const jwt = require('jsonwebtoken')
// 获取加密值
const { jwtSecretKey } = require('../config')

// 注册用户的处理函数
exports.regUser = (req, res) => {

    const { email, password, role, name, phone, address, payment_method, payment_card_number } = req.body
    if (!email || !password) {
        return res.cc('Email or password can not be empty')
    }
    // 查询数据库中的用户名是否重复
    const sqlStr1 = `select * from user where email=?`
    let results = []
    db.query(sqlStr1, [email], (err, results) => {
        // 执行SQL语句失败
        if (err) return res.cc(err)

        results = results
    })
    // duplicate email ?
    if (results.length > 0)
        return res.cc('Duplicate email')

    // 对密码进行加密
    hashedPassword = bcrypt.hashSync(password, 10)
    // 将用户信息插入到用户表中
    const sqlStr2 = `INSERT INTO user (email, password, role, name, phone, address, payment_method, payment_card_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    db.query(sqlStr2, [email, hashedPassword, 'user' || role, name, phone, address, 'credit' || payment_method, payment_card_number], (err, results) => {
        if (err) return res.cc(err)
        // SQL 语句执行成功，但影响行数不为 1
        if (results.affectedRows !== 1) return res.cc('Failed to register')
        res.cc('Register Completed', 200)
    })

}

// 登录用户的处理函数
exports.login = (req, res) => {
    const { email, password } = req.body
    const sqlStr1 = `select * from user where email= ?`
    db.query(sqlStr1, email, (err, results) => {
        if (err) return res.cc(err)
        if (results.length != 1) return res.cc('Wrong Email')
        // 比较密码是否正确 (一定要记得写resutls[0])
        const compareResult = bcrypt.compareSync(password, results[0].password)
        if (!compareResult) return res.cc('Wrong Password')
        // 获取用户信息的综合
        const user = { ...results[0], password: '', user_pic: '' }
        // 生成token
        const tokenStr = jwt.sign(user, jwtSecretKey, { expiresIn: '24h' })
        res.send({
            status: 200,
            message: 'Login Completed',
            token: "Bearer " + tokenStr
        })
    })
}
// update user profile
exports.updateUser = (req, res) => {
    const { password, role, name, phone, address, payment_method, payment_card_number, id } = req.body
    // 对密码进行加密
    hashedPassword = bcrypt.hashSync(password, 10)
    // 将用户信息插入到用户表中
    const sqlStr1 = ` UPDATE user
    SET 
      password = COALESCE(?, password),
      role = COALESCE(?, role),
      name = COALESCE(?, name),
      phone = COALESCE(?, phone),
      address = COALESCE(?, address),
      payment_method = COALESCE(?, payment_method),
      payment_card_number = COALESCE(?, payment_card_number)
    WHERE id = ?;
  `
    db.query(sqlStr1, [hashedPassword, role, name, phone, address, payment_method, payment_card_number, id], (err, results) => {
        if (err) return res.cc(err)
        // SQL 语句执行成功，但影响行数不为 1
        if (results.affectedRows !== 1) return res.cc('Failed to register')
        res.cc('Update Completed', 200)
    })
}