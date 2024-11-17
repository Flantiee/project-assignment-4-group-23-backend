import nodemailer from 'nodemailer';

const emailTransporter = nodemailer.createTransport({
    service: 'gmail',  // 选择邮件服务提供商（这里使用 Gmail）
    auth: {
        user: 'starrypan28@gmail.com',  // 你的 Gmail 邮箱
        pass: 'bzwi oymz hrul mxiv'    // 你的 Gmail 密码（或应用专用密码）
    }
});

export default emailTransporter;