import { useContext } from "react";
import { assets } from "../assets/assets.js";
import Navbar from "../components/Navbar.jsx";
import "./DeliverySettings.css";

import { FaArrowLeft } from "react-icons/fa6";
import { AdminContext } from "../context/AdminContextProvider.jsx";

function DeliverySettings() {
  const { navigate, barangays, cities, provinces, fetchShippingRates } = useContext(AdminContext);

  const totalLocations = barangays.length + cities.length + provinces.length;
  
  return (
    <>
      <Navbar TitleName="Delivery Settings" />

      <main className="delivery-settings-container">
        <section className="delivery-settings-section">
          <div className="delivery-settings-header">
            <button
              className="delivery-settings-back-btn"
              onClick={() => navigate("/overview")}
            >
              <FaArrowLeft />
            </button>
            <h3 className="delivery-settings-header-title">Back</h3>
          </div>

          <div className="delivery-settings-grid">
            <OverviewCard
              icon={assets.delivery_location_2}
              title="Delivery Locations"
              number={totalLocations}
              onClick={() => navigate("/delivery-locations")}
            />

            <OverviewCard
              icon={assets.shipping_rates}
              title="Shipping Rates"
              number={fetchShippingRates.length}
              onClick={() => navigate("/shipping-rates")}
            />
          </div>
        </section>
      </main>
    </>
  );
}

function OverviewCard({ icon, color, title, number, date, onClick }) {
  return (
    <div className="delivery-settings-card" onClick={onClick}>
      <div className="delivery-settings-card-top">
        {icon ? (
          <img
            src={icon}
            alt={title}
            className="delivery-settings-card-icon"
          />
        ) : (
          <span className={`delivery-settings-dot ${color}`} />
        )}
        <span className="delivery-settings-card-title">{title}</span>
      </div>

      <div className="delivery-settings-divider" />

      <div className="delivery-settings-card-container">
        <span className="delivery-settings-card-number">{number}</span>
        <span className="delivery-settings-card-date">{date}</span>
      </div>
    </div>
  );
}

export default DeliverySettings;