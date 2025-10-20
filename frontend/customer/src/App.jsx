import React, { useContext } from "react";
import {Routes, Route, Navigate} from 'react-router-dom'
import { ShopContext } from "./context/ShopContext.jsx";
// PAGES
import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Wishlist from './pages/Wishlist.jsx'
import Cart from './pages/Cart.jsx'
import Product from './pages/Product.jsx'
import Login from './pages/Login.jsx'
import PlaceOrder from './pages/PlaceOrder.jsx'
import Orders from './pages/Orders.jsx'
import Notification from './pages/Notification'
import { ToastContainer} from 'react-toastify';
import Profile from './pages/Profile';
import SignUp from "./pages/SignUp.jsx";

// COMPONENTS
import Navbar from "./components/Navbar.jsx";
import SearchBar from "./components/SearchBar.jsx";
import ForgotPassword from './components/ForgotPassword.jsx';
import ResetVerifyCode from './components/ResetVerifyCode.jsx';
import ResetPassword from './components/ResetPassword.jsx';
import LoginCodeVerification from "./components/LoginCodeVerification.jsx";

// CSS
import './App.css'

// ICON
import { IoIosArrowUp } from "react-icons/io";


const App = () => {
  const { token, loginToken, fpIdentifier, resetPasswordToken, orderItems } = useContext(ShopContext);
  const cannotResetPassword = token || !fpIdentifier || !resetPasswordToken;
  return(
    <div className="App">
      <button onClick={()=> window.scrollTo(0, 0)} className="up-scroll"><IoIosArrowUp className="arrow"/></button>
      <ToastContainer/>
      <Navbar/>
      <SearchBar/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/shop" element={<Shop/>}/>
        <Route path="/about" element={<About/>}/>
        <Route path="/contact" element={<Contact/>}/>
        <Route path="/wishlist" element={<Wishlist/>}/>
        <Route path="/cart" element={<Cart/>}/>
        <Route path="/product/:productId" element={<Product/>}/>
        <Route path="/login" element={token ? <Navigate to="/"/> : <Login/>}/>
        <Route path="/signup" element={token ? <Navigate to="/"/> : <SignUp/>}/>
        <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login"/> } />
        <Route path="/place-order" element={token ? (orderItems?.length > 0 ? <PlaceOrder /> : <Navigate to="/" />) : <Navigate to="/login" />}/>
        <Route path="/orders" element={token ? <Orders/> : <Navigate to="/login"/> }/>
        <Route path="/notification" element={token ? <Notification /> : <Navigate to="/login"/>} />
        <Route path="/login-verification" element={token || !loginToken ? <Navigate to="/"/> : <LoginCodeVerification/>}/>
        <Route path="/forgot-password" element={token ? <Navigate to="/"/> : <ForgotPassword/>}/>
        <Route path="/reset-verify-code" element={token || !fpIdentifier ? <Navigate to="/"/> : <ResetVerifyCode />}/>
        <Route path="/reset-password" element={cannotResetPassword ? <Navigate to="/"/> : <ResetPassword /> }/>
        <Route path="*" element={<Home/>}/>
      </Routes>
    </div>
)
}
export default App;