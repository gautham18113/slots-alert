require('dotenv').config();

const nodemailer = require("nodemailer");

const sendEmail = (receiver, body) => {

    console.log(receiver);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    });

    const mailConfig = {
        from: "gauthamram.rajendran@gmail.com",
        to: receiver,
        subject: "Slot Update",
        html: body
    }

    transporter.sendMail(mailConfig, (error, info) => {
        if(error) console.log(error);
        else {
            if(process.env.NODE_VERBOSE==="true")console.log(info);
            console.log("Email Sent");
        }
    })
}

module.exports = sendEmail;