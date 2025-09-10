import React, { useState } from "react";
import { assets } from "../assets/assets.js";
import "./adminNavbar.css";
import Pending from "./Pending"; 
import Processing from "./Processing"; 
import OutforDelivery from "./OutforDelivery"; 
import Delivered from "./Delivered";
import AllOrders from "./AllOrders";
import ReturnAndRefund from "./ReturnAndRefund";
import CancelOrder from "./CancelOrder";
import DeliveryLocations from "./DeliveryLocations";
import CancelReason from "./Cancellation/CancelReason.jsx";
import UnverifiedCustomer from "./VeriAndUnverified/UnverifiedCustomer";
import VerifiedCustomer from "./VeriAndUnverified/VerifiedCustomer";
import VerifiedStaff from "./VeriAndUnverified/VerifiedStaff";
import UnverifiedStaff from "./VeriAndUnverified/UnverifiedStaff";
import Profile from "./Profile";
import Products from "./Products";
import AddProduct from './ProductMenu/AddProduct';
import Staff from "./Staff";
import Notification from "./Notification";
import AllUser from "./AllUser";
function AdminNavbar() {
  const [openOrders, setOpenOrders] = useState(true);
  const [openUsers, setOpenUsers] = useState(true);
  const [currentView, setCurrentView] = useState("overview");
  
  // Track current view

  const VIEW_TITLES = {
    overview: "Overview",
    pending: "Pending Orders",
    processing: "Processing Orders",
    outfordelivery: "Out for Delivery",
    Delivered: "Delivered",
    profile: "Profile",
    staff: "Staff",
    notifications: "Notifications",
    gamjshop: "GAMJ Shop",
    products: "Products",
    allorders: "All Orders",
    locations: "Delivery Locations",
    cancelorder: "Cancel Orders",
    returnandrefund: "Return and Refund",
    unverifiedcustomers: "Unverified Customers",
    VerifiedCustomer: "Verified Customers",
    verifiedstaff: "Verified Staff",
    unverifiedstaff: "Unverified Staff",
    addProduct: "Add Products",
    alluser: "All Users",

    
  };

  // Function to handle navigation
  const navigateTo = (view) => {
    setCurrentView(view);
  };

  // Determine which content to show based on currentView
  const renderContent = () => {
    switch (currentView) {
      case "pending":
        return <Pending />;
      case "processing":
        return <Processing />;
      case "outfordelivery":
        return <OutforDelivery />;
      case "Delivered":
        return <Delivered />;
      case "allorders":
        return <AllOrders />;
      case "locations":
        return <DeliveryLocations />;
      case "cancelorder":
        return <CancelOrder />;
      case "returnandrefund":
        return <ReturnAndRefund />;
      case "unverifiedcustomers":
        return <UnverifiedCustomer />;
      case "VerifiedCustomer":
        return <VerifiedCustomer />;
      case "verifiedstaff":
        return <VerifiedStaff />;
      case "unverifiedstaff":
        return <UnverifiedStaff />;
      case "alluser":
        return <AllUser />;
      case "overview":
      
        return (
          <>
            {/* Orders Section */}
            <section className="metrics-section">
              <div className="metrics-header" onClick={() => setOpenOrders(s => !s)}>
                <h3>Orders</h3>
                <ChevronDown className={`chev ${openOrders ? "open" : ""}`} />
              </div>

              {openOrders && (
                <>
                  <div className="metrics-grid">
                    <MetricCard
                      left={<span className="circle orange" />}
                      title="Pending Orders"
                      number="5"
                      subtext="Updated: Sep 25, 2025"
                      onClick={() => navigateTo("pending")}
                      clickable={true}
                    />
                    <MetricCard
                      left={<span className="circle teal" />}
                      title="Processing Orders"
                      number="10"
                      subtext="Updated: Sep 25, 2025"
                      onClick={() => navigateTo("processing")}
                      clickable={true}
                    />
                    <MetricCard
                      left={<span className="circle blue" />}
                      title="Out for Delivery"
                      number="4"
                      subtext="Updated: Sep 25, 2025"
                      onClick={() => navigateTo("outfordelivery")}
                      clickable={true}
                    />
                    <MetricCard
                      left={<span className="circle green" />}
                      title="Delivered"
                      number="4"
                      subtext="Updated: Sep 25, 2025"
                      onClick={() => navigateTo("Delivered")}
                      clickable={true}
                    />
                    
                  </div>

                  <div className="metrics-grid">
                    <MetricCard
                      left={<img src={assets.all_orders_icon} alt="all" />}
                      title="All Orders"
                      number="5"
                      subtext="Updated: Sep 25, 2025"
                      onClick={() => navigateTo("allorders")}
                      clickable={true}
                    />
                    <MetricCard
                      left={<img src={assets.order_cancellation_icon} alt="all" />}
                      title="Order Cancellations"
                      number="5"
                      subtext="Updated: Sep 25, 2025"
                      onClick={() => navigateTo("cancelorder")}
                      clickable={true}
                    />
                    <MetricCard
                      left={<img src={assets.returnandrefund_icon} alt="refund" />}
                      title="Return and Refund"
                      number="5"
                      subtext="Updated: Sep 25, 2025"
                      onClick={() => navigateTo("returnandrefund")}
                      clickable={true}
                    />
                    <MetricCard
                      left={<img src={assets.delivery_location_icon} alt="location" />}
                      title="Delivery Locations"
                      number="5"
                      subtext="Updated: Sep 25, 2025"
                      onClick={() => navigateTo("locations")}
                      clickable={true}
                    />
                  </div>
                </>
              )}
            </section>

            {/* Users Section */}
            <section className="metrics-section">
              <div className="metrics-header" onClick={() => setOpenUsers(s => !s)}>
                <h3>Users</h3>
                <ChevronDown className={`chev ${openUsers ? "open" : ""}`} />
              </div>

              {openUsers && (
                <>
                  <div className="metrics-grid">
                     <MetricCard
                      left={<img src={assets.verified_user_icon} alt="verified" className="small-icon" />}
                      title="Verified Customers"
                      number="5"
                      subtext="Updated: Sep 25, 2025"
                      onClick={() => navigateTo("VerifiedCustomer")}
                      clickable={true}
                    />
                    <MetricCard
                      left={<img src={assets.unverified_user_icon} alt="unverified" className="small-icon" />}
                      title="Unverified Customers"
                      number="5"
                      subtext="Updated: Sep 25, 2025"
                      onClick={() => navigateTo("unverifiedcustomers")}
                      clickable={true}
                    />
                    <MetricCard
                      left={<img src={assets.verified_staff_icon} alt="verified" className="small-icon" />}
                      title="Verified staff"
                      number="5"
                      subtext="Updated: Sep 25, 2025"
                      onClick={() => navigateTo("verifiedstaff")}
                      clickable={true}
                    />
                    <MetricCard
                      left={<img src={assets.unverified_staff_icon} alt="unverified" className="small-icon" />}
                      title="Unverified Staff"
                      number="5"
                      subtext="Updated: Sep 25, 2025"
                      onClick={() => navigateTo("unverifiedstaff")}
                      clickable={true}
                    />
                  </div>

                  <div className="metrics-grid users-last-row">
                    <MetricCard
                      left={<img src={assets.all_users_icon} alt="all users" className="small-icon" />}
                      title="All Users"
                      number="5"
                      subtext="Updated: Sep 25, 2025"
                      onClick={() => navigateTo("alluser")}
                      clickable={true}
                    />
                  </div>
                </>
              )}
            </section>
          </>
        );
      case "profile":
        return <Profile />;
      case "staff":
        return <Staff />;
      case "notifications":
        return <Notification />;
      case "gamjshop":
        return <div className="placeholder-view">GAMJ Shop</div>;
      case "products":
        return <Products onAddProductClick={() => setCurrentView("addProduct") } />;
      case "addProduct":
        return <AddProduct />;
    
      default:
        return <div className="placeholder-view">{VIEW_TITLES[currentView] || currentView}</div>;
    }
  };

  return (
    <>
      <header className="admin-header"></header>
      
      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="sidebar-logo">
            <img src={assets.admin_gamj_logo} alt="admin Logo" className="admin-logo" />
            <div className="sidebar-text">
              <span className="sidebar-title">GAMJ Merchandise</span>
              <span className="sidebar-sublabel">Admin</span>
            </div>
          </div>
          <div className="admin-top-divider1"></div>
          <nav className="sidebar-menu">
            <MenuItem 
              icon={assets.overview_icon} 
              label="Overview" 
              active={currentView === "overview"}
              onClick={() => navigateTo("overview")}
            />
            <MenuItem icon={assets.profile_icon} label="Profile" active={currentView === "profile"} onClick={() => navigateTo("profile")} />
            <MenuItem icon={assets.staff_icon} label="Staff" active={currentView === "staff"} onClick={() => navigateTo("staff")} />
            <MenuItem icon={assets.notification_icon} label="Notifications" active={currentView === "notifications"} onClick={() => navigateTo("notifications")} />
            <MenuItem icon={assets.gamj_shop_icon} label="GAMJ Shop" active={currentView === "gamjshop"} onClick={() => navigateTo("gamjshop")} />
            <MenuItem icon={assets.products_icon} label="Products" active={currentView === "products"} onClick={() => navigateTo("products")} />
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="admin-main">
          <div className="admin-top-row">
            <span className="overview-title-mint">
              {VIEW_TITLES[currentView] || currentView}
            </span>
            <div className="top-row-icons">
              <img src={assets.notification_icon} alt="Notifications" className="top-row-icon" />
              <img src={assets.logout_icon} alt="Logout" className="top-row-icon" />
            </div>
          </div>
          <div className="admin-top-divider"></div>
          <main className="admin-content">
            {renderContent()}
          </main>
        </div>
      </div>
    </>
  );
}

function MenuItem({ icon, label, active, onClick }) {
  return (
    <div 
      className={`sidebar-menu-item${active ? " active" : ""}`}
      onClick={onClick}
    >
      <img src={icon} alt={label} className="menu-icon" />
      <span>{label}</span>
    </div>
  );
}

/* Small chevron SVG for collapsible sections */
function ChevronDown({ className }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* Reusable metric card */
function MetricCard({ left, title, number, subtext, onClick, clickable }) {
  return (
    <div 
      className={`metric-card ${clickable ? 'clickable' : ''}`} 
      onClick={onClick}
    >
      <div className="metric-body">
        <div className="metric-title-row">
          <div className="metric-left">{left}</div>
          <div className="metric-title">{title}</div>
        </div>

        <div className="metric-divider" />
        <div className="metric-number">{number}</div>
        {subtext && <div className="metric-subtext">{subtext}</div>}
      </div>
    </div>
  );
}

export default AdminNavbar;