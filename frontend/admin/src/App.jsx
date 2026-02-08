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
import Refund from "./components/Cancellation/Refund";
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
import MostStock from "./components/ProductMenu/MostStock";
import LowStock from "./components/ProductMenu/LowStock";
import Notification from "./pages/Notification.jsx";
import Overview from "./pages/Overview.jsx";
import { AdminContext } from "./context/AdminContextProvider.jsx";
import OutOfStock from "./components/ProductMenu/OutOfStock.jsx";
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
      <Route path="/overview" element={token ? <Overview/> : <Navigate to="/"/>} />
      <Route path="/pending" element={<Pending />} />
      <Route path="/view" element={<ViewAll />} />
      <Route path="/processing" element={<Processing />} />
      <Route path="/outfordelivery" element={<OutforDelivery />} />
      <Route path="/delivered" element={<Delivered />} />
      <Route path="/delivery-locations" element={<DeliveryLocations />} />
      <Route path="/delivery-locations/provinces" element={<Provinces />} />
      <Route path="/delivery-locations/cities" element={<Cities />} />
      <Route path="/delivery-locations/barangays" element={<Barangay />} />
      <Route path="/cancelorder" element={<CancelOrder />} />
      <Route path="/cancelreview" element={<CancelReview />} />
      <Route path="/return" element={<Refund />} />
      <Route path="/admincancel" element={<AdminCancel />} />
      <Route path="/customercancel" element={<CustomerCancel />} />
      <Route path="/returnandrefund" element={<ReturnAndRefund />} />
      <Route path="/unverifiedusers" element={<UnverifiedUsers />} />
      <Route path="/unverifiedcustomerreview" element={<UnverifiedCustomerReview />} />
      <Route path="/verifiedusers" element={<VerifiedUsers />} />
      <Route path="/verifiedcustomerview" element={<VerifiedCustomerView />} />
      <Route path="/verifiedstaffview" element={<VerifiedStaffView />} />
      <Route path="/unverifiedstaffview" element={<UnverifiedStaffView />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/addproduct" element={<AddProduct />} />
      <Route path="/products/updateproduct/:productId" element={<UpdateProduct />} />
      <Route path="/products/productcategory" element={<ProductCategory />} />
      <Route path="/products/totalproduct" element={<TotalProduct />} />
      <Route path="/products/moststock" element={<MostStock />} />
      <Route path="/products/lowstock" element={<LowStock />} />
      <Route path="/products/outofstock" element={<OutOfStock />} />
      <Route path="/notifications" element={<Notification />} />
      <Route path="/user-management" element={<UserManagement />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/activeorders" element={<ActiveOrders />} /> 
      <Route path="/reports" element={<Reports />} /> 
      <Route path="/transactions" element={<Transactions />} /> 
      <Route path="/transactions/order" element={<OrderTransactions />} /> 
      <Route path="/transactions/inventory" element={<InventoryTransactions />} /> 
      <Route path="/allusers" element={<AllUsers />} /> 
      <Route path="/rejectedusers" element={<RejectedUsers />} /> 
      <Route path="/addnewuser" element={<AddNewUser />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/inventory/list" element={<InventoryDashboard />} />
      <Route path="/inventory/add" element={<AddStock />} />
      <Route path="/inventory/batch" element={<BatchList />} />
    </Routes>
   </div>
  )
}

export default App
