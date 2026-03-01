import React, { useContext } from "react";
import "./Sidebar.css";
import { assets } from "../assets/assets.js";
import { AdminContext } from "../context/AdminContextProvider.jsx";

function Sidebar({ currentView }) {
    const { setIsSidebarOpen, adminProfileInfo, currentUser } = useContext(AdminContext);

  return (
    <aside className="sidebar">
      <div className="sidebar-header" onClick={() => {window.location.href = "/profile"; setIsSidebarOpen(false)}}>

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
          onClick={() => {window.location.href = "/overview"; setIsSidebarOpen(false)}}
        />
        <MenuItem
          icon={assets.products_icon}
          label="Products"
          active={currentView === "products"}
          onClick={() => {window.location.href = "/products"; setIsSidebarOpen(false);}}
        />
        <MenuItem
          icon={assets.inventory_icon}
          label="Inventory"
          active={currentView === "inventory"}
          onClick={() => {window.location.href = "/inventory"; setIsSidebarOpen(false)}}
        />
        <MenuItem
          icon={assets.orders_icon}
          label="Orders"
          active={currentView === "orders"}
          onClick={() => {window.location.href = "/orders"; setIsSidebarOpen(false);}}
        />
        <MenuItem
          icon={assets.transaction_icon}
          label="Transactions"
          active={currentView === "transactions"}
          onClick={() => {window.location.href = "/transactions"; setIsSidebarOpen(false)}}
        />
        {
          ['Super Admin'].includes(currentUser) && 
          <MenuItem
            icon={assets.staff_icon}
            label="User Management"
            active={currentView === "user management"}
            onClick={() => {window.location.href = "/user-management"; setIsSidebarOpen(false)}}
          />
        }
        {
          ['Super Admin', 'Admin'].includes(currentUser) &&
          <MenuItem
            icon={assets.dl_icon}
            label="Delivery Locations"
            active={currentView === "delivery locations"}
            onClick={() => {window.location.href = "/delivery-locations"; setIsSidebarOpen(false)}}
          />
        }
        <MenuItem
          icon={assets.reports_icon}
          label="Reports"
          active={currentView === "reports"}
          onClick={() => {window.location.href = "/reports"; setIsSidebarOpen(false)}}
        />
        {
          ['Super Admin'].includes(currentUser) && 
          <MenuItem
            icon={assets.return_policy_icon}
            label="Return & refund policy"
            active={currentView === "return refund policy"}
            onClick={() => {window.location.href = "/return-refund-policy"; setIsSidebarOpen(false);}}
          />
        }
        {
          ['Super Admin'].includes(currentUser) && 
          <MenuItem
            icon={assets.settings_icon}
            label="Settings"
            active={currentView === "settings"}
            onClick={() => {window.location.href = "/settings"; setIsSidebarOpen(false);}}
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
