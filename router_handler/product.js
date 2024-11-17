import db from '../db/index.js';
import upload from '../util/upload.js';
const create = (req, res) => {
    upload(req, res).then(imgsrc => {

        const { name, price, category, brand, quantity, description } = req.body;

        const sqlStr = `
            INSERT INTO product (name, price, category, brand, image_url, quantity, description)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(sqlStr, [name, price, category, brand, imgsrc, quantity, description], (err, results) => {
            if (err) return res.cc(err)
            // SQL 语句执行成功，但影响行数不为 1
            res.cc('New Product Created', 200)
        })
    }).catch(err => {
        res.cc(err.message)
    })
}

const update = (req, res) => {
    upload(req, res).then(imgsrc => {
        const { name, price, category, brand, quantity, description, id } = req.body;

        const sqlStr = `
         UPDATE product
            SET 
                name = COALESCE(?, name),
                price = COALESCE(?, price),
                category = COALESCE(?, category),
                brand = COALESCE(?, brand),
                image_url = COALESCE(?, image_url),
                quantity = COALESCE(?, quantity),
                description = COALESCE(?, description)
            WHERE id = ?;
        `
        db.query(sqlStr, [name, price, category, brand, imgsrc, quantity, description, id], (err, results) => {
            if (err) return res.cc(err)
            // SQL 语句执行成功，但影响行数不为 1
            res.cc('Product Update Created', 200)
        })
    }).catch(err => {
        res.cc(err.message)
    })
}

const getDetail = (req, res) => {
    const { id } = req.params
    const sqlStr = `SELECT * FROM product WHERE id = ?`
    db.query(sqlStr, parseInt(id, 10), (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 1) return res.cc('Duplicate records')
        res.send({
            status: 200,
            message: 'Success',
            data: results[0]
        })
    })
}

const deleteProduct = (req, res) => {
    const { id } = req.params
    const sqlStr = `DELETE FROM product WHERE id = ?`
    db.query(sqlStr, parseInt(id, 10), (err, results) => {
        if (err) return res.cc(err)
        res.send({
            status: 200,
            message: 'Success',
        })
    })
}

const getProductsByList = async (req, res) => {
    // 1.针对name进行模糊查询
    // 2.针对价格或时间进行升序或降序
    // 3. 拥有分页功能
    // 4.能够过滤、category、brand、价格区间等字段
    try {
        const {
            category,
            brand,
            min_price,
            max_price,
            name,
            page = 1,
            limit = 10,
            sort_by = 'created_at',
            sort_order = 'desc'
        } = req.query;

        // 构建查询条件
        let whereConditions = 'WHERE 1=1'; // 默认查询条件
        let params = [];

        if (category) {
            whereConditions += ' AND category = ?';
            params.push(category);
        }
        if (brand) {
            whereConditions += ' AND brand = ?';
            params.push(brand);
        }
        if (name) {
            whereConditions += ' AND name LIKE ?';
            params.push(`%${name}%`);
        }
        if (min_price) {
            whereConditions += ' AND price >= ?';
            params.push(parseFloat(min_price));
        }
        if (max_price) {
            whereConditions += ' AND price <= ?';
            params.push(parseFloat(max_price));
        }

        // 构建排序和分页
        const order = `ORDER BY ${sort_by} ${sort_order.toUpperCase()}`;
        const offset = (page - 1) * limit;
        const limitClause = `LIMIT ? OFFSET ?`;

        const sql = `
          SELECT * FROM product
          ${whereConditions}
          ${order}
          ${limitClause}
        `;

        // 执行查询
        const result = await db.query(sql, [...params, parseInt(limit), offset], (err, results) => {
            if (err) return res.cc(err)
            res.send({
                status: 200,
                size: results.length,
                data: results,
            })
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
}

export default {
    create,
    update,
    getDetail,
    deleteProduct,
    getProductsByList
}