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
  const {setShowSearch, getCartCount, getWishlistCount, token, setToken, setCartItems, navigate, toastSuccess, nbProfileImage, setWishListItems, fetchVerifiedCustomer, fetchNotifications, readNotification, settingsData} = useContext(ShopContext);
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

  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (fetchNotifications && fetchNotifications.length > 0) {
      const hasUnreadNotif = fetchNotifications.some((notif) => !notif.isRead);
      setHasUnread(hasUnreadNotif);
    } else {
      setHasUnread(false);
    }
  }, [fetchNotifications]);

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

  const handleReadNotification = async () => {
    // LATER THIS LOGIC
    await readNotification();
    setHasUnread(false);
    setShowNotifications(false);
    navigate("/notification");
  }

  const businessLogo = settingsData && settingsData.length > 0 ? settingsData[0].businessLogo : assets.logo;
  const businessName = settingsData && settingsData.length > 0 ? settingsData[0].businessName : "Default Business Name";

  
  return (
    <>
    <div className='navContainer'>
      <div className="mainLogo">
        <NavLink to="/" className="mainLogo-link">
          <img 
            src={businessLogo} 
            className="mainLogo-img" 
            alt="Logo"
            draggable="false"
          />
          <p className="mainLogo-text">{businessName}</p>
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

        {/* NOTIFICATION */}
        <div className="icon-button" ref={notifRef} style={{ position: 'relative' }}>
          {token && (
            <>
              <IoIosNotificationsOutline
                className="nav-icon notifcon"
                onClick={() => setShowNotifications((prev) => !prev)}
                style={{ cursor: 'pointer' }}
              />

              {hasUnread && <span className="notif-dot"></span>}

              {showNotifications && (
                <div className="navbarNotif-dropdown">
                  <h3 className="navbarNotif-title">Notification</h3>

                  <div className="navbarNotif-list">
                    {fetchNotifications?.length > 0 ? (
                      [...fetchNotifications].sort((a, b) => new Date(b.createAt) - new Date(a.createAt)).slice(0, 6).map((notif) => (
                        <div key={notif.ID} onClick={() => handleReadNotification()} className="navbarNotif-item">
                          <div className="navbarNotif-avatar">
                            <img src={assets.notification_icon} alt="avatar" />
                            {!notif.isRead && <span className="navbarNotif-dot"></span>}
                          </div>
                          <div className="navbarNotif-info">
                            <p className="navbarNotif-text">
                              <strong>{notif.title}</strong>{" "}
                              <span className={`navbarNotif-action ${notif.isRead ? "read" : "unread"}`}>
                                {notif.message}
                              </span>
                            </p>
                            <p className="navbarNotif-time">
                              {new Date(notif.createAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}{" "}
                              ago
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="navbarNotif-empty">
                        <p>No notifications available</p>
                      </div>
                    )}
                  </div>

                  <button className="navbarNotif-viewAll" onClick={() => handleReadNotification()}>All Notification</button>
                </div>
              )}
            </>
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

        {/* BURGER MENU ICON (Visible only on mobile) */}
        <div className="burger-menu" onClick={showSidebar}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
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
          {token && (
            <li><NavLink to="/orders" onClick={showSidebar}>Orders</NavLink></li>
          )}
          <li><NavLink to="/cart" onClick={showSidebar}>Cart</NavLink></li>
          {token && (
            <li><NavLink to="/profile" onClick={showSidebar}>Profile</NavLink></li>
          )}
          {token && (
            <li><NavLink to="/notification" onClick={showSidebar}>Notifications</NavLink></li>
          )}
          <li><NavLink to="/wishlist" onClick={showSidebar}>Wishlist</NavLink></li>
          {token ? (
            <li><NavLink to="/" onClick={(e) => { e.preventDefault(); logout(); showSidebar(); }}>Logout</NavLink></li>
          ) : (
            <li>
              <NavLink to="/login" onClick={showSidebar}>Register / Sign In</NavLink>
            </li>
          )}
        </ul>
      </nav>
    </>
  )
}

export default Navbar
