require('dotenv').config();

const nodemailer = require("nodemailer");
const {google} = require('googleapis');

const CLIENT_ID = '206318213576-fl8nvv7htsqoldb8ar6klbl66pn7t5m3.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04QfN_IUSTp-yCgYIARAAGAQSNwF-L9IrtxNu887aGZbN3Hx5n85AZWGtjYNrR9AydyQtn8lk3fm9S-KkqYBafAw2QGPBrOpi6jM';

const oauth2client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2client.setCredentials({refresh_token: REFRESH_TOKEN});

const sendEmail = async (receiver, body) => {

    console.log(receiver);

    const accessToken = await oauth2client.getAccessToken();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAUTH2',
            user: 'slotsalertbot@gmail.com',
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: accessToken
        }
    });

    const mailConfig = {
        from: "SLOTS ALERT 📟 <slotsalertbot@gmail.com>",
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