import React, { useContext, useState } from "react";
import { assets } from "../assets/assets.js";
import "./Navbar.css";
import Sidebar from "./Sidebar.jsx";
import { AdminContext } from "../context/AdminContextProvider.jsx";
import { toast } from "react-toastify";

function Navbar() {
    const { isSidebarOpen, setIsSidebarOpen, setToken, toastSuccess, navigate } = useContext(AdminContext);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    const logout = () => {
      localStorage.removeItem('adminAuthToken');
      setToken('')

      navigate('/');
      toast.success("Logged out successfully", {...toastSuccess});
    }


  return (
    <div className="navbar-layout">
        {/* Sidebar (slides in/out) */}
        {isSidebarOpen && <Sidebar/>}
      {/* NAVBAR SECTION */}
      <div className="navbar-main">
        <div className="navbar-top-row">
            <div className="navbar-left">
            {/* Sidebar Toggle Button */}
            <button
              className={`navbar-sidebar-toggle ${isSidebarOpen ? "open" : ""}`}
              onClick={toggleSidebar}
              aria-label="Toggle Sidebar"
            >
              <span className="arrow"></span>
            </button>

            <span className="navbar-title">Overview</span>
          </div>

          <div className="navbar-icons">
            <img
              src={assets.notification_icon}
              alt="Notifications"
              className="navbar-icon"
            />
            <button onClick={() => logout()}><img src={assets.logout_icon} alt="Logout" className="navbar-icon"/></button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
