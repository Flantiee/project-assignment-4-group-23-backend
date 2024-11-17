import db from '../db/index.js';
import emailTransporter from '../util/email.js';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

const getCheckOutDetail = (req, res) => {
    const { user_id } = req.query;

    const sqlStr = `
        SELECT 
            u.id,          
            u.name,             
            u.phone,           
            u.address,          
            u.payment_method,   
            u.payment_card_number,  
            SUM(c.total_price) AS total_amount  
        FROM 
            user u
        JOIN 
            cart c ON u.id = c.user_id  
        WHERE 
            c.checkout_id IS NULL 
            AND u.id = ?  
        GROUP BY 
            u.id,             
            u.name, 
            u.phone, 
            u.address, 
            u.payment_method, 
            u.payment_card_number;
    `;

    db.query(sqlStr, [user_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database Internal Error', error: err.message });
        }

        if (results.length === 0) {
            // Failed to find such user
            return res.status(404).json({ message: 'Cart List not found' });
        }


        const userData = results[0];

        // only the last 4 digits remained
        const maskedCardNumber = userData.payment_card_number.replace(/\d(?=\d{4})/g, "*");

        // cover the orginal number
        userData.payment_card_number = maskedCardNumber;

        // return search result
        res.status(200).json({
            message: 'success',
            data: userData
        });
    });
};



const confirmCheckOut = async (req, res) => {
    const { user_id } = req.query;

    try {
        // Step 1: Get user and cart details (包括商品信息)
        const sqlStr1 = `
            SELECT 
                u.id,
                u.email,          
                u.name,             
                u.phone,           
                u.address,          
                u.payment_method,   
                u.payment_card_number,  
                SUM(c.total_price) AS total_amount  
            FROM 
                user u
            JOIN 
                cart c ON u.id = c.user_id  
            WHERE 
                c.checkout_id IS NULL 
                AND u.id = ?  
            GROUP BY 
                u.id,             
                u.name, 
                u.phone, 
                u.address, 
                u.payment_method, 
                u.payment_card_number;
        `;
        const userResults = await query(sqlStr1, [user_id]);
        if (userResults.length === 0) {
            return res.status(404).json({ message: 'Cart List not found' });
        }

        const checkoutData = userResults[0];
        const total_price = checkoutData.total_amount;
        const tax = total_price * 0.13;
        const shipping_fee = total_price * 0.02;
        const payment_amount = total_price + tax + shipping_fee;
        const payment_method = checkoutData.payment_method;
        const address = checkoutData.address;

        // Step 2: Get cart items (商品名称、数量和价格)
        const sqlStr2 = `
            SELECT 
                p.name ,
                p.price AS item_price,
                c.quantity, 
                c.total_price
            FROM cart c
            LEFT JOIN product p ON c.product_id = p.id
            WHERE c.user_id = ? AND c.checkout_id IS NULL;
        `;
        const cartItems = await query(sqlStr2, [user_id]);

        // 如果没有商品
        if (cartItems.length === 0) {
            return res.status(404).json({ message: 'No items in the cart' });
        }

        // Step 3: Insert checkout record
        const sqlStr3 = `
            INSERT INTO checkout (user_id, total_price, tax, shipping_fee, payment_amount, payment_method, address)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const insertResult = await query(sqlStr3, [user_id, total_price, tax, shipping_fee, payment_amount, payment_method, address]);
        const checkoutId = insertResult.insertId;

        // Step 4: Update cart with checkout_id
        const sqlStr4 = `UPDATE cart SET checkout_id = ? WHERE user_id = ?`;
        await query(sqlStr4, [checkoutId, user_id]);

        // Step 5: Prepare the HTML content using Handlebars
        // 获取 template.html 的绝对路径
        const templatePath = path.join(__dirname, '..', 'html', 'template.html');
        console.log(templatePath);
        const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
        const template = handlebars.compile(htmlTemplate);

        const emailContent = template({
            user_name: checkoutData.name,
            items: cartItems,
            total_amount: total_price,
            tax: tax,
            shipping_fee: shipping_fee,
            payment_amount: payment_amount,
            order_id: checkoutId
        });

        // Step 6: Send email with the rendered HTML content
        const mailOptions = {
            from: 'starrypan28@gmail.com',   // 发件人邮箱
            to: checkoutData.email,  // 收件人邮箱
            subject: 'The detail of your Transaction',  // 邮件主题
            html: emailContent  // 邮件内容（HTML）
        };

        emailTransporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error.toString());
                return res.status(500).send('Error: ' + error.toString());
            }
        });

        // 成功响应
        res.status(201).json({
            message: 'Checkout successful'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Checkout failed', error: err.message });
    }
};

const getPreviousOrderList = (req, res) => {
    const { user_id } = req.query;
    const sqlStr = `SELECT * FROM checkout WHERE user_id = ?`
    db.query(sqlStr, user_id, (err, results) => {
        if (err) res.cc(err)

        res.status(200).json({
            size: results.length,
            data: results
        })
    })
}

export default {
    getCheckOutDetail,
    confirmCheckOut,
    getPreviousOrderList
}
