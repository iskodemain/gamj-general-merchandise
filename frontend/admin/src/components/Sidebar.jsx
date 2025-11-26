import React, { useContext } from "react";
import "./Sidebar.css";
import { assets } from "../assets/assets.js";
import { AdminContext } from "../context/AdminContextProvider.jsx";

function Sidebar({ currentView, onNavigate }) {
    const { setIsSidebarOpen, navigate } = useContext(AdminContext);

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
          onClick={() => {navigate("/overview"); setIsSidebarOpen((prev) => !prev)}}
        />
        <MenuItem
          icon={assets.products_icon}
          label="Products"
          active={currentView === "products"}
          onClick={() => {navigate("/products"); setIsSidebarOpen((prev) => !prev)}}
        />
        <MenuItem
          icon={assets.inventory_icon}
          label="Inventory"
          active={currentView === "inventory"}
          onClick={() => {navigate("/inventory"); setIsSidebarOpen((prev) => !prev)}}
        />
        <MenuItem
          icon={assets.orders_icon}
          label="Orders"
          active={currentView === "orders"}
          onClick={() => {navigate("/orders"); setIsSidebarOpen((prev) => !prev)}}
        />
        <MenuItem
          icon={assets.transaction_icon}
          label="Transactions"
          active={currentView === "transactions"}
          onClick={() => {navigate("/transactions"); setIsSidebarOpen((prev) => !prev)}}
        />
        <MenuItem
          icon={assets.staff_icon}
          label="User Management"
          active={currentView === "user management"}
          onClick={() => {navigate("/user-management"); setIsSidebarOpen((prev) => !prev)}}
        />
        <MenuItem
          icon={assets.reports_icon}
          label="Reports"
          active={currentView === "reports"}
          onClick={() => {navigate("/reports"); setIsSidebarOpen((prev) => !prev)}}
        />
        <MenuItem
          icon={assets.settings_icon}
          label="Settings"
          active={currentView === "settings"}
          onClick={() => {navigate("/settings"); setIsSidebarOpen((prev) => !prev)}}
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
