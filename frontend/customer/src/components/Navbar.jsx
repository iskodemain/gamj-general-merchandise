import { IoIosArrowBack } from "react-icons/io";
import { IoIosNotificationsOutline } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import { CiSearch } from "react-icons/ci";

import React, {useState, useEffect, useRef, useContext} from 'react'
import {assets} from '../assets/assets.js'
import './Navbar.css'
import { NavLink, parsePath, useLocation } from 'react-router-dom'
import { ShopContext } from "../context/ShopContext.jsx";

function Navbar() {
  const [sidebar, setSideBar] = useState(false)
  const dropdownRef = useRef(null);
  const {setShowSearch, getCartCount, getWishlistCount, navigate, token, setToken, setCartItems, orderData} = useContext(ShopContext);
  const location = useLocation() // Get the current location
  const isShopPath = location.pathname === "/shop"; // Check if the path is "/shop"



  const logout = () => {
    navigate('/login')
    localStorage.removeItem('token')
    setToken('');
    setCartItems({})
  }

  const showSidebar = () => setSideBar(!sidebar)
  
  useEffect(() => {
    const cartQuantityElement = document.querySelector(".cart-quantity");

    // Only modify the cart quantity display if it is updated
    // const cartTextContent = cartQuantityElement.textContent;
    // const cartLowValue = Number(cartTextContent);

    // if (cartTextContent > 99999) {
    //   cartQuantityElement.style.height = "20px";
    //   cartQuantityElement.style.color = "white";
    //   cartQuantityElement.style.backgroundColor = "#fc9a9a";
    //   cartQuantityElement.textContent = "❗";
    // }
    // else if (cartLowValue > 9999) {
    //   if (Number(cartTextContent[4]) > 0) {
    //     cartQuantityElement.style.height = "24px";
    //     cartQuantityElement.textContent = cartTextContent.slice(0, 2) + "k+";
    //   }
    //   else {
    //     cartQuantityElement.style.height = "21px";
    //     cartQuantityElement.textContent = cartTextContent.slice(0, 2) + "k";
    //   }
    // }
    // else if (cartLowValue > 999) {
    //   if (Number(cartTextContent[3]) > 0) {
    //     cartQuantityElement.style.minHeight = "21px";
    //     cartQuantityElement.textContent = cartTextContent[0] + "k+";
    //   }
    //   else {
    //     cartQuantityElement.style.minHeight = "18px";
    //     cartQuantityElement.textContent = cartTextContent[0] + "k";
    //   }
    // }
    // else if (cartLowValue > 99) {
    //   cartQuantityElement.style.minHeight = "22px";
    // }
    // else {
    //   cartQuantityElement.style.minHeight = "18px";
    // }
  }, [getCartCount]);
  
  // CLOSE CLICK OUTSIDE
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSideBar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  
  return (
    <>
    <div className='navContainer'>
      {/* LEFT - Logo */}
      <div className='mainLogo'>
        <NavLink to="/">
          <img src={assets.logo} className="gamjLogo" alt="" draggable="false"/>
        </NavLink>
      </div>

      {/* CENTER - Navigation Links */}
      <div className='nav-links'>
        <NavLink to="/" className="nav-link">Home</NavLink>
        <NavLink to="/shop" className="nav-link">Shop</NavLink>
        <NavLink to="/about" className="nav-link">About</NavLink>
        <NavLink to="/contact" className="nav-link">Contact</NavLink>
      </div>

      {/* RIGHT - Icons */}
      <div className='nav-icons'>
        {isShopPath && (
          <div onClick={() => setShowSearch(true)} className='icon-button'>
            <CiSearch className="nav-icon searchcon"/>
          </div>
        )}
        <div className='icon-button'>
          <IoIosNotificationsOutline className="nav-icon notifcon" />
          
        </div>
        <div className='icon-button'>
          <NavLink to="/wishlist">
            <CiHeart className="nav-icon wishcon" />
            {getWishlistCount() > 0 && (
              <span className="wishlist-quantity">{getWishlistCount()}</span>
            )}
            {/* <span className="wishlist-quantity">{getWishlistCount(1)}</span> */}
          </NavLink>
        </div>
        <div className='icon-button'>
          <NavLink to="/cart">
            <img src={assets.cart_icon} alt="Cart" draggable="false"/>
            {getCartCount() > 0 && (
              <span className="cart-quantity">{getCartCount()}</span>
            )}
            {/* <span className="cart-quantity">{getCartCount(1)}</span> */}
          </NavLink>
        </div>
        <div className='icon-button'>
          <img 
            onClick={() => token ? null : navigate('/login')} 
            src={assets.profile_icon} 
            alt="Profile" 
            draggable="false"
          />
        </div>
      </div>
    </div>
    <nav className={sidebar ? 'nav-menu active' : 'nav-menu'} ref={dropdownRef}>
        <ul className='nav-menu-items'>
          <li className="navbar-toggle">
            <NavLink to="#" className="menu-bars" onClick={showSidebar} >
              <IoIosArrowBack />
            </NavLink>
          </li>
          <li><NavLink to="/" onClick={() => {showSidebar(); }}>Home</NavLink></li>
          <li><NavLink to="/shop" onClick={() => {showSidebar(); }}>Shop</NavLink></li>
          <li><NavLink to="/about" onClick={() => {showSidebar(); }}>About</NavLink></li>
          {!token && 
            <li onClick={()=>{navigate('/orders'); showSidebar();}} className={`${orderData.length > 0 ? '' : 'hidden-orer'}`}><NavLink>Orders</NavLink></li>
          }
          <li><NavLink to="/wishlist" onClick={() => {showSidebar(); }}>Wishlist</NavLink></li>
          {token ?
            <li onClick={()=>{logout(); showSidebar();}}><NavLink>Logout</NavLink></li> : <li onClick={()=>{navigate('/login'); showSidebar();}}><NavLink>Register / Sign In</NavLink></li>
          }
        </ul>
      </nav>
    </>
  )
}

export default Navbar
