const mongoose = require('mongoose');
const { Schema } = mongoose;

const bankSchema = new Schema({
    bankSwiftCode: {
        type: String,
        unique: true,
        required: true
    },
    bankName: {
        type: String,
        required: true
    },
    bankLocation: {
        type: String,
        required: true
    },
    bankLogo: String
    
});


const Bank = mongoose.model('Bank', bankSchema);

module.exports = {
    Bank    
};