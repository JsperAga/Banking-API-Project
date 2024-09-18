////////// WazApp Client ////////////
// Develop: Jasper Aga Camaña      // 
// Date Update: July 2024          //
// Project Deployed:               //
/////////////////////////////////////
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import withAuth from './component/withAuth';
import Menus from './component/Menu';
import Login from './component/Login';
import Welcome from './component/welcome';
import Breadcrumb from './component/BreadCrumb';
import RequestFund from './component/transaction/RequestFund';
import RequestHistory from './component/transaction/RequestHistory';
import BankList from './component/setting/BankList';
import AddBank from './component/setting/AddBank';
import LoginHistory from './component/account/LoginHistory';
import AccountBank from './component/account/AccountBank';
import AddAccountBank from './component/account/AddAccountBank';
import Contacts from './component/account/Contacts';
import AddContacts from './component/account/AddContacts';
import TransferFund from './component/transaction/SendeTransact';
import Profile from './component/account/Profile';

import './App.css'; // Adjust the path as needed

function App() {
  const user = JSON.parse(sessionStorage.getItem('user'));

  return (
    <Router>
      <div>
        <Menus />  
        <div className="breadcrumb-wrapper">
          <Breadcrumb />
        </div> 
        <Routes>
          {/* Request Fund */}
          <Route path="/requestfund" element={<RouteWithAuth component={RequestFund} />} /> 
          <Route path="/transferfund" element={<RouteWithAuth component={TransferFund} />} /> 
          <Route path="/transactionhistory" element={<RouteWithAuth component={RequestHistory} />} /> 

          {/* Settings */}
          <Route path="/banks" element={<RouteWithAuth component={BankList} />} />
          <Route path="/addbank" element={<RouteWithAuth component={AddBank} />} />

           {/* Account */}
          <Route path="/history" element={<RouteWithAuth component={LoginHistory} />} />
          <Route path="/profile" element={<RouteWithAuth component={Profile} />} />
          <Route path="/accountbank" element={<RouteWithAuth component={AccountBank} />} />
          <Route path="/contacts" element={<RouteWithAuth component={Contacts} />} />
          <Route path="/addcontacts" element={<RouteWithAuth component={AddContacts} />} />
          
          <Route path="/addaccountbank" element={<RouteWithAuth component={AddAccountBank} />} />

          {/* Welcome */}
          <Route path="/welcome" element={<RouteWithAuth component={Welcome} />} />
          {/* Users Registration */}
          <Route path="/login" element={<Login />} />
          {/* Blank Route */}
          <Route
            path="/"
            element={
              // create a condition, to check if users exist
              user ? (
                <RouteWithAuth component={Welcome} />
              ) : (
                <Login />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

const RouteWithAuth = withAuth(({ component: Component, ...rest }) => {
  return <Component {...rest} />;
});

export default App;
