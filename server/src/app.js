////////// WazApp Server ////////////
// Develop: Jasper Aga Camaña      // 
// Date Update: July 2024          //
// Project Deployed:               //
/////////////////////////////////////

const express = require("express");

const HttpStatusCode = require("./utils/httpStatusCode.js");
const { 
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
} = require('./controllers/userController.js');
const { 
    createTransaction, 
    getTransaction,
    getFunds,
    createSendeFund
} = require('./controllers/transactionController.js');
const { 
    createBankInstitution, 
    getAllBank, 
    createTransactionType,
    sendEmail 
} = require('./controllers/settingController.js');
const { createPaymentTransaction } = require('./controllers/bankingController.js');
const dotenv = require('dotenv');
const mongoose = require("mongoose");
const AppError = require('./utils/appError.js');
//const exphbs  = require('express-handlebars');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

// Set up Multer storage and file handling
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + file.originalname;
        cb(null, uniqueSuffix);
    }
});

const upload = multer({ storage: storage });


// configure env file location
dotenv.config({
    path: './.env'
})
// initialize express
const app = express();

app.use(express.static('public')); 
// inital json
app.use(express.json());

app.set('views', path.join(__dirname, 'views'));

// => route properties
app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
   });
  
   
  // Define a custom Handlebars helper function to format dates
//   const hbs = exphbs.create({
//     helpers: {
//          formatDateHistory: function (date) {
//           //console.log(date);
  
//           const datetimeParts = date.split("T");
//           const datesplit = datetimeParts[0]; 
//           const time = datetimeParts[1].slice(0, -5);        
//           let splitDate = datesplit.split("-");
//           let year = splitDate[0];
//           let month = splitDate[1];
//           let day = splitDate[2];
//           return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')} ${time}`;
//          },
//         formatDate: function(dateObj){
//           let year = dateObj.getFullYear();
//           let month = (dateObj.getMonth() + 1).toString();
//           let day = dateObj.getDate().toString();
//           return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
//         },
//         navLink: function(url, options){
//           return '<li' + 
//           ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
//           '><a href="' + url + '">' + options.fn(this) + '</a></li>';
//         },
//         safeHTML: function (context) {
//           return stripJs(context);
//         },
         
//     },
//     extname:".hbs",
//     runtimeOptions: {
//         allowProtoPropertiesByDefault: true,
//         allowProtoMethodsByDefault: true
//     }
//   });
  
// Register handlebars as the rendering engine for views
// app.engine(".hbs", hbs.engine);
// app.set("view engine", ".hbs");


app.use(bodyParser.urlencoded({ extended: false }));

///////////////// USERS /////////////////
// user registration
app.post('/api/v1/createuser', createUser); // done

// user login
app.post('/api/v1/login', loginUser); // done

// user account number
app.get(`/api/v1/getaccountnumber/:userId`,getAccountNumber);

// user account limit
app.get(`/api/v1/getaccountlimit/:userId`, getAccountLimit);

// user account bank list
app.get(`/api/v1/getuserbank/:userId`,getUserBankList);

// user login history
app.get(`/api/v1/getAccountHistory/:userId`,getAccountHistory);

// user get Account Bank
app.get(`/api/v1/getAccountBank/:userId`,getAccountBank);

// create account bank
app.post('/api/v1/CreateAccountBank',createAccountBank);

// View Account Contacts
app.get('/api/v1/viewContacts/:userId/:page?',viewContacts);

// create account contacts
app.post('/api/v1/createContacts',createContacts);

// view user profile
app.get('/api/v1/viewUser/:userId', viewUser); // done

// update profile
app.put('/api/v1/updateprofile/', updateprofile);

///////////////// TRANSACTION /////////////////

// create transaction loan
//app.post('/api/v1/loantransaction', upload.single('file'), createTransaction);
app.post('/api/v1/loantransaction', upload.single('image'), createTransaction);

// get all trasaction
app.get('/api/v1/getTransactionHistory/:userId',getTransaction);

// get account funds
app.get('/api/v1/getaccountfund/:userId', getFunds);

// create transfer transaction
app.post('/api/v1/createSendeTransfer',createSendeFund);

///////////////// PAYMENT /////////////////
// payment
app.post('/api/v1/PaymentTransaction', createPaymentTransaction);


///////////////// SETTINGS /////////////////
// create new bank institution
app.post('/api/v1/createBankInstitution', createBankInstitution);

// List all Bank
app.get('/api/v1/viewListBank', getAllBank);

// create transaction type
app.post('/api/v1/createTransactionType', createTransactionType);

// send email
app.post('/api/v1/sendemail', sendEmail);
///////////////// NON LINK /////////////////

// check if API does not exist
app.all('*',(req,res, next)=>{
    next(new AppError(`Can't find ${req.originalUrl} on this server`, HttpStatusCode.NOT_FOUND));
});

// handling error middleware
app.use((err, req, res, next) =>{
    err.statusCode = err.statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    })
});

// Setup the DB connection string 
const DB = process.env.MONGO_DB_CONNECTION.replace('<PASSWORD>', process.env.MONGO_DB_PASSWORD);
// connect to mongo DB
mongoose.connect(DB)
    .then(() => console.log('DB Connection successful!'))
    .catch(err=> console.log(err));

// initialize port
app.listen(process.env.DEFAULT_PORT, ()=>{
    console.log("Connected to server at 5000");
});