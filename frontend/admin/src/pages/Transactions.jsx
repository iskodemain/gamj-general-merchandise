import { useContext } from "react";
import { assets } from "../assets/assets.js";
import Navbar from "../components/Navbar.jsx";
import "./Transactions.css";

import { FaArrowLeft } from "react-icons/fa6";
import { AdminContext } from "../context/AdminContextProvider.jsx";

function Transactions() {
  const { navigate, fetchInventoryHistory, fetchOrderTransaction } = useContext(AdminContext);
  
  return (
    <>
      <Navbar TitleName="Transactions" />

      <main className="transactions-main-container">
        <section className="transactions-main-section">
          <div className="transactions-main-header">
            <button
              className="transactions-main-back-btn"
              onClick={() => navigate("/overview")}
            >
              <FaArrowLeft />
            </button>
            <h3 className="transactions-main-header-title">Back</h3>
          </div>

          <div className="transactions-main-grid">
            <OverviewCard
              icon={assets.order_transaction}
              title="Order Transactions"
              number={fetchOrderTransaction.length}
              onClick={() => navigate("/transactions/order")}
            />

            <OverviewCard
              icon={assets.inventory_transaction}
              title="Inventory Transactions"
              number={fetchInventoryHistory.length}
              onClick={() => navigate("/transactions/inventory")}
            />
          </div>
        </section>
      </main>
    </>
  );
}

function OverviewCard({ icon, color, title, number, date, onClick }) {
  return (
    <div className="transactions-main-card" onClick={onClick}>
      <div className="transactions-main-card-top">
        {icon ? (
          <img
            src={icon}
            alt={title}
            className="transactions-main-card-icon"
          />
        ) : (
          <span className={`transactions-main-dot ${color}`} />
        )}
        <span className="transactions-main-card-title">{title}</span>
      </div>

      <div className="transactions-main-divider" />

      <div className="transactions-main-card-container">
        <span className="transactions-main-card-number">{number}</span>
        <span className="transactions-main-card-date">{date}</span>
      </div>
    </div>
  );
}

export default Transactions;
