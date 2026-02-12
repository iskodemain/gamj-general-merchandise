import React, { useContext } from "react";
import "./Sidebar.css";
import { assets } from "../assets/assets.js";
import { AdminContext } from "../context/AdminContextProvider.jsx";

function Sidebar({ currentView }) {
    const { setIsSidebarOpen, navigate, adminProfileInfo, currentUser } = useContext(AdminContext);

  return (
    <aside className="sidebar">
      <div className="sidebar-header" onClick={() => {navigate("/profile"); setIsSidebarOpen(false)}}>

        <div className="sidebar-toggle-arrow" 
          onClick={(e) => {
            e.stopPropagation(); 
            setIsSidebarOpen((prev) => !prev);
          }}
        >
          <span className="arrow-head"></span>
        </div>
        
        <div className="sidebar-brand">
          <span className="sidebar-brand-title">{adminProfileInfo.userName}</span>
          <span className="sidebar-brand-role">{adminProfileInfo.userType}</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        <MenuItem
          icon={assets.overview_icon}
          label="Overview"
          active={currentView === "overview"}
          onClick={() => {navigate("/overview"); setIsSidebarOpen(false)}}
        />
        <MenuItem
          icon={assets.products_icon}
          label="Products"
          active={currentView === "products"}
          onClick={() => {navigate("/products"); setIsSidebarOpen(false);}}
        />
        <MenuItem
          icon={assets.inventory_icon}
          label="Inventory"
          active={currentView === "inventory"}
          onClick={() => {navigate("/inventory"); setIsSidebarOpen(false)}}
        />
        <MenuItem
          icon={assets.orders_icon}
          label="Orders"
          active={currentView === "orders"}
          onClick={() => {navigate("/orders"); setIsSidebarOpen(false);}}
        />
        <MenuItem
          icon={assets.transaction_icon}
          label="Transactions"
          active={currentView === "transactions"}
          onClick={() => {navigate("/transactions"); setIsSidebarOpen(false)}}
        />
        {
          ['Super Admin'].includes(currentUser) && 
          <MenuItem
            icon={assets.staff_icon}
            label="User Management"
            active={currentView === "user management"}
            onClick={() => {navigate("/user-management"); setIsSidebarOpen(false)}}
          />
        }
        {
          ['Super Admin', 'Admin'].includes(currentUser) &&
          <MenuItem
            icon={assets.dl_icon}
            label="Delivery Locations"
            active={currentView === "delivery locations"}
            onClick={() => {navigate("/delivery-locations"); setIsSidebarOpen(false)}}
          />
        }
        <MenuItem
          icon={assets.reports_icon}
          label="Reports"
          active={currentView === "reports"}
          onClick={() => {navigate("/reports"); setIsSidebarOpen(false)}}
        />

        {
          ['Super Admin'].includes(currentUser) && 
          <MenuItem
            icon={assets.settings_icon}
            label="Settings"
            active={currentView === "settings"}
            onClick={() => {navigate("/settings"); setIsSidebarOpen(false);}}
          />
        }
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
