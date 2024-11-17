// 1. 引入配置好的multerConfig
import multerConfig from '../config/multerConfig.js';

// 2. 定义静态变量
const fileName = "img";  // 上传的 fileName 名称
const updateBaseUrl = "http://127.0.0.1:7777"; // 上传到服务器地址
const imgPath = "/uploads/"; // 上传到服务器的虚拟目录

// 上传接口的 请求参数req  响应参数res
const upload = (req, res) => {
    return new Promise((resolve, reject) => {
        multerConfig.single(fileName)(req, res, (err) => {
            if (err) {
                reject(err);
            } else {
                // `req.file.filename` 请求文件名称后缀
                // `updateBaseUrl + imgPath + req.file.filename` 完整的服务器虚拟目录
                resolve(updateBaseUrl + imgPath + req.file.filename);
            }
        });
    });
};

export default upload;