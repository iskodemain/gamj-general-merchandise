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
import AllOrders from './components/AllOrders'
import DeliveryLocations from "./components/DeliveryLocations";
import Provinces from "./components/Locations/Provinces";
import Cities from "./components/Locations/Cities";
import Barangay from "./components/Locations/Barangay";
import CancelOrder from "./components/CancelOrder";
import CancelReason from "./components/Cancellation/CancelReason";
import CancelReview from "./components/Cancellation/CancelOrderReview";
import Refund from "./components/Cancellation/Refund";
import AdminCancel from "./components/Cancellation/AdminCancel";
import CustomerCancel from "./components/Cancellation/CustomerCancel";
import ReturnAndRefund from "./components/ReturnAndRefund";
import ReturnRefundAll from "./components/ReturnRefundAll";
import ReviewRefund from "./components/ReviewRefund";
import UnverifiedCustomer from "./components/VeriAndUnverified/UnverifiedCustomer";
import UnverifiedCustomerReview from "./components/VeriAndUnverified/UnverifiedCustomerReview";
import VerifiedCustomer from "./components/VeriAndUnverified/VerifiedCustomer";
import VerifiedCustomerView from "./components/VeriAndUnverified/VerifiedCustomerView";
import VerifiedStaff from "./components/VeriAndUnverified/VerifiedStaff";
import VerifiedStaffView from "./components/VeriAndUnverified/VerifiedStaffView";
import UnverifiedStaff from "./components/VeriAndUnverified/UnverifiedStaff";
import UnverifiedStaffView from "./components/VeriAndUnverified/UnverifiedStaffView";
import Profile from "./pages/Profile.jsx";
import Products from "./pages/Products.jsx";
import AddProduct from "./components/ProductMenu/AddProduct";
import ProductCategory from './components/ProductMenu/ProductCategory.jsx'
import TotalProduct from "./components/ProductMenu/TotalProduct";
import MostStock from "./components/ProductMenu/MostStock";
import LowStock from "./components/ProductMenu/LowStock";
import Staff from "./pages/Staff.jsx"
import Notification from "./pages/Notification.jsx";
import AllUser from "./components/AllUser";
import Overview from "./pages/Overview.jsx";
import { AdminContext } from "./context/AdminContextProvider.jsx";
import OutOfStock from "./components/ProductMenu/OutOfStock.jsx";
import Settings from "./pages/Settings.jsx";

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
      <Route path="/allorders" element={<AllOrders />} />
      <Route path="/locations" element={<DeliveryLocations />} />
      <Route path="/provinces" element={<Provinces />} />
      <Route path="/cities" element={<Cities />} />
      <Route path="/barangay" element={<Barangay />} />
      <Route path="/cancelorder" element={<CancelOrder />} />
      <Route path="/cancelreason" element={<CancelReason />} />
      <Route path="/cancelreview" element={<CancelReview />} />
      <Route path="/return" element={<Refund />} />
      <Route path="/admincancel" element={<AdminCancel />} />
      <Route path="/customercancel" element={<CustomerCancel />} />
      <Route path="/returnandrefund" element={<ReturnAndRefund />} />
      <Route path="/returnrefundall" element={<ReturnRefundAll />} />
      <Route path="/reviewrefund" element={<ReviewRefund />} />
      <Route path="/unverifiedcustomers" element={<UnverifiedCustomer />} />
      <Route path="/unverifiedcustomerreview" element={<UnverifiedCustomerReview />} />
      <Route path="/verifiedcustomers" element={<VerifiedCustomer />} />
      <Route path="/verifiedcustomerview" element={<VerifiedCustomerView />} />
      <Route path="/verifiedstaff" element={<VerifiedStaff />} />
      <Route path="/verifiedstaffview" element={<VerifiedStaffView />} />
      <Route path="/unverifiedstaff" element={<UnverifiedStaff />} />
      <Route path="/unverifiedstaffview" element={<UnverifiedStaffView />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/addproduct" element={<AddProduct />} />
      <Route path="/products/productcategory" element={<ProductCategory />} />
      <Route path="/products/totalproduct" element={<TotalProduct />} />
      <Route path="/products/moststock" element={<MostStock />} />
      <Route path="/products/lowstock" element={<LowStock />} />
      <Route path="/products/outofstock" element={<OutOfStock />} />
      <Route path="/staff" element={<Staff />} />
      <Route path="/notifications" element={<Notification />} />
      <Route path="/alluser" element={<AllUser />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
   </div>
  )
}

export default App
