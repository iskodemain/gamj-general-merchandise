import { useContext } from "react";
import { assets } from "../assets/assets.js";
import Navbar from "../components/Navbar.jsx";
import "./Inventory.css";
import { AdminContext } from "../context/AdminContextProvider.jsx";
import { FaArrowLeft } from "react-icons/fa6";

function Inventory() {
  const { navigate, fetchInventoryStock, fetchInventoryBatch } = useContext(AdminContext);
  
  return (
    <>
      <Navbar TitleName="User Management" />

      <main className="inventory-main-container">
        <section className="inventory-main-section">
          <div className="inventory-main-header">
            <button className="inventory-main-back-btn" onClick={() => navigate("/overview")}>
              <FaArrowLeft />
            </button>
            <h3 className="inventory-main-header-title">Back</h3>
          </div>
          
          {/* ✅ FIXED - ONE grid container with ALL cards inside */}
          <div className="inventory-main-grid">
            <OverviewCard
              icon={assets.all_users_icon}
              title="Inventory Dashboard"
              number={fetchInventoryStock.length}
              date="Updated: Sep 25, 2025"
              onClick={() => navigate("/inventory/list")}
            />
            
            <OverviewCard
              icon={assets.all_users_icon}
              title="Add Stock"
              number={"+"}
              date="Updated: Sep 25, 2025"
              onClick={() => navigate("/inventory/add")}
            />

            <OverviewCard
              icon={assets.all_users_icon}
              title="Batch List"
              number={fetchInventoryBatch.length}
              date="Updated: Sep 25, 2025"
              onClick={() => navigate("/inventory/batch")}
            />
          </div>
        </section>
      </main>
    </>
  );
}

function OverviewCard({ icon, color, title, number, date, onClick }) {
  return (
    <div className="inventory-main-card" onClick={onClick}>
      <div className="inventory-main-card-top">
        {icon ? (
          <img src={icon} alt={title} className="inventory-main-card-icon" />
        ) : (
          <span className={`inventory-main-dot ${color}`} />
        )}
        <span className="inventory-main-card-title">{title}</span>
      </div>

      <div className="inventory-main-divider" />

      <div className="inventory-main-card-container">
        <span className="inventory-main-card-number">{number}</span>
        <span className="inventory-main-card-date">{date}</span>
      </div>
    </div>
  );
}

export default Inventory;