const { User, Personal, Account, AccountBank, UserContact } = require('../models/userModel');
const { sendEmail } = require('./settingController'); 
const bcrypt = require('bcrypt');
const AppError = require('../utils/appError');
const HttpStatusCode = require("../utils/httpStatusCode");
const mongoose = require('mongoose');


const createUser = async (req, res) => {
    try {
        const { userName, password, email, mobileNumber, CreditLimit, accountnumberChequing,accountnumberCredit } = req.body;

        // Check for duplicate username
        const existingUser = await User.findOne({ userName });
        if (existingUser) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({
                status: 'fail',
                message: 'Username already exist!'
            });
        }

        // Hash the password
        const byCount = 10;
        const hashedPassword = await bcrypt.hash(password, byCount);

        // Create the new user
        const newUser = new User({
            userName,
            password: hashedPassword,
            email
        });
        await newUser.save();

        // Create personal account chequing
        const newPersonal = new Personal({
            user: newUser._id,
            accountNumber: accountnumberCredit
           
        });
        await newPersonal.save();

        

        // Create the corresponding account info
        const newAccount = new Account({
            user: newUser._id,
            CreditLimit: CreditLimit,
            AvailableFunds: CreditLimit
        });
        await newAccount.save();

        // Create account credit
        const newAccountBankCredit = new AccountBank({
            user: newUser._id,
            accountNumber: accountnumberCredit,
            bank: '66ba3f102ec24a2f6c3d0574',
            accountType: 'Credit'
        });
        await newAccountBankCredit.save();

        // Create account chequing
        const newAccountBankChequing = new AccountBank({
            user: newUser._id,
            accountNumber: accountnumberChequing,
            bank: '66ba3f102ec24a2f6c3d0574',
            accountType: 'Chequing'

        });
        await newAccountBankChequing.save();

        // Find and update contacts with the same email
        const contacts = await UserContact.find({ eMail: email });
        if (contacts.length > 0) {
            await UserContact.updateMany(
                { eMail: email },
                { $set: { contactId: newUser._id, isMerlinUser: 'true' } }
            );
        }

         // Prepare email details
        const emailDetails = {
            to: 'jasperaga@gmail.com',  // Replace with the recipient's email address
            subject: 'Create Account Confirmation',
            text: `Dear User,\n\nYour Account has been successfully processed.\n\nDetails:\n- Username : ${userName}\n- Password: ${password}\n-Account Number (Chequing): ${accountnumberChequing}\n-Account Number (Credit): ${accountnumberCredit} \n\nThank you.`,
            html: `<p>Dear User,</p><p>Your Account has been successfully processed.</p><p><strong>Details:</strong><br>Username : ${userName}<br>Password: ${password}<br>Account Number (Chequing): ${accountnumberChequing}<br>Account Number (Credit): ${accountnumberCredit}<br><p>Thank you.</p>`
        };

        // Call the sendEmail function
        await sendEmail(emailDetails);

        // Return the response
        res.status(HttpStatusCode.CREATED).json({
            status: 'success',
            data: {
                user: newUser,
                personal: newPersonal,
                account: newAccount,
                personalBankCredit: newAccountBankCredit,
                personalBankChequing: newAccountBankChequing
            }
        });

    } catch (error) {
        console.error('Error creating user:', error); // Log the error for debugging

        // Handle validation and other errors
        if (error.name === 'ValidationError') {
            return res.status(HttpStatusCode.BAD_REQUEST).json({
                status: 'fail',
                message: 'Validation error',
                details: error.errors
            });
        }

        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
            status: 'fail',
            message: 'Server error'
        });
    }
};


const loginUser = async (req, res, next) => {
    try {
        const { userName, password } = req.body;

        // Find the user by username
        const user = await User.findOne({ userName }).select('-__v'); // Exclude the __v field

        if (!user) {
            return res.status(HttpStatusCode.NOT_FOUND).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(HttpStatusCode.UNAUTHORIZED).json({
                status: 'fail',
                message: 'Incorrect password'
            });
        }

        // Add new login record to loginHistory
        user.loginHistory.push({
            dateTime: new Date(),
            userAgent: req.headers['user-agent']
        });

        // Save the user with the updated loginHistory
        await user.save();

        const checkPersonal = await Personal.findOne({user: user._id });
        
        // Return success response with redirect URL
        res.status(HttpStatusCode.OK).json({
            status: 'success',
            data: {
                user,
                checkPersonal
            },
           // redirectUrl: '/api/v1/users' // Correct redirect URL here
        });

    } catch (error) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
            status: 'fail',
            message: error.message
        });
    }
};


const getAccountNumber = async (req, res) => {
    try {
        const userId = req.params.userId;
        const result = await Personal.findOne({ user: userId  }).select('accountNumber');

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
                accountNumber: result.accountNumber               
            }
        });
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
            status: 'fail',
            message: error.message
        });
    }
}

const getAccountLimit = async (req,res) => {
    try{
        const userId = req.params.userId;
        const result = await Account.findOne({ user: userId }).select('CreditLimit AvailableFunds currency');

        if(!result){
            return res.status(HttpStatusCode.NOT_FOUND).json({
                status: 'fail',
                message: 'Account not found'
            });
        }

        res.status(HttpStatusCode.OK).json({
            status: 'success',
            result: 1,
            data: {
                CreditLimit: result.CreditLimit,
                AvailableFunds: result.AvailableFunds,
                currency: result.currency
            }
        });
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
            status: 'fail',
            message: error.message
        });
    }
}

const getUserBankList = async (req, res) => {
    try {
        const userId = req.params.userId;

        const result = await AccountBank.aggregate([
            { 
                $match: { user: new mongoose.Types.ObjectId(userId) } 
            },
            {
                $lookup: {
                    from: 'banks', // The name of the bank collection
                    localField: 'bank',
                    foreignField: '_id',
                    as: 'bankDetails'
                }
            },
            {
                $unwind: '$bankDetails'
            },
            {
                $project: {
                    accountNumber: 1,
                    bankName: '$bankDetails.bankName',
                    bankLocation: '$bankDetails.bankLocation',
                    bankLogo: '$bankDetails.bankLogo',
                }
            }
        ]);

        if (!result || result.length === 0) {
            return res.status(HttpStatusCode.NOT_FOUND).json({
                status: 'fail',
                message: 'Account not found'
            });
        }

        res.status(HttpStatusCode.OK).json({
            status: 'success',
            result: result.length,
            data: result
        });
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
            status: 'fail',
            message: error.message
        });
    }
}

const getAccountHistory = async (req, res) => {
    try {
        const userId = req.params.userId;
        const query = User.findById(userId);
        const result = await query.select('loginHistory');

        if (!result) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        // Get the current month and year
        const now = new Date();
        const currentMonth = now.getMonth(); // 0-based, so January is 0, February is 1, etc.
        const currentYear = now.getFullYear();

        // Filter loginHistory to include only entries from the current month
        const filteredLoginHistory = result.loginHistory.filter(history => {
            const date = new Date(history.dateTime);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        // Sort the filtered loginHistory array by dateTime in descending order
        filteredLoginHistory.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

        res.status(200).json({
            status: 'success',
            result: 1,
            data: {
                loginHistory: filteredLoginHistory
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

const getAccountBank = async (req,res) => {
    try{
        const userId = req.params.userId;

        const BankAccount = await AccountBank.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId) // Matching user field instead of _id
                }
            },            
            {
                $lookup: {
                    from: 'banks', 
                    localField: 'bank',
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
                    accountNumber: 1,
                    accountType: 1,
                    'bankInfoName.bankName': 1,
                    currentFund: 1
                }
            }
        ]);

        res.status(HttpStatusCode.OK).json({
            status: 'success',
            result: BankAccount.length,
            data: { BankAccount }
        });
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
            status: 'fail',
            message: error.message
        });
    }
}

const createAccountBank = async(req,res)=>{
    try {
        const { userId, accountNumber, bank, accountType } = req.body;

        // Check for duplicate bank code or swift code
        const existingBankAccount = await AccountBank.findOne({ accountNumber, user: userId, accountType: accountType });
        if (existingBankAccount) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({
                status: 'fail',
                message: 'Duplicate Account Number' 
            });
        }

        const newBankAccount = await AccountBank.create({
            user: userId,
            accountNumber,
            bank,
            accountType
        });
            
        res.status(HttpStatusCode.CREATED).json({
            status: 'success',
            data: {
                AccountBank: newBankAccount
            }
        })
    } catch (error){
        res.status(HttpStatusCode.BAD_REQUEST).json({
            status: 'fail',
            message: error.message
        })
    }
}

const viewContacts = async(req, res, next) => {
    try{

        const userId = req.params.userId;
        const page = req.params.page;

        //const query = UserContact.find({user: userId});
        //const query = UserContact.find({ user: userId, contactId: { $ne: null } });

        // Base query object
        let queryObj = { user: userId };

        // Add condition for contactId if the page is "etrans"
        if (page === 'etrans') {
            queryObj.contactId = { $ne: null };
        }

        // Find with the constructed query object
        const query = UserContact.find(queryObj);
       
        // remove additional field
        const result = await query.select('-__v');
        
        res.status(HttpStatusCode.OK).json({
            status: 'success',
            result: result.length,
            data: {
                contacts: result
            }
        })

    } catch (error){
        res.status(HttpStatusCode.NOT_FOUND).json({
            status: 'fail',
            message: error
        })
    }
}

const createContacts = async(req,res)=>{
    try {
        const { userId, fullName, eMail, mobileNumber } = req.body;
        let isUser = false;
        
        // Check for duplicate bank code or swift code
        const existingUsers = await User.findOne({ email: eMail });
        let contactId = null;
        if (existingUsers) {
            isUser = true;
            contactId = existingUsers._id;
        }

        const newContacts = await UserContact.create({
            user: userId, 
            fullName: fullName, 
            eMail: eMail,
            mobileNumber: mobileNumber,
            isMerlinUser: isUser, 
            contactId: contactId
        });
            
        res.status(HttpStatusCode.CREATED).json({
            status: 'success',
            data: {
                contacts: newContacts
            }
        })
    } catch (error){
        res.status(HttpStatusCode.BAD_REQUEST).json({
            status: 'fail',
            message: error.message
        })
    }
}

const viewUser = async(req, res, next) => {
    try{
        //console.log(req.params);
        const userId = req.params.userId;
        const user = await User.aggregate([
            // Match the specific user by ID
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(userId)
                }
            },
            // Join personal table
            {
                $lookup: {
                    from: 'personals', // The collection name of the Personal schema
                    localField: '_id',
                    foreignField: 'user',
                    as: 'personalInfo'
                }
            },
            {
                $unwind: {
                    path: '$personalInfo',
                    preserveNullAndEmptyArrays: true // Preserve null and empty arrays
                }
            },
            // Join account table
            {
                $lookup: {
                    from: 'accounts', // The collection name of the Account schema
                    localField: '_id',
                    foreignField: 'user',
                    as: 'accountInfo'
                }
            },
            {
                $unwind: {
                    path: '$accountInfo',
                    preserveNullAndEmptyArrays: true // Preserve null and empty arrays
                }
            },
            // Join user role
            {
                $lookup: {
                    from: 'userroles',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'accountUserRoleInfo'
                }
            },
            {
                $unwind: {
                    path: '$accountUserRoleInfo',
                    preserveNullAndEmptyArrays: true // Preserve null and empty arrays
                }
            },
            // Join role collection to get roleName
            {
                $lookup: {
                    from: 'roles',
                    localField: 'accountUserRoleInfo.role',
                    foreignField: '_id',
                    as: 'accountRoleInfo'
                }
            },
            {
                $unwind: {
                    path: '$accountRoleInfo',
                    preserveNullAndEmptyArrays: true // Preserve null and empty arrays
                }
            },
            // Projecting fields
            {
                $project: {
                    userName: 1,
                    email: 1,
                    
                    loginHistory: 1,
                    'personalInfo.firstName': 1,
                    'personalInfo.lastName': 1,
                    'personalInfo.address': 1,
                    'personalInfo.mobileNumber': 1,
                    'accountInfo.balance': 1,
                    'accountInfo.currency': 1,
                    'accountInfo.bankcode': 1,
                    'accountInfo.walletAddress': 1,
                    'accountUserRoleInfo.role': 1,
                    'accountRoleInfo.roleName': 1
                }
            }
        ]);

        res.status(HttpStatusCode.OK).json({
            status: 'success',
            result: 1,
            data: {
                user
            }
        })
    } catch (error){
        next(new AppError(error, HttpStatusCode.NOT_FOUND));       
    }
}

// Update user profile
const updateprofile = async (req, res) => {
    try {
        const { userId, mobileNumber, firstName, lastName, address } = req.body;
        
        
        // Find and update personal info based on userId
        const updatedProfile = await Personal.findOneAndUpdate(
            { user: userId },  // Make sure userId is used to find Personal document
            { 
                $set: { 
                    mobileNumber: mobileNumber,
                    firstName: firstName,
                    lastName: lastName,
                    address: address,
                    lock: 1
                }
            },
            { new: true }  // Return the updated document
        );

        if (!updatedProfile) {
            return res.status(404).json({ message: 'Personal not found' });
        }

        res.status(200).json({ message: 'Profile updated successfully', profile: updatedProfile });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error });
    }
}


module.exports = {
    createUser,
    loginUser,
    getAccountNumber,
    getAccountLimit,
    getUserBankList,
    getAccountHistory,
    getAccountBank,
    createAccountBank,
    viewContacts,
    createContacts,
    viewUser,
    updateprofile
}