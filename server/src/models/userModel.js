const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    userName: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    
    expiry: {
        type: Date
       // index: { expires: '7d' }
    },
    loginHistory: [ 
        { 
            dateTime: Date, 
            userAgent: String  
        } 
    ]
});

const personalSchema = new Schema({
    firstName: String,
    middleName: String,
    lastName: String,
    address: String,
    mobileNumber: {
        type: String,
        default: null
    },
    accountNumber: String,
    kycVerificationStatus: String,
    deviceToken: String,
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    lock: {
        default: 0,
        type: Number,
        enum: [0,1]
    }
});

const accountSchema = new Schema({
    CreditLimit: {
        type: Number
        // default: '1000000'
    },
    AvailableFunds: {
        type: Number
        // default: '1000000'
    },
    LoanFunds:{
        type: Number,
        default: '0'
    },
    currency: {
        type: String,
        default: 'CAD'
    },
    bankcode: String,
    //walletAddress: String,
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }
});

const userBankAccountSchema = new Schema({
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    accountNumber: {
        type: String,
        required: true
    },
    bank: { 
        type: Schema.Types.ObjectId, 
        ref: 'Bank', 
        required: true 
    },
    accountType: String,
    currentFund: {
        type: Number,
        default: '0'
    }
});

const userContactsSchema = new Schema ({
    user:{ 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    fullName: String,
    eMail: String,
    mobileNumber: String,
    isMerlinUser: Boolean, 
    contactId:{ 
        type: Schema.Types.ObjectId, 
        ref: 'User'
        //required: true 
    },
});


const User = mongoose.model('User', userSchema);
const Personal = mongoose.model('Personal', personalSchema);
const Account = mongoose.model('Account', accountSchema);
const AccountBank = mongoose.model('AccountBank', userBankAccountSchema);
const UserContact = mongoose.model('UserContact', userContactsSchema);

module.exports = {
    User,
    Personal,
    Account,
    AccountBank,
    UserContact
};