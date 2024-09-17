const { Transaction, Image, TransactionType } = require('../models/transactionModel');
const { Account, AccountBank, Personal } = require('../models/userModel');
const { sendEmail } = require('./settingController'); 
const { Bank } = require('../models/settingModel');
const HttpStatusCode = require("../utils/httpStatusCode");
const mongoose = require('mongoose');

const createTransaction = async (req, res) => {
    try {
        const { userId, accountNumber, requestFund, bank } = req.body;
        const imageFile = req.file;

        if (!imageFile) {
            return res.status(400).json({
                status: 'fail',
                message: 'Image file is required'
            });
        }

        const result = await TransactionType.findOne({ type: 'Credit' }).select('_id');

        if (!result) {
            return res.status(400).json({
                status: 'fail',
                message: 'Transaction type "credit" not found'
            });
        }

        // Save image info to the database
        const newImage = await Image.create({
            originalName: imageFile.originalname,
            fileName: imageFile.filename,
            filePath: imageFile.path,
            fileSize: imageFile.size,
            fileType: imageFile.mimetype
        });

        // Update To account
        const updatedToAccount = await Account.findOneAndUpdate(
            { user: userId },
            { $inc: { AvailableFunds: -requestFund, LoanFunds: +requestFund } },
            { new: true }
        );

        if (!updatedToAccount) {
            throw new Error('Account not found or update failed');
        }

        // Update To bank account
        const updatedToBankAccount = await AccountBank.findOneAndUpdate(
            { user: userId, _id: bank },
            { $inc: { currentFund: +requestFund } },
            { new: true }
        );

        if (!updatedToBankAccount) {
            throw new Error('Bank Account not found or update failed');
        }

        // Create a new transaction
        const newTransaction = await Transaction.create({
            user: userId,
            accountNumber,
            requestFund: requestFund,
            bank,
            image: newImage._id,
            transactionType: result._id
        });

        // Prepare email details
        const emailDetails = {
            to: 'jasperaga@gmail.com',  // Replace with the recipient's email address
            subject: 'Transaction Confirmation',
            text: `Dear User,\n\nYour transaction has been successfully processed.\n\nDetails:\n- Transaction ID: ${newTransaction._id}\n- Amount: ${requestFund}\n\nThank you.`,
            html: `<p>Dear User,</p><p>Your transaction has been successfully processed.</p><p><strong>Details:</strong><br>Transaction ID: ${newTransaction._id}<br>Amount: ${requestFund}</p><p>Thank you.</p>`
        };

        // Call the sendEmail function
        await sendEmail(emailDetails);

        res.status(201).json({
            status: 'success',
            data: {
                transaction: newTransaction
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// get transaction
const getTransaction = async (req, res) => {
    try {
        const userId = req.params.userId;

        const transactions = await Transaction.aggregate([
            {
                $lookup: {
                    from: 'accountbanks',
                    localField: 'bank', // Assuming 'bank' in Transaction refers to accountbanks' _id
                    foreignField: '_id',
                    as: 'bankInfo'
                }
            },
            {
                $unwind: {
                    path: '$bankInfo',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    $or: [
                        { user: new mongoose.Types.ObjectId(userId) }, // Match Transaction.user
                        { 'bankInfo.user': new mongoose.Types.ObjectId(userId) } // Match accountbanks.user
                    ]
                }
            },
            {
                $lookup: {
                    from: 'transactiontypes',
                    localField: 'transactionType',
                    foreignField: '_id',
                    as: 'transactionInfo'
                }
            },
            {
                $unwind: {
                    path: '$transactionInfo',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'banks',
                    localField: 'bankInfo.bank',
                    foreignField: '_id',
                    as: 'bankInfoName'
                }
            },
            {
                $unwind: {
                    path: '$bankInfoName',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    'transactionInfo.type': 1,
                    user: 1,
                    bank: 1,
                    'bankInfo.bank': 1,
                    'bankInfo.accountNumber': 1,
                    'bankInfoName.bankName': 1,
                    'bankInfo.user': 1,
                    image: 1,
                    requestFund: 1,
                    accountNumber: 1,
                    dateTime: 1
                }
            }
        ]);
        

        res.status(HttpStatusCode.OK).json({
            status: 'success',
            result: transactions.length,
            data: { transactions }
        });
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
            status: 'fail',
            message: error.message
        });
    }
};


const getFunds = async (req, res) => {
    try {
        const userId = req.params.userId;
        const result = await AccountBank.find({ user: userId }).select('accountNumber accountType currentFund');

        if (!result) {
            return res.status(HttpStatusCode.NOT_FOUND).json({
                status: 'fail',
                message: 'Account not found'
            });
        }

        res.status(HttpStatusCode.OK).json({
            status: 'success',
            result: 1,
            data: {
                accounts: result             
            }
        });
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
            status: 'fail',
            message: error.message
        });
    }
}


const createSendeFund =  async(req,res)=>{
    try {
        const { type, amount, fee, status, description, recipientName, from_account, from_account_number, to_account } = req.body;

        const amountFromSubtract = parseFloat(amount) + parseFloat(fee);
        const amountToSubtract = parseFloat(amount);

        /* Update From account */
        const updatedFromAccount = await AccountBank.findOneAndUpdate(
            { accountNumber: from_account_number },
            { $inc: { currentFund: -amountFromSubtract } },
            { new: true }
        );

        if (!updatedFromAccount) {
            throw new Error('From account not found or update failed');
        }

        /* Update To account */
        const updatedToAccount = await AccountBank.findOneAndUpdate(
            { user: to_account, accountType: 'Chequing' },
            { $inc: { currentFund: +amountToSubtract } }, // Subtract the amount
            { new: true }
        );

        if (!updatedToAccount) {
            throw new Error('To account not found or update failed');
        }

        /* Update merlin account */
        // const updatedMerlinAccount = await Account.findOneAndUpdate(
        //     { user: '66685a02e3a9f67dda00cf78' },
        //     { $inc: { balance: + fee } },
        //     { new: true }
        // );

        // if (!updatedMerlinAccount) {
        //     throw new Error('To account not found or update failed');
        // }
      
          // Create a new transaction
        //   const newTransaction = await Transaction.create({
        //     type, amount, status, fee, description, recipientName, from_account,
        //     to_account, to_source, from_source, notes
        //   });

        // find bank
        const resultBank = await AccountBank.findOne({ user: to_account,  accountType: 'Credit' }).select('_id');

        if (!resultBank) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({
                status: 'fail',
                message: 'Reciever Bank Account'
            });
        }


        const newTransaction = await Transaction.create({
            user: from_account,
            accountNumber: from_account_number,
            requestFund: amountToSubtract,
            bank: resultBank._id,
            //image: newImage._id,
            transactionType: type
        });

        const getReceiptDetails = await Personal.findOne({user: to_account}).select('firstName lastName');
        if (!getReceiptDetails) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({
                status: 'fail',
                message: 'Recient does not exist'
            });
        }
        console.log('Message from: %s', from_account);
        console.log('Message to: %s', to_account);

         // Prepare email details
         const emailDetails = {
            to: 'jasperaga@gmail.com',  // Replace with the recipient's email address
            subject: 'Fund Transfer Confirmation',
            text: `Dear User,\n\nYour transaction has been successfully processed.\n\nDetails:\n- Transaction ID: ${newTransaction._id}\n- Amount: ${amountToSubtract}\nRecipient Name: ${getReceiptDetails.firstName} ${getReceiptDetails.lastName}\n\nThank you.`,
            html: `<p>Dear User,</p><p>Your transaction has been successfully processed.</p><p><strong>Details:</strong><br>Transaction ID: ${newTransaction._id}<br>Amount: ${amountToSubtract}<br>Recipient Name: ${getReceiptDetails.firstName} ${getReceiptDetails.lastName}</p><p>Thank you.</p>`
        };

        // Call the sendEmail function
        await sendEmail(emailDetails);
            
        res.status(HttpStatusCode.CREATED).json({
            status: 'success',
            data: {
                bank: newTransaction
            }
        })
    } catch (error){
        res.status(HttpStatusCode.BAD_REQUEST).json({
            status: 'fail',
            message: error.message
        })
    }
}



module.exports = {
    createTransaction,
    getTransaction,
    getFunds,
    createSendeFund
};
