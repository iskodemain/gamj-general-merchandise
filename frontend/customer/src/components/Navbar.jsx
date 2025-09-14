import React, {useState, useEffect, useRef, useContext} from 'react'
import { IoIosArrowBack } from "react-icons/io";
import { IoIosNotificationsOutline } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import { CiSearch } from "react-icons/ci";
import { toast } from "react-toastify";
import {assets} from '../assets/assets.js'
import './Navbar.css'
import { NavLink, useLocation } from 'react-router-dom'
import { ShopContext } from "../context/ShopContext.jsx";
import '../pages/Notification.css' // Import the notification styles

function Navbar() {
  const {setShowSearch, getCartCount, getWishlistCount, token, setToken, setCartItems, navigate, toastSuccess, nbProfileImage, setWishListItems, fetchVerifiedCustomer} = useContext(ShopContext);
  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();
  const [sidebar, setSideBar] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null)
  const profileRef = useRef(null);
  const location = useLocation() // Get the current location
  const isShopPath = location.pathname === "/shop"; // Check if the path is "/shop"

  useEffect(() => {
      if (token) {
        fetchVerifiedCustomer();
      }
    }, [location, token]);

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setCartItems([]);
    setWishListItems([])

    // REMOVE ORDER DATA ALSO
    navigate('/login');
    toast.success("Logged out successfully", {...toastSuccess});
  }
  
  const showSidebar = () => setSideBar(!sidebar)
  
  useEffect(() => {
    // const cartQuantityElement = document.querySelector(".cart-quantity");

    // // Only modify the cart quantity display if it is updated
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

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Add this useEffect to close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
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
        <div className='icon-button' ref={notifRef} style={{ position: 'relative' }}>
          {token && 
            <IoIosNotificationsOutline className="nav-icon notifcon" onClick={() => setShowNotifications((prev) => !prev)} style={{ cursor: 'pointer' }}/>
          }
          {showNotifications && (
            <div className="notification-container notification-dropdown">
              <h1 className="notification-title">Notifications</h1>
              <div className="notification-panel">
                <ul className="notification-list">
                  {[
                    { id: 1, action: 'place an order #254845', timestamp: '9 hours ago' },
                    { id: 2, action: 'edit email address', timestamp: '2 days ago' },
                    { id: 3, action: 'cancel order', timestamp: '3 days ago' },
                    { id: 4, action: 'order processing', timestamp: '5 days ago' },
                  ].map((notif) => (
                    <li className="notification-item" key={notif.id}>
                      <div className="notification-avatar">
                        <img
                          src="https://ui-avatars.com/api/?name=Medical+Hospital+Cavite&background=43A047&color=fff&rounded=true"
                          alt="avatar"
                        />
                      </div>
                      <div className="notification-content">
                        <span className="notification-name">
                          <b>Medical Hospital Cavite</b>
                        </span>
                        <span
                          className="notification-action"
                          dangerouslySetInnerHTML={{
                            __html: notif.action.replace(
                              /#\d+/g,
                              (match) =>
                                `<span class="action-highlight ${match.toLowerCase()}">${match}</span>`
                            ),
                          }}
                        />
                        <span className="notification-time">{notif.timestamp}</span>
                      </div>
                      <button
                        className="notification-dismiss"
                        onClick={() => {/* implement dismiss logic if needed */}}
                        aria-label="Dismiss"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                className="notification-all-btn"
                onClick={() => {
                  setShowNotifications(false);
                  navigate('/notification');
                }}
              >
                All Notifications
              </button>
            </div>
          )}
        </div>
        <div className='icon-button'>
          <NavLink to="/wishlist">
            <CiHeart className="nav-icon wishcon" />
            {wishlistCount > 0 && (
              <span className="wishlist-quantity">{wishlistCount}</span>
            )}
          </NavLink>
        </div>
        <div className='icon-button'>
          <NavLink to="/cart">
            <img src={assets.cart_icon} alt="Cart" draggable="false"/>
            {cartCount > 0 && (
              <span className="cart-quantity">{cartCount}</span>
              
            )}
          </NavLink>
        </div>
        <div className='icon-button' ref={profileRef} style={{ position: 'relative' }}>
          {nbProfileImage && token? 
            <div className='nav-profile-img'>
              <img onClick={() => setShowProfileDropdown((prev) => !prev)} src={nbProfileImage instanceof File || nbProfileImage instanceof Blob ? URL.createObjectURL(nbProfileImage) : nbProfileImage} alt="Profile" draggable="false" />
            </div> :

            <img
            className='nav-profile-none'
            onClick={() => setShowProfileDropdown((prev) => !prev)}
            src={assets.profile_icon}
            alt="Profile"
            draggable="false"
            style={{ cursor: 'pointer' }}

          />
          }
          {showProfileDropdown && (
            <div className="profile-dropdown">
              {token && (
                <>
                  <button className="profile-dropdown-item" onClick={() => { setShowProfileDropdown(false); navigate('/profile'); }}>My Profile</button>

                  <button className="profile-dropdown-item" onClick={() => { setShowProfileDropdown(false); navigate('/orders'); }}>Orders</button>
                </>
              )
              }

              {!token ? (
                <button className="profile-dropdown-item" onClick={() => { setShowProfileDropdown(false); navigate('/login'); }}>Login / Register</button>
              ) : (
                <button className="profile-dropdown-item logout" onClick={() => { setShowProfileDropdown(false); logout(); }}>Logout</button>
              )}
            </div>
          )}
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
          <li><NavLink to="/" onClick={showSidebar}>Home</NavLink></li>
          <li><NavLink to="/shop" onClick={showSidebar}>Shop</NavLink></li>
          <li><NavLink to="/about" onClick={showSidebar}>About</NavLink></li>
          {!token && 
            // <li className={`${orderData.length > 0 ? '' : 'hidden-orer'}`}>
            //   <NavLink to="/orders" onClick={showSidebar}>Orders</NavLink>
            // </li>
            <li>
              <NavLink to="/orders" onClick={showSidebar}>Orders</NavLink>
            </li>
          }
          <li><NavLink to="/wishlist" onClick={showSidebar}>Wishlist</NavLink></li>
          {token ?
            <li onClick={()=>{logout(); showSidebar();}}>Logout</li> : 
            <li onClick={()=>{navigate('/login'); showSidebar();}}><NavLink>Register / Sign In</NavLink></li>
          }
        </ul>
      </nav>
    </>
  )
}

export default Navbar
