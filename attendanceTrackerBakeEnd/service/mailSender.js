const nodemailer = require('nodemailer');

async function mailSender (email, title, body){
    try{
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth:{
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        });

        let info = await transporter.sendMail({
            from: 'Aluri',
            to: email,
            subject: title,
            html: body,
        });
        return info;
    }catch(error){
        console.log(error.message);
    }
}

module.exports = mailSender;