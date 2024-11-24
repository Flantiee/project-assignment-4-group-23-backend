const db = require('../db')
const upload = require('../util/upload')
const fetchBrandReviews = require('../util/getExternalData')
exports.create = (req, res) => {


    const { name, price, category, brand, quantity, description, img } = req.body;

    const sqlStr = `
            INSERT INTO product (name, price, category, brand, image_url, quantity, description)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
    db.query(sqlStr, [name, price, category, brand, img, quantity, description], (err, results) => {
        if (err) return res.status(500).cc(err)
        // SQL 语句执行成功，但影响行数不为 1
        res.status(201).cc('New Product Created', 201)
    })

}

exports.update = (req, res) => {
    const { name, price, category, brand, quantity, description, id, img } = req.body;

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
    db.query(sqlStr, [name, price, category, brand, img, quantity, description, id], (err, results) => {
        if (err) return res.status(500).cc(err)
        // SQL 语句执行成功，但影响行数不为 1
        res.status(200).cc('Product Update Created', 200)
    })

}

exports.getDetail = (req, res) => {
    const { id } = req.params
    const sqlStr = `SELECT * FROM product WHERE id = ?`
    db.query(sqlStr, parseInt(id, 10), async (err, results) => {
        if (err) return res.cc(err)
        if (results.length > 1) return res.cc('Duplicate records')
        const response = await fetchBrandReviews(results[0].brand)
        if (response.status === 'OK')
            res.send({
                status: 200,
                message: 'Success',
                data: results[0],
                reviews: response.data.reviews
            })
        else res.send({
            status: 200,
            message: 'Success',
            data: results[0],
            reviews: []
        })
    })
}

exports.delete = (req, res) => {
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

exports.getProductsByList = async (req, res) => {
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
            limit = 3,
            sort_by = 'price',
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

        const countSql = `
            SELECT COUNT(*) AS totalCount
            FROM product
            ${whereConditions}
        `;

        const countResult = db.query(countSql, [...params], (err, results) => {
            if (results) {
                const totalCount = results[0].totalCount;

                const sql = `
                SELECT * FROM product
                ${whereConditions}
                ${order}
                ${limitClause}
              `
                // 执行查询
                const result = db.query(sql, [...params, parseInt(limit), offset], (err, results) => {

                    if (err) return res.cc(err)
                    res.send({
                        status: 200,
                        size: totalCount,
                        data: results,
                    })
                });
            }
        });


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
}
