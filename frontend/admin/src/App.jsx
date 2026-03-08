import React, { useContext } from "react";  
import {ToastContainer} from 'react-toastify'
import {Routes, Route, Navigate} from 'react-router-dom'
import './App.css'
import LoginAdmin from './pages/LoginAdmin'
import Verification from './components/Verification' // <-- Import Verification component
import Pending from './components/Pending' // <-- Import Pending component
import ViewAll from './components/ViewAll'
import Processing from './components/Processing'
import OutforDelivery from './components/OutforDelivery'
import Delivered from './components/Delivered'
import DeliveryLocations from "./components/DeliveryLocations";
import Provinces from "./components/Locations/Provinces";
import Cities from "./components/Locations/Cities";
import Barangay from "./components/Locations/Barangay";
import CancelOrder from "./components/CancelOrder";
import CancelReview from "./components/Cancellation/CancelOrderReview";
import AdminCancel from "./components/Cancellation/AdminCancel";
import CustomerCancel from "./components/Cancellation/CustomerCancel";
import ReturnAndRefund from "./components/ReturnAndRefund";
import UnverifiedUsers from "./components/VeriAndUnverified/UnverifiedUsers.jsx";
import UnverifiedCustomerReview from "./components/VeriAndUnverified/UnverifiedCustomerReview";
import VerifiedUsers from "./components/VeriAndUnverified/VerifiedUsers.jsx";
import VerifiedCustomerView from "./components/VeriAndUnverified/VerifiedCustomerView";
import VerifiedStaffView from "./components/VeriAndUnverified/VerifiedStaffView";
import UnverifiedStaffView from "./components/VeriAndUnverified/UnverifiedStaffView";
import Profile from "./pages/Profile.jsx";
import Products from "./pages/Products.jsx";
import AddProduct from "./components/ProductMenu/AddProduct";
import ProductCategory from './components/ProductMenu/ProductCategory.jsx'
import TotalProduct from "./components/ProductMenu/TotalProduct";

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
import BatchList from "./components/Inventory/BatchList.jsx";
import OrderTransactions from "./components/Transactions/OrderTransactions.jsx";
import InventoryTransactions from "./components/Transactions/InventoryTransactions.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ReturnRefundPolicy from "./pages/ReturnRefundPolicy.jsx";
import TermsAndConditions from "./pages/TermsAndConditions.jsx";
import StorePolicy from "./pages/StorePolicy.jsx";

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

      {/* ALL AUTHENTICATED USERS (Super Admin, Admin, Staff) */}
      <Route path="/overview" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Staff']}><Overview/></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Staff']}><Notification /></ProtectedRoute>} />

      {/* ORDERS - ALL AUTHENTICATED USERS */}
      <Route path="/orders" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Staff']}><Orders /></ProtectedRoute>} />
      <Route path="/activeorders" element={<ProtectedRoute><ActiveOrders /></ProtectedRoute>} /> 
      <Route path="/pending" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Staff']}><Pending /></ProtectedRoute>} />
      {/* <Route path="/view" element={<ProtectedRoute><ViewAll allowedRoles={['Super Admin', 'Admin', 'Staff']}/></ProtectedRoute>} /> */}
      <Route path="/processing" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Staff']}><Processing /></ProtectedRoute>} />
      <Route path="/outfordelivery" element={<ProtectedRoute><OutforDelivery /></ProtectedRoute>} />
      <Route path="/delivered" element={<ProtectedRoute><Delivered /></ProtectedRoute>} />
      <Route path="/cancelorder" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Staff']}><CancelOrder /></ProtectedRoute>} />
      <Route path="/cancelreview" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Staff']}><CancelReview /></ProtectedRoute>} /> {/* PENDING */}
      <Route path="/admincancel" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Staff']}><AdminCancel /></ProtectedRoute>} /> {/* PENDING */}
      <Route path="/customercancel" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Staff']}><CustomerCancel /></ProtectedRoute>} /> {/* PENDING */}
      <Route path="/returnandrefund" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Staff']}><ReturnAndRefund /></ProtectedRoute>} /> {/* PENDING */}

      {/* PRODUCTS - ALL AUTHENTICATED USERS */}
      <Route path="/products" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Staff']}><Products /></ProtectedRoute>} />
      <Route path="/products/productcategory" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Staff']}><ProductCategory /></ProtectedRoute>} />
      <Route path="/products/totalproduct" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Staff']}><TotalProduct /></ProtectedRoute>} />

      {/* INVENTORY - ALL AUTHENTICATED USERS */}
      <Route path="/inventory" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Staff']}><Inventory /></ProtectedRoute>} />
      <Route path="/inventory/list" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Staff']}><InventoryDashboard /></ProtectedRoute>} />
      <Route path="/inventory/batch" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Staff']}><BatchList /></ProtectedRoute>} />

      {/* TRANSACTIONS - ALL AUTHENTICATED USERS */}
      <Route path="/transactions" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Staff']}><Transactions /></ProtectedRoute>} /> 
      <Route path="/transactions/order" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Staff']}><OrderTransactions /></ProtectedRoute>} /> 
      <Route path="/transactions/inventory" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Staff']}><InventoryTransactions /></ProtectedRoute>} /> 
      <Route path="/products/addproduct" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Staff']}><AddProduct /></ProtectedRoute>} />
      <Route path="/products/updateproduct/:productId" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Staff']}><UpdateProduct /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Staff']}><Reports /></ProtectedRoute>} />

      {/* SUPER ADMIN & ADMIN ONLY - Staff CANNOT access */}
      <Route path="/inventory/add" element={
        <ProtectedRoute allowedRoles={['Super Admin', 'Admin']}>
          <AddStock />
        </ProtectedRoute>
      } />
      <Route path="/delivery-locations" element={
        <ProtectedRoute allowedRoles={['Super Admin', 'Admin']}>
          <DeliveryLocations />
        </ProtectedRoute>
      } />
      <Route path="/delivery-locations/provinces" element={
        <ProtectedRoute allowedRoles={['Super Admin', 'Admin']}>
          <Provinces />
        </ProtectedRoute>
      } />
      <Route path="/delivery-locations/cities" element={
        <ProtectedRoute allowedRoles={['Super Admin', 'Admin']}>
          <Cities />
        </ProtectedRoute>
      } />
      <Route path="/delivery-locations/barangays" element={
        <ProtectedRoute allowedRoles={['Super Admin', 'Admin']}>
          <Barangay />
        </ProtectedRoute>
      } />
      

      {/* SUPER ADMIN ONLY - Admin & Staff CANNOT access */}
      <Route path="/user-management" element={
        <ProtectedRoute allowedRoles={['Super Admin']}>
          <UserManagement />
        </ProtectedRoute>
      } />
      <Route path="/allusers" element={
        <ProtectedRoute allowedRoles={['Super Admin']}>
          <AllUsers />
        </ProtectedRoute>
      } /> 
      <Route path="/addnewuser" element={
        <ProtectedRoute allowedRoles={['Super Admin']}>
          <AddNewUser />
        </ProtectedRoute>
      } />
      <Route path="/verifiedusers" element={
        <ProtectedRoute allowedRoles={['Super Admin']}>
          <VerifiedUsers />
        </ProtectedRoute>
      } />
      <Route path="/unverifiedusers" element={
        <ProtectedRoute allowedRoles={['Super Admin']}>
          <UnverifiedUsers />
        </ProtectedRoute>
      } />
      <Route path="/verifiedcustomerview" element={
        <ProtectedRoute allowedRoles={['Super Admin']}>
          <VerifiedCustomerView />
        </ProtectedRoute>
      } />
      <Route path="/unverifiedcustomerreview" element={
        <ProtectedRoute allowedRoles={['Super Admin']}>
          <UnverifiedCustomerReview />
        </ProtectedRoute>
      } />
      <Route path="/verifiedstaffview" element={
        <ProtectedRoute allowedRoles={['Super Admin']}>
          <VerifiedStaffView />
        </ProtectedRoute>
      } />
      <Route path="/unverifiedstaffview" element={
        <ProtectedRoute allowedRoles={['Super Admin']}>
          <UnverifiedStaffView />
        </ProtectedRoute>
      } />
      <Route path="/rejectedusers" element={
        <ProtectedRoute allowedRoles={['Super Admin']}>
          <RejectedUsers />
        </ProtectedRoute>
      } /> 
      <Route path="/settings" element={
        <ProtectedRoute allowedRoles={['Super Admin']}>
          <Settings />
        </ProtectedRoute>
      } />

      <Route path="/return-refund-policy" element={
        <ProtectedRoute allowedRoles={['Super Admin']}>
          <ReturnRefundPolicy />
        </ProtectedRoute>
      } />

      <Route path="/terms-and-conditions" element={
        <ProtectedRoute allowedRoles={['Super Admin']}>
          <TermsAndConditions />
        </ProtectedRoute>
      } />

      <Route path="/store-policy" element={
        <ProtectedRoute allowedRoles={['Super Admin']}>
          <StorePolicy />
        </ProtectedRoute>
      } />

    </Routes>
   </div>
  )
}

export default App
