
const db = require('../db')
// 获取密码加密模块
const bcrypt = require('bcryptjs')
// 用这个包来生成 Token 字符串
const jwt = require('jsonwebtoken')
// 获取加密值
const { jwtSecretKey } = require('../config/jwtConfig')

// 注册用户的处理函数
exports.regUser = (req, res) => {

    const { email, password, role, name, phone, address, payment_method, payment_card_number } = req.body
    if (!email || !password) {
        return res.status(400).cc('Email or password can not be empty')
    }
    // 查询数据库中的用户名是否重复
    const sqlStr1 = `select * from user where email=?`
    db.query(sqlStr1, [email], (err, results) => {
        // 执行SQL语句失败
        if (err) return res.status(500).cc(err)
        // duplicate email ?
        if (results.length > 0) {
            console.log(results)
            return res.status(409).cc('Duplicate email')
        }
        else {
            // 对密码进行加密
            hashedPassword = bcrypt.hashSync(password, 10)
            hashedPayment_number = bcrypt.hashSync(payment_card_number, 10)
            payment_card_slice = payment_card_number.slice(-4)
            // 将用户信息插入到用户表中
            const sqlStr2 = `INSERT INTO user (email, password, role, name, phone, address, payment_method, payment_card_number, payment_card_slice) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
            db.query(sqlStr2, [email, hashedPassword, role || 'user', name, phone, address, payment_method || 'debit', hashedPayment_number, payment_card_slice], (err, results) => {
                if (err) return res.cc(err)
                // SQL 语句执行成功，但影响行数不为 1
                if (results.affectedRows !== 1) return res.status(500).cc('Failed to register')
                res.cc('Register Completed', 200)
            })
        }
    })
}

// 登录用户的处理函数
exports.login = (req, res) => {
    const { email, password } = req.body
    const sqlStr1 = `select * from user where email= ?`
    db.query(sqlStr1, email, (err, results) => {
        if (err) return res.cc(err)
        if (results.length != 1) return res.status(401).cc('Wrong Email')
        // 比较密码是否正确 (一定要记得写resutls[0])
        const compareResult = bcrypt.compareSync(password, results[0].password)
        if (!compareResult) return res.status(401).cc('Wrong Password')
        // 获取用户信息的综合
        const user = { ...results[0], password: '', user_pic: '' }
        // 生成token
        const tokenStr = jwt.sign({ id: user.id }, jwtSecretKey, { expiresIn: '24h' })
        res.send({
            status: 200,
            message: 'Login Completed',
            token: tokenStr,
        })
    })
}
// update user profile
exports.updateUser = (req, res) => {
    const { password, role, name, phone, address, payment_method, payment_card_number, id } = req.body

    // 将用户信息插入到用户表中
    const sqlStr1 = ` UPDATE user
    SET 
      password = COALESCE(?, password),
      role = COALESCE(?, role),
      name = COALESCE(?, name),
      phone = COALESCE(?, phone),
      address = COALESCE(?, address),
      payment_method = COALESCE(?, payment_method),
      payment_card_number = COALESCE(?, payment_card_number),
      payment_card_slice = COALESCE(?, payment_card_slice)
    WHERE id = ?;
  `
    const insertPassword = password == null ? null : bcrypt.hashSync(password, 10)
    const insert_payment_card_number = payment_card_number == null ? null : bcrypt.hashSync(payment_card_number, 10)
    const payment_card_slice = payment_card_number == null ? null : payment_card_number.slice(-4);

    db.query(sqlStr1, [insertPassword, role, name, phone, address, payment_method, insert_payment_card_number, payment_card_slice, id], (err, results) => {
        if (err) return res.cc(err)
        // SQL 语句执行成功，但影响行数不为 1
        if (results.affectedRows !== 1) return res.cc('Failed to update')
        res.cc('Update Completed', 200)
    })
}

exports.userInfo = (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1]; // 获取 "Bearer <token>"
    let id = -1

    try {
        const decoded = jwt.verify(token, jwtSecretKey); // 解密并验证
        id = decoded.id; // 将解密后的 payload 添加到请求对象上
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const sqlStr = `select * from user where id= ?`
    db.query(sqlStr, id, (err, results) => {
        if (err) return res.status(500).cc(err)
        const user = { ...results[0], password: '', payment_card_number: '' }
        res.send({
            status: 200,
            message: 'successed',
            data: user
        })
    })
}