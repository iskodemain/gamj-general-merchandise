// src/components/Overview.jsx
import React, { useContext, useState } from "react";
import { assets } from "../assets/assets.js";
import Navbar from "../components/Navbar.jsx";
import "./Overview.css";
import { AdminContext } from "../context/AdminContextProvider.jsx";

function Overview() {
  const { navigate } = useContext(AdminContext);
  const [openOrders, setOpenOrders] = useState(true);
  const [openUsers, setOpenUsers] = useState(true);

  return (
    <>
      <Navbar TitleName="Overview"/>

      <main className="overview-container">
        {/* ===== ORDERS SECTION ===== */}
        <section className="overview-section">
          <div
            className="overview-header"
            onClick={() => setOpenOrders((prev) => !prev)}
          >
            <h3 className="overview-header-title">Orders</h3>
            <ChevronDown className={`overview-chevron ${openOrders ? "open" : ""}`} />
          </div>

          {openOrders && (
            <>
              <div className="overview-grid">
                <OverviewCard
                  color="orange"
                  title="Pending Orders"
                  number="5"
                  date="Updated: Sep 25, 2025"
                  onClick={() => navigate("/pending")}
                />
                <OverviewCard
                  color="teal"
                  title="Processing Orders"
                  number="10"
                  date="Updated: Sep 25, 2025"
                  onClick={() => navigate("/processing")}
                />
                <OverviewCard
                  color="blue"
                  title="Out for Delivery Orders"
                  number="4"
                  date="Updated: Sep 25, 2025"
                  onClick={() => navigate("/outfordelivery")}
                />
                <OverviewCard
                  color="green"
                  title="Delivered Orders"
                  number="48"
                  date="Updated: Sep 25, 2025"
                  onClick={() => navigate("/delivered")}
                />
              </div>

              <div className="overview-grid">
                <OverviewCard
                  icon={assets.all_orders_icon}
                  title="All Orders"
                  number="67"
                  date="Updated: Sep 25, 2025"
                  onClick={() => navigate("/allorders")}
                />
                <OverviewCard
                  icon={assets.order_cancellation_icon}
                  title="Order Cancellation"
                  number="2"
                  date="Updated: Sep 25, 2025"
                  onClick={() => navigate("/cancelorder")}
                />
                <OverviewCard
                  icon={assets.returnandrefund_icon}
                  title="Return and Refund"
                  number="2"
                  date="Updated: Sep 25, 2025"
                  onClick={() => navigate("/returnandrefund")}
                />
                <OverviewCard
                  icon={assets.delivery_location_icon}
                  title="Delivery Locations"
                  number="2"
                  date="Updated: Sep 25, 2025"
                  onClick={() => navigate("/locations")}
                />
              </div>
            </>
          )}
        </section>

        {/* ===== USERS SECTION ===== */}
        <section className="overview-section">
          <div
            className="overview-header"
            onClick={() => setOpenUsers((prev) => !prev)}
          >
            <h3 className="overview-header-title">Users</h3>
            <ChevronDown className={`overview-chevron ${openUsers ? "open" : ""}`} />
          </div>

          {openUsers && (
            <>
              <div className="overview-grid">
                <OverviewCard
                  icon={assets.verified_user_icon}
                  title="Verified Customers"
                  number="1"
                  date="Updated: Sep 25, 2025"
                  onClick={() => navigate("/verifiedcustomers")}
                />
                <OverviewCard
                  icon={assets.unverified_user_icon}
                  title="Unverified Customers"
                  number="2"
                  date="Updated: Sep 25, 2025"
                  onClick={() => navigate("/unverifiedcustomers")}
                />
                <OverviewCard
                  icon={assets.verified_staff_icon}
                  title="Verified Staff"
                  number="2"
                  date="Updated: Sep 25, 2025"
                  onClick={() => navigate("/verifiedstaff")}
                />
                <OverviewCard
                  icon={assets.unverified_staff_icon}
                  title="Unverified Staff"
                  number="2"
                  date="Updated: Sep 25, 2025"
                  onClick={() => navigate("/unverifiedstaff")}
                />
              </div>

              <div className="overview-grid">
                <OverviewCard
                  icon={assets.all_users_icon}
                  title="All Users"
                  number="67"
                  date="Updated: Sep 25, 2025"
                  onClick={() => navigate("/alluser")}
                />
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}

function OverviewCard({ icon, color, title, number, date, onClick }) {
  return (
    <div className="overview-card" onClick={onClick}>
      <div className="overview-card-top">
        {icon ? (
          <img src={icon} alt={title} className="overview-card-icon" />
        ) : (
          <span className={`overview-dot ${color}`} />
        )}
        <span className="overview-card-title">{title}</span>
      </div>
      <div className="overview-divider" />
      <div className="overview-card-container">
        <span className="overview-card-number">{number}</span>
        <span className="overview-card-date">{date}</span>
      </div>
    </div>
  );
}

function ChevronDown({ className }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default Overview;
