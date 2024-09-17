const { Bank } = require('../models/settingModel');
const {TransactionType} = require('../models/transactionModel');
const AppError = require('../utils/appError');
const HttpStatusCode = require("../utils/httpStatusCode");
const nodemailer = require('nodemailer');

const createBankInstitution =  async(req,res)=>{
    try {
        const { bankSwiftCode, bankName, bankLocation } = req.body;

        // Check for duplicate bank code or swift code
        const existingBankCode = await Bank.findOne({ bankSwiftCode });
        if (existingBankCode) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({
                status: 'fail',
                message: 'Duplicate Bank Code'
            });
        }

        const newBank = await Bank.create({
            bankSwiftCode,
            bankName,
            bankLocation
        });
            
        res.status(HttpStatusCode.CREATED).json({
            status: 'success',
            data: {
                bank: newBank
            }
        })
    } catch (error){
        res.status(HttpStatusCode.BAD_REQUEST).json({
            status: 'fail',
            message: error.message
        })
    }
}

// List Bank

const getAllBank = async (req,res)=>{
    try{
        const query = Bank.find({});
        // remove additional field
        const result = await query.select('-__v');
        res.status(HttpStatusCode.OK).json({
            status: 'success',
            result: result.length,
            data: {
                bank: result
            }
        })
    } catch (error){
        res.status(HttpStatusCode.NOT_FOUND).json({
            status: 'fail',
            message: error
        })
    }
    
}

// create transaction type

const createTransactionType =  async(req,res)=>{
    try {
        const { type, status } = req.body;

        // Check for duplicate bank code or swift code
        const existingTransactionType = await TransactionType.findOne({ type });
        if (existingTransactionType) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({
                status: 'fail',
                message: 'Duplicate Transaction Type'
            });
        }

        const newTransactionType = await TransactionType.create({
            type, status
        });
            
        res.status(HttpStatusCode.CREATED).json({
            status: 'success',
            data: {
                bank: newTransactionType
            }
        })
    } catch (error){
        res.status(HttpStatusCode.BAD_REQUEST).json({
            status: 'fail',
            message: error.message
        })
    }
}

// manage the mail sending
const sendEmail = async ({ to, subject, text, html }) => {
    // Create a transporter object using SMTP transport
    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_SERVER, // e.g., smtp.gmail.com for Gmail
        port: 465, // 465 for secure SMTP
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER, // Your email address
            pass: process.env.SMTP_PASS // Your email password
        }
    });

    // Set up email data
    let mailOptions = {
        from: `"Notifications" <${process.env.SMTP_EMAIL}>`, // Sender address
        to: to, // List of recipients
        subject: subject, // Subject line
        text: text, // Plain text body
        html: html // HTML body
    };

    // Send mail with the defined transport object
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email: ', error);
        throw new Error('Email sending failed');
    }
};



module.exports = {
    createBankInstitution,
    getAllBank,
    createTransactionType,
    sendEmail
}