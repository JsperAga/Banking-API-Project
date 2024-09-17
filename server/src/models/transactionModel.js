const mongoose = require('mongoose');
const { Schema } = mongoose;




const transactionSchema = new Schema({
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },    
    accountNumber: {
        type: String,
        required: true
    },
    requestFund: {
        type: Number,
        required: true
    },
    bank: { 
        type: Schema.Types.ObjectId, 
        ref: 'AccountBank', 
        //required: true 
    },
    image: {
        type: Schema.Types.ObjectId, 
        ref: 'Image', 
        //required: true 
    },
    dateTime: {
        type: Date,
        default: Date.now
    },
    transactionType: {
        type: Schema.Types.ObjectId, 
        ref: 'TransactionType', 
        required: true 
    }

});

const imageSchema = new Schema({
    originalName: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

const tractionTypeSchema = new Schema({
    type: String,
    status: String
});


const Transaction = mongoose.model('Transaction', transactionSchema);
const Image = mongoose.model('Image', imageSchema);
const TransactionType = mongoose.model('TransactionType', tractionTypeSchema);

module.exports = {
    Transaction,
    Image,
    TransactionType
};