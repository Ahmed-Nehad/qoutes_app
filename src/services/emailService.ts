import {Transporter, createTransport} from 'nodemailer'
require('dotenv').config();

export const getEmailDriver = () => createTransport({
    host: process.env.NODEMAILER_HOST,
    port: +process.env.NODEMAILER_PORT!,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS
    }
});

export const sendEmail =  (emailDriver: Transporter, to: string | string[], subject: string, text: string) => {
    const mailOption = {
        from: process.env.NODEMAILER_SENDER,
        to,
        subject,
        text
    }
    
    emailDriver.sendMail(mailOption, err => { 
        if (err) {
            console.error('An error happened while sending emails: ')
            console.error(err);
        }
    })
}