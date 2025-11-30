// src/components/ActiveOrders.jsx
import { useContext, useState } from "react";
import { assets } from "../assets/assets.js";
import Navbar from "../components/Navbar.jsx";
import "./ActiveOrders.css";
import { AdminContext } from "../context/AdminContextProvider.jsx";
import { FaArrowLeft } from "react-icons/fa6";


function ActiveOrders() {
    const { navigate, fetchOrders, fetchOrderItems } = useContext(AdminContext);
    

    const pendingOrders = fetchOrders?.filter((order) => {
        const items = fetchOrderItems.filter(
        (item) => item.orderId === order.ID
        );
        return items.some((item) => item.orderStatus === "Pending");
    }) || [];

    const processingOrders = fetchOrders?.filter((order) => {
        const items = fetchOrderItems.filter(
        (item) => item.orderId === order.ID
        );
        return items.some((item) => item.orderStatus === "Processing");
    }) || [];

    const outForDeliveryOrders = fetchOrders?.filter((order) => {
        const items = fetchOrderItems.filter(
        (item) => item.orderId === order.ID
        );
        return items.some((item) => item.orderStatus === "Out for Delivery");
    }) || [];

    const deliiveredOrders = fetchOrders?.filter((order) => {
        const items = fetchOrderItems.filter(
        (item) => item.orderId === order.ID
        );
        return items.some((item) => item.orderStatus === "Delivered");
    }) || [];

  return (
    <>
      <Navbar TitleName="Active Orders" />

      <main className="active-orders-container">

        {/* ===== ORDERS SECTION ===== */}
        <section className="active-orders-section">
          <div className="active-orders-header">
            <button className="active-orders-back-btn" onClick={() => navigate("/orders")}>
                <FaArrowLeft />
            </button>
            <h3 className="active-orders-header-title">Back</h3>
          </div>

          <div className="active-orders-grid">
            <ActiveOrderCard
              color="orange"
              title="Pending Orders"
              number={pendingOrders.length}
              date="Updated: Sep 25, 2025"
              onClick={() => navigate("/pending")}
            />
            <ActiveOrderCard
              color="teal"
              title="Processing Orders"
              number={processingOrders.length}
              date="Updated: Sep 25, 2025"
              onClick={() => navigate("/processing")}
            />
            <ActiveOrderCard
              color="blue"
              title="Out for Delivery Orders"
              number={outForDeliveryOrders.length}
              date="Updated: Sep 25, 2025"
              onClick={() => navigate("/outfordelivery")}
            />
            <ActiveOrderCard
              color="green"
              title="Delivered Orders"
              number={deliiveredOrders.length}
              date="Updated: Sep 25, 2025"
              onClick={() => navigate("/delivered")}
            />
          </div>
        </section>
      </main>
    </>
  );
}

function ActiveOrderCard({ icon, color, title, number, date, onClick }) {
  return (
    <div className="active-order-card" onClick={onClick}>
      <div className="active-order-card-top">
        {icon ? (
          <img src={icon} alt={title} className="active-order-card-icon" />
        ) : (
          <span className={`active-order-dot ${color}`} />
        )}
        <span className="active-order-card-title">{title}</span>
      </div>

      <div className="active-order-divider" />

      <div className="active-order-card-container">
        <span className="active-order-card-number">{number}</span>
        <span className="active-order-card-date">{date}</span>
      </div>
    </div>
  );
}

export default ActiveOrders;