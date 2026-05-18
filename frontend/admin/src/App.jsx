import React, { useContext } from "react";  
import {ToastContainer} from 'react-toastify'
import {Routes, Route, Navigate} from 'react-router-dom'
import './App.css'
import LoginAdmin from './pages/LoginAdmin.jsx'
import Verification from './components/Verification.jsx' // <-- Import Verification component
import Pending from './components/Pending.jsx' // <-- Import Pending component
import ViewAll from './components/ViewAll.jsx'
import Processing from './components/Processing.jsx'
import OutforDelivery from './components/OutforDelivery.jsx'
import Delivered from './components/Delivered.jsx'
import DeliveryLocations from "./components/DeliveryLocations.jsx";
import Provinces from "./components/Locations/Provinces.jsx";
import Cities from "./components/Locations/Cities.jsx";
import Barangay from "./components/Locations/Barangay.jsx";
import CancelOrder from "./components/CancelOrder.jsx";
import CancelReview from "./components/Cancellation/CancelOrderReview.jsx";
import AdminCancel from "./components/Cancellation/AdminCancel.jsx";
import CustomerCancel from "./components/Cancellation/CustomerCancel.jsx";
import ReturnAndRefund from "./components/ReturnAndRefund.jsx";
import UnverifiedUsers from "./components/VeriAndUnverified/UnverifiedUsers.jsx";
import UnverifiedCustomerReview from "./components/VeriAndUnverified/UnverifiedCustomerReview.jsx";
import VerifiedUsers from "./components/VeriAndUnverified/VerifiedUsers.jsx";
import VerifiedCustomerView from "./components/VeriAndUnverified/VerifiedCustomerView.jsx";
import VerifiedStaffView from "./components/VeriAndUnverified/VerifiedStaffView.jsx";
import UnverifiedStaffView from "./components/VeriAndUnverified/UnverifiedStaffView.jsx";
import Profile from "./pages/Profile.jsx";
import Products from "./pages/Products.jsx";
import AddProduct from "./components/ProductMenu/AddProduct.jsx";
import ProductCategory from './components/ProductMenu/ProductCategory.jsx'
import TotalProduct from "./components/ProductMenu/TotalProduct.jsx";

import Notification from "./pages/Notification.jsx";
import Overview from "./pages/Overview.jsx";
import { AdminContext } from "./context/AdminContextProvider.jsx";
import Settings from "./pages/Settings.jsx";
import UpdateProduct from "./components/ProductMenu/UpdateProduct.jsx";
import Orders from "./pages/Orders.jsx";
import ActiveOrders from "./pages/ActiveOrders.jsx";
import Reports from "./pages/Reports.jsx"
import Transactions from "./pages/Transactions.jsx"
import UserManagement from "./pages/UserManagement.jsx"
import AllUsers from "./components/AllUsers.jsx";
import RejectedUsers from "./components/VeriAndUnverified/RejectedUsers.jsx";
import AddNewUser from "./components/AddNewUser.jsx";
import Inventory from "./pages/Inventory.jsx";
import InventoryDashboard from "./components/Inventory/InventoryDashboard.jsx";
import AddStock from "./components/Inventory/AddStock.jsx";
import StockAdjustment from "./components/Inventory/StockAdjustment.jsx";
import BatchList from "./components/Inventory/BatchList.jsx";
import OrderTransactions from "./components/Transactions/OrderTransactions.jsx";
import InventoryTransactions from "./components/Transactions/InventoryTransactions.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ReturnRefundPolicy from "./pages/ReturnRefundPolicy.jsx";
import TermsAndConditions from "./pages/TermsAndConditions.jsx";
import StorePolicy from "./pages/StorePolicy.jsx";
import ShippingRates from "./components/ShippingRates.jsx";
import DeliverySettings from "./pages/DeliverySettings.jsx";

//components
// icon 

const App = () => {
  const { token, loginToken } = useContext(AdminContext);

  return (
   <div className='App'>
    
    <ToastContainer/>
    <Routes>
      <Route path="*" element={token ? <Navigate to="/overview" /> : <LoginAdmin />}/>
      <Route path="/" element={token ? <Navigate to="/overview" /> : <LoginAdmin />} />
      <Route path="/verify" element={token || !loginToken ? <Navigate to="/"/> : <Verification/>} />

      {/* ALL AUTHENTICATED USERS (Admin, Staff) */}
      <Route path="/overview" element={<ProtectedRoute allowedRoles={['Admin', 'Delivery Staff']}><Overview/></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute allowedRoles={['Admin', 'Delivery Staff']}><Notification /></ProtectedRoute>} />

      {/* ORDERS - ALL AUTHENTICATED USERS */}
      <Route path="/activeorders" element={<ProtectedRoute><ActiveOrders /></ProtectedRoute>} /> 
      <Route path="/outfordelivery" element={<ProtectedRoute><OutforDelivery /></ProtectedRoute>} />
      <Route path="/delivered" element={<ProtectedRoute><Delivered /></ProtectedRoute>} />

      <Route path="/orders" element={<ProtectedRoute allowedRoles={['Admin', 'Delivery Staff']}><Orders /></ProtectedRoute>} />
      <Route path="/pending" element={<ProtectedRoute allowedRoles={['Admin', 'Delivery Staff']}><Pending /></ProtectedRoute>} />
      <Route path="/processing" element={<ProtectedRoute allowedRoles={['Admin', 'Delivery Staff']}><Processing /></ProtectedRoute>} />
      <Route path="/cancelorder" element={<ProtectedRoute allowedRoles={['Admin']}><CancelOrder /></ProtectedRoute>} />
      <Route path="/returnandrefund" element={<ProtectedRoute allowedRoles={['Admin']}><ReturnAndRefund /></ProtectedRoute>} /> 
      {/* <Route path="/cancelreview" element={<ProtectedRoute allowedRoles={['Admin']}><CancelReview /></ProtectedRoute>} /> */}
      {/* <Route path="/admincancel" element={<ProtectedRoute allowedRoles={['Admin']}><AdminCancel /></ProtectedRoute>} /> PENDING */}
      {/* <Route path="/customercancel" element={<ProtectedRoute allowedRoles={['Admin']}><CustomerCancel /></ProtectedRoute>} /> PENDING */}
      {/* <Route path="/view" element={<ProtectedRoute><ViewAll allowedRoles={['Admin']}/></ProtectedRoute>} /> */}
      {/* PRODUCTS - ALL AUTHENTICATED USERS */}


      <Route path="/products" element={<ProtectedRoute allowedRoles={['Admin', 'Delivery Staff']}><Products /></ProtectedRoute>} />
      <Route path="/products/productcategory" element={<ProtectedRoute allowedRoles={['Admin', 'Delivery Staff']}><ProductCategory /></ProtectedRoute>} />
      <Route path="/products/totalproduct" element={<ProtectedRoute allowedRoles={['Admin', 'Delivery Staff']}><TotalProduct /></ProtectedRoute>} />

      {/* INVENTORY - ALL AUTHENTICATED USERS */}
       <Route path="/inventory" element={<ProtectedRoute allowedRoles={['Admin', 'Delivery Staff']}><Inventory /></ProtectedRoute>} />
      <Route path="/inventory/list" element={<ProtectedRoute allowedRoles={['Admin', 'Delivery Staff']}><InventoryDashboard /></ProtectedRoute>} />
      <Route path="/inventory/batch" element={<ProtectedRoute allowedRoles={['Admin', 'Delivery Staff']}><BatchList /></ProtectedRoute>} />

      {/* TRANSACTIONS - ALL AUTHENTICATED USERS */}
       <Route path="/transactions" element={<ProtectedRoute allowedRoles={['Admin', 'Delivery Staff']}><Transactions /></ProtectedRoute>} /> 
      <Route path="/transactions/order" element={<ProtectedRoute allowedRoles={['Admin', 'Delivery Staff']}><OrderTransactions /></ProtectedRoute>} /> 
      <Route path="/transactions/inventory" element={<ProtectedRoute allowedRoles={['Admin', 'Delivery Staff']}><InventoryTransactions /></ProtectedRoute>} /> 
      <Route path="/products/addproduct" element={<ProtectedRoute allowedRoles={['Admin', 'Delivery Staff']}><AddProduct /></ProtectedRoute>} />
      <Route path="/products/updateproduct/:productId" element={<ProtectedRoute allowedRoles={['Admin', 'Delivery Staff']}><UpdateProduct /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute allowedRoles={['Admin', 'Delivery Staff']}><Reports /></ProtectedRoute>} />

      {/* ADMIN ONLY - Staff CANNOT access */}
      <Route path="/inventory/add" element={
        <ProtectedRoute allowedRoles={['Admin', 'Delivery Staff']}>
          <AddStock />
        </ProtectedRoute>
      } />
      <Route path="/inventory/adjust" element={
        <ProtectedRoute allowedRoles={['Admin', 'Delivery Staff']}>
          <StockAdjustment />
        </ProtectedRoute>
      } />
      <Route path="/delivery-locations" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <DeliveryLocations />
        </ProtectedRoute>
      } />
      <Route path="/delivery-locations/provinces" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <Provinces />
        </ProtectedRoute>
      } />
      <Route path="/delivery-locations/cities" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <Cities />
        </ProtectedRoute>
      } />
      <Route path="/delivery-locations/barangays" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <Barangay />
        </ProtectedRoute>
      } />
      

      {/* ADMIN ONLY - Staff CANNOT access */}
      <Route path="/user-management" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <UserManagement />
        </ProtectedRoute>
      } />
      <Route path="/allusers" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <AllUsers />
        </ProtectedRoute>
      } /> 
      <Route path="/addnewuser" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <AddNewUser />
        </ProtectedRoute>
      } />
      <Route path="/verifiedusers" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <VerifiedUsers />
        </ProtectedRoute>
      } />
      <Route path="/unverifiedusers" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <UnverifiedUsers />
        </ProtectedRoute>
      } />
      <Route path="/verifiedcustomerview" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <VerifiedCustomerView />
        </ProtectedRoute>
      } />
      <Route path="/unverifiedcustomerreview" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <UnverifiedCustomerReview />
        </ProtectedRoute>
      } />
      <Route path="/verifiedstaffview" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <VerifiedStaffView />
        </ProtectedRoute>
      } />
      <Route path="/unverifiedstaffview" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <UnverifiedStaffView />
        </ProtectedRoute>
      } />
      <Route path="/rejectedusers" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <RejectedUsers />
        </ProtectedRoute>
      } /> 
      <Route path="/settings" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/return-refund-policy" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <ReturnRefundPolicy />
        </ProtectedRoute>
      } />
      <Route path="/terms-and-conditions" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <TermsAndConditions />
        </ProtectedRoute>
      } />
      <Route path="/store-policy" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <StorePolicy />
        </ProtectedRoute>
      } />
      <Route path="/shipping-rates" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <ShippingRates />
        </ProtectedRoute>
      } />
      <Route path="/delivery-settings" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <DeliverySettings />
        </ProtectedRoute>
      } />

    </Routes>
   </div>
  )
}

export default App
