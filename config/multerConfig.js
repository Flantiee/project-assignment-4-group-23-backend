import multer from 'multer';
import md5 from 'md5';
import path from 'path';

// 工具函数：获取路径
const resolve = (dir) => path.join(__dirname, './', dir);

// multer存储配置
const storage = multer.diskStorage({
    // 存储路径
    destination: (req, file, cb) => {
        // 只允许上传 JPEG 和 PNG 图片
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, resolve('../uploads'));
        } else {
            // 如果文件类型不允许，返回错误
            cb(new Error('Mime type not supported'), false);
        }
    },
    // 存储文件名
    filename: (req, file, cb) => {
        const fileFormat = file.originalname.split('.');
        const fileExtension = fileFormat[fileFormat.length - 1];
        cb(null, md5(+new Date()) + '.' + fileExtension);  // 使用 md5 和当前时间戳生成文件名
    },
});

// 配置 multer
const multerConfig = multer({
    storage: storage,
});

// 导出配置好的 multer 实例
export default multerConfig;