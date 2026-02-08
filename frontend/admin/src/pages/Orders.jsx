// src/components/Overview.jsx
import React, { useContext, useMemo } from "react";
import { assets } from "../assets/assets.js";
import Navbar from "../components/Navbar.jsx";
import "./Orders.css";
import { AdminContext } from "../context/AdminContextProvider.jsx";
import { FaArrowLeft } from "react-icons/fa6";

function Orders() {
  const { navigate, fetchOrders, fetchOrderItems, fetchCancelledOrders, fetchReturnRefundOrders, fetchOrderTransaction } = useContext(AdminContext);

  const stats = useMemo(() => {
    const ACTIVE = ["Pending", "Processing", "Out for Delivery", "Delivered"];
    const activeSet = new Set();

    fetchOrderItems.forEach((item) => {
      if (ACTIVE.includes(item.orderStatus)) {
        activeSet.add(`${item.orderId}-${item.orderStatus}`);
      }
    });

    const activeOrders = activeSet.size;
    const cancellations = fetchCancelledOrders.length;
    const returnsRefunds = fetchReturnRefundOrders.length;
    const orderTransactions = fetchOrderTransaction.length;

    return { activeOrders, cancellations, returnsRefunds, orderTransactions };
  }, [fetchOrders, fetchOrderItems, fetchCancelledOrders, fetchOrderTransaction]);

  return (
    <>
      <Navbar TitleName="Orders" />

      <main className="ordersView-container">

        {/* ===== ORDERS SECTION ===== */}
        <section className="ordersView-section">
          <div className="ordersView-header">
            <button className="ordersView-back-btn" onClick={() => navigate("/overview")}>
                <FaArrowLeft />
            </button>
            <h3 className="ordersView-header-title">Back</h3>
          </div>

          <div className="ordersView-grid">
            <OverviewCard
              icon={assets.all_orders_icon}
              title="Active Orders"
              number={stats.activeOrders}
              date="Updated: Sep 25, 2025"
              onClick={() => navigate("/activeorders")}
            />
            <OverviewCard
              icon={assets.order_cancellation_icon}
              title="Order Cancellation"
              number={stats.cancellations}
              date="Updated: Sep 25, 2025"
              onClick={() => navigate("/cancelorder")}
            />
            <OverviewCard
              icon={assets.returnandrefund_icon}
              title="Return and Refund"
              number={stats.returnsRefunds}
              date="Updated: Sep 25, 2025"
              onClick={() => navigate("/returnandrefund")}
            />
            <OverviewCard
              icon={assets.order_transaction}
              title="Order Transactions"
              number={stats.orderTransactions}
              date="Updated: Sep 25, 2025"
              onClick={() => navigate("/transactions/order")}
            />
          </div>
        </section>
      </main>
    </>
  );
}

function OverviewCard({ icon, color, title, number, date, onClick }) {
  return (
    <div className="ordersView-card" onClick={onClick}>
      <div className="ordersView-card-top">
        {icon ? (
          <img src={icon} alt={title} className="ordersView-card-icon" />
        ) : (
          <span className={`ordersView-dot ${color}`} />
        )}
        <span className="ordersView-card-title">{title}</span>
      </div>

      <div className="ordersView-divider" />

      <div className="ordersView-card-container">
        <span className="ordersView-card-number">{number}</span>
        <span className="ordersView-card-date">{date}</span>
      </div>
    </div>
  );
}

export default Orders;
