const mysql = require('mysql')

const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '188671',
  database: 'ece9065',
})

module.exports = db
