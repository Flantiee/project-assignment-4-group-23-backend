const db = require('../db')

exports.create = (req, res) => {
    const { user_id, product_id, quantity } = req.body;

    // 1. 查询商品库存数量
    const sqlStr1 = `SELECT quantity, price FROM product WHERE id = ?`;
    db.query(sqlStr1, [product_id], (err, results) => {
        if (err) return res.cc(err.message, 500);

        // 如果商品不存在，返回错误
        if (results.length === 0) {
            return res.cc("Product not found", 404);
        }

        const availableQuantity = results[0].quantity;
        const productPrice = results[0].price

        // 2. 如果库存不足，返回错误
        if (availableQuantity < quantity) {
            return res.cc("Insufficient stock", 400);
        }

        // 3. 检查购物车中是否已经存在该商品,并且没有被结算
        const sqlStr2 = `SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND checkout_id IS null`;
        db.query(sqlStr2, [user_id, product_id], (err, results) => {
            if (err) return res.cc(err.message, 500);

            // 4. 如果商品已经存在，更新购物车中的数量
            if (results.length > 0) {
                const newQuantity = parseInt(results[0].quantity, 10) + parseInt(quantity, 10); // 增加商品数量
                const newTotalPrice = newQuantity * productPrice
                const sqlStr3 = `UPDATE cart SET quantity = ?, total_price = ? WHERE user_id = ? AND product_id = ?`;
                db.query(sqlStr3, [newQuantity, newTotalPrice, user_id, product_id], (err, results) => {
                    if (err) return res.cc(err.message, 500);

                    // 5. 更新 product 表中的库存
                    const newStock = availableQuantity - quantity; // 减去库存
                    const sqlStr5 = `UPDATE product SET quantity = ? WHERE id = ?`;
                    db.query(sqlStr5, [newStock, product_id], (err, results) => {
                        if (err) return res.cc(err.message, 500);
                        return res.cc("Product quantity updated in your cart and stock reduced", 200); // 更新成功
                    });
                });
            } else {
                // 6. 如果商品不存在，插入新记录
                const sqlStr4 = `INSERT INTO cart (user_id, product_id, quantity, total_price) VALUES(?, ?, ?, ?)`;
                db.query(sqlStr4, [user_id, product_id, quantity, quantity * productPrice], (err, results) => {
                    if (err) return res.cc(err.message, 500);

                    // 7. 更新 product 表中的库存
                    const newStock = availableQuantity - quantity; // 减去库存
                    const sqlStr5 = `UPDATE product SET quantity = ? WHERE id = ?`;
                    db.query(sqlStr5, [newStock, product_id], (err, results) => {
                        if (err) return res.cc(err.message, 500);
                        return res.cc("Product added to your cart and stock reduced", 201); // 插入成功
                    });
                });
            }
        });
    });
};

exports.update = (req, res) => {
    const { id, quantity } = req.body;

    // 确保 quantity 是一个正整数
    if (quantity <= 0) {
        return res.cc('Quantity must be a positive number.', 400);
    }

    // 1. 查询购物车中该商品的 product_id 和现有数量
    const sqlStr1 = `SELECT product_id, quantity FROM cart WHERE id = ?`;
    db.query(sqlStr1, [id], (err, results) => {
        if (err) return res.cc(err.message, 500);

        // 如果没有找到购物车中的商品，返回错误信息
        if (results.length === 0) {
            return res.cc('No such product found in the cart.', 404);
        }

        const productId = results[0].product_id;
        const currentCartQuantity = results[0].quantity;

        // 2. 查询该商品的库存数量
        const sqlStr2 = `SELECT quantity, price FROM product WHERE id = ?`;
        db.query(sqlStr2, [productId], (err, results) => {
            if (err) return res.cc(err.message, 500);

            // 如果商品不存在，返回错误
            if (results.length === 0) {
                return res.cc('Product not found.', 404);
            }

            const availableQuantity = results[0].quantity;
            const productPrice = results[0].price

            // 3. 计算库存是否足够，如果新数量大于现有数量，检查库存
            if (quantity > currentCartQuantity) {
                const requiredQuantity = quantity - currentCartQuantity;

                if (availableQuantity < requiredQuantity) {
                    return res.cc('Insufficient stock to update quantity in cart.', 400);
                }
            }

            // 4. 更新购物车中指定商品的数量 & update totalPrice 
            const totalPrice = quantity * productPrice
            const sqlStr3 = `UPDATE cart SET quantity = ?, total_price = ? WHERE id = ?`;
            db.query(sqlStr3, [quantity, totalPrice, id], (err, results) => {
                if (err) return res.cc(err.message, 500);

                // 5. 更新商品的库存
                const newStock = availableQuantity - (quantity - currentCartQuantity);
                const sqlStr4 = `UPDATE product SET quantity = ? WHERE id = ?`;
                db.query(sqlStr4, [newStock, productId], (err, results) => {
                    if (err) return res.cc(err.message, 500);
                    return res.cc('Cart updated successfully and stock reduced.', 200);
                });
            });
        });
    });
};

exports.delete = (req, res) => {
    const { id } = req.query;

    // 1. 查询购物车中该商品的数量
    const sqlStr1 = `SELECT product_id, quantity FROM cart WHERE id = ?`;
    db.query(sqlStr1, [id], (err, results) => {
        if (err) return res.status(500).cc(err.message, 500);

        // 如果购物车中没有该商品，返回错误信息
        if (results.length === 0) {
            return res.status(500).cc('No such product found in the cart.', 404);
        }

        const productId = results[0].product_id;
        const cartQuantity = results[0].quantity;

        // 2. 执行删除操作
        const sqlStr2 = `DELETE FROM cart WHERE id = ?`;
        db.query(sqlStr2, [id], (err, results) => {
            if (err) return res.status(500).cc(err.message, 500);

            // 如果删除操作没有影响任何记录，返回错误信息
            if (results.affectedRows === 0) {
                return res.status(500).cc('No such product found in the cart to delete.', 404);
            }

            // 3. 更新产品库存，将该商品的数量加回
            const sqlStr3 = `SELECT quantity FROM product WHERE id = ?`;
            db.query(sqlStr3, [productId], (err, results) => {
                if (err) return res.status(500).cc(err.message, 500);

                // 如果没有找到商品，返回错误信息
                if (results.length === 0) {
                    return res.status(500).cc('Product not found in inventory.', 404);
                }

                const currentStock = results[0].quantity;
                const newStock = currentStock + cartQuantity; // 加回购物车中该商品的数量

                // 4. 更新库存
                const sqlStr4 = `UPDATE product SET quantity = ? WHERE id = ?`;
                db.query(sqlStr4, [newStock, productId], (err, results) => {
                    if (err) return res.status(500).cc(err.message, 500);

                    // 5. 返回成功消息
                    return res.cc('Product deleted from cart and stock updated successfully.', 200);
                });
            });
        });
    });
};

exports.getCartListById = (req, res) => {
    const { id } = req.query;
    const sqlStr = `SELECT cart.*, product.name, product.image_url, product.price, description FROM cart LEFT JOIN product ON cart.product_id = product.id WHERE cart.user_id = ? AND cart.checkout_id IS NULL`

    db.query(sqlStr, id, (err, results) => {
        if (err) return res.cc(err.message, 500);
        if (results.length <= 0) return res.cc("The cart is empty", 404)
        res.send({
            status: 200,
            size: results.length,
            data: results,
        })
    })
}
