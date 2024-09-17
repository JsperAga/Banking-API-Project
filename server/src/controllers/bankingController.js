const { TransactionType, Transaction } = require('../models/transactionModel');
const { Account, AccountBank, Personal } = require('../models/userModel');
const HttpStatusCode = require("../utils/httpStatusCode");

const createPaymentTransaction = async (req, res) => {
    try {
        const { accountNumber, paymentFund, bankPayment } = req.body;
        
        const result = await TransactionType.findOne({ type: 'Payment' }).select('_id');

        if (!result) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({
                status: 'fail',
                message: 'Transaction type "Payment" not found'
            });
        }

        const getAccountBankId = await AccountBank.findOne({bank: bankPayment}).select('_id');
        if (!getAccountBankId) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({
                status: 'fail',
                message: 'Account Bank not found'
            });
        }

        const getUserId = await Personal.findOne({accountNumber: accountNumber}).select('user');
        if (!getUserId) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({
                status: 'fail',
                message: 'Account user id not found'
            });
        }
        
        // Update To account
        const updatedToAccount = await Account.findOneAndUpdate(
            { user: getUserId.user },
            { $inc: { AvailableFunds: +paymentFund } },
            { new: true }
        );

        if (!updatedToAccount) {
            throw new Error('Account not found or update failed');
        }

        // Create a new transaction
        const newTransactionPayment = await Transaction.create({
            user: getUserId.user,
            accountNumber,
            requestFund: paymentFund,
            bank: getAccountBankId._id,
            transactionType: result._id
        });


        

        res.status(HttpStatusCode.CREATED).json({
            status: 'success',
            data: {
                transaction: newTransactionPayment
            }
        });
    } catch (error) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
            status: 'fail',
            message: error.message
        });
    }
};


module.exports = {
    createPaymentTransaction,

};
