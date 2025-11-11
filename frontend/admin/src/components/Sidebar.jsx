import React, { useContext } from "react";
import "./Sidebar.css";
import { assets } from "../assets/assets.js";
import { AdminContext } from "../context/AdminContextProvider.jsx";
import { IoIosArrowDroprightCircle } from "react-icons/io";

function Sidebar({ currentView, onNavigate }) {
    const { setIsSidebarOpen } = useContext(AdminContext);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div
          className="sidebar-toggle-arrow"
          onClick={() => setIsSidebarOpen((prev) => !prev)}
        >
          <span className="arrow-head"></span>
        </div>
        <img
          src={assets.admin_gamj_logo}
          alt="Admin Logo"
          className="sidebar-logo"
        />
        <div className="sidebar-brand">
          <span className="sidebar-brand-title">GAMJ Merchandise</span>
          <span className="sidebar-brand-role">Admin</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        <MenuItem
          icon={assets.overview_icon}
          label="Overview"
          active={currentView === "overview"}
          onClick={() => onNavigate("/overview")}
        />
        <MenuItem
          icon={assets.profile_icon}
          label="Profile"
          active={currentView === "profile"}
          onClick={() => onNavigate("/profile")}
        />
        <MenuItem
          icon={assets.staff_icon}
          label="Staff"
          active={currentView === "staff"}
          onClick={() => onNavigate("/staff")}
        />
        <MenuItem
          icon={assets.notification_icon}
          label="Notifications"
          active={currentView === "notifications"}
          onClick={() => onNavigate("/notifications")}
        />
        <MenuItem
          icon={assets.gamj_shop_icon}
          label="GAMJ Shop"
          active={currentView === "gamjshop"}
          onClick={() => onNavigate("/gamjshop")}
        />
        <MenuItem
          icon={assets.products_icon}
          label="Products"
          active={currentView === "products"}
          onClick={() => onNavigate("/products")}
        />
      </nav>
    </aside>
  );
}

function MenuItem({ icon, label, active, onClick }) {
  return (
    <div
      className={`sidebar-item${active ? " active" : ""}`}
      onClick={onClick}
    >
      <img src={icon} alt={label} className="sidebar-item-icon" />
      <span className="sidebar-item-label">{label}</span>
    </div>
  );
}

export default Sidebar;
