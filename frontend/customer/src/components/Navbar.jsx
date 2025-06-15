import { IoIosArrowBack } from "react-icons/io";
import React, {useState, useEffect, useRef, useContext} from 'react'
import {assets} from '../assets/assets.js'
import './Navbar.css'
import { NavLink, parsePath, useLocation } from 'react-router-dom'
import { ShopContext } from "../context/ShopContext.jsx";

function Navbar() {
  const [sidebar, setSideBar] = useState(false)
  const dropdownRef = useRef(null);
  const {setShowSearch, getCartCount, navigate, token, setToken, setCartItems, orderData} = useContext(ShopContext);
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
    const cartTextContent = cartQuantityElement.textContent;
    const cartLowValue = Number(cartTextContent);

    if (cartTextContent > 99999) {
      cartQuantityElement.style.height = "20px";
      cartQuantityElement.style.color = "white";
      cartQuantityElement.style.backgroundColor = "#fc9a9a";
      cartQuantityElement.textContent = "❗";
    }
    else if (cartLowValue > 9999) {
      if (Number(cartTextContent[4]) > 0) {
        cartQuantityElement.style.height = "24px";
        cartQuantityElement.textContent = cartTextContent.slice(0, 2) + "k+";
      }
      else {
        cartQuantityElement.style.height = "21px";
        cartQuantityElement.textContent = cartTextContent.slice(0, 2) + "k";
      }
    }
    else if (cartLowValue > 999) {
      if (Number(cartTextContent[3]) > 0) {
        cartQuantityElement.style.minHeight = "21px";
        cartQuantityElement.textContent = cartTextContent[0] + "k+";
      }
      else {
        cartQuantityElement.style.minHeight = "18px";
        cartQuantityElement.textContent = cartTextContent[0] + "k";
      }
    }
    else if (cartLowValue > 99) {
      cartQuantityElement.style.minHeight = "22px";
    }
    else {
      cartQuantityElement.style.minHeight = "18px";
    }
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
    <div className='navContainer ' >
      {/* LEFT */}
      <div className='mainLogo'>
        <NavLink to="/">
          <img src={assets.logo} className="angleLogo" alt="" draggable="false"/>
        </NavLink>
      </div>

      {/* RIGHT */}
      <div className='allButtons'>
        {isShopPath && <div onClick={() => setShowSearch(true)} className='sbutton bcontainer'>
          <img src={assets.search_icon} className="bImg linkImg" alt="" draggable="false"/>
        </div>} 
        <div className='lbutton bcontainer'>
            <img onClick={()=> token ? null : navigate('/login')} src={assets.profile_icon} className="lImg linkImg" alt="" draggable="false"/>
            {/* DROPDOWN MO SA NAVBAR */}
            {!token ? 
            <div className="dropdown">
              <div className="dropdown-content">
                <p onClick={()=>navigate('/orders')} className="dropdown-item">Orders</p>
                <p onClick={logout} className="dropdown-item">Logout</p>
              </div>
            </div> : 
            <div className="dropdown">
            <div className="dropdown-content">
              <p onClick={()=>navigate('/login')} className="dropdown-item">Login</p>
            </div>
          </div>
            }
        </div>
        <div className='cbutton bcontainer'>
          <NavLink to="/cart">
            <img src={assets.cart_icon} className="cImg linkImg" alt="" draggable="false"/>
            <p className="cart-quantity">{getCartCount()}</p>
          </NavLink>
        </div>
        <div className='mbutton bcontainer'>
          <NavLink to="#" className="menu-bars">
            <img src={assets.menu_icon} className=" mImg linkImg" alt="" onClick={showSidebar}/>
          </NavLink>
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
