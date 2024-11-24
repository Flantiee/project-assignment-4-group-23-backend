const upload = require('../util/upload')
exports.upload = (req, res) => {
    upload(req, res).then((imgsrc) => {
        res.status(201).json({
            url: imgsrc
        })
    }).catch(err => {
        res.status(500).cc(err.message)
    })
} 