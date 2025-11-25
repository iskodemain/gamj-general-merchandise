// src/components/Overview.jsx
import React, { useContext } from "react";
import { assets } from "../assets/assets.js";
import Navbar from "../components/Navbar.jsx";
import "./Orders.css";
import { AdminContext } from "../context/AdminContextProvider.jsx";
import { FaArrowLeft } from "react-icons/fa6";

function Orders() {
  const { navigate } = useContext(AdminContext);

  return (
    <>
      <Navbar TitleName="Orders" />

      <main className="overview-container">

        {/* ===== ORDERS SECTION ===== */}
        <section className="overview-section">
          <div className="overview-header">
            <button className="order-back-btn" onClick={() => navigate("/overview")}>
                <FaArrowLeft />
            </button>
            <h3 className="overview-header-title">Back</h3>
          </div>

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

export default Orders;
