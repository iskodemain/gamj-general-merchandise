import { useContext } from "react";
import { assets } from "../assets/assets.js";
import Navbar from "../components/Navbar.jsx";
import "./TermsAndConditions.css";

import { FaArrowLeft } from "react-icons/fa6";
import { AdminContext } from "../context/AdminContextProvider.jsx";

function TermsAndConditions() {
  const { navigate } = useContext(AdminContext);
  
  return (
    <>
      <Navbar TitleName="Terms & Conditions" />

      <main className="terms-conditions-container">
        <section className="terms-conditions-section">
          <div className="terms-conditions-header">
            <button
              className="terms-conditions-back-btn"
              onClick={() => navigate("/overview")}
            >
              <FaArrowLeft />
            </button>
            <h3 className="terms-conditions-header-title">Back</h3>
          </div>

          <div className="terms-conditions-grid">
            <OverviewCard
              icon={assets.store_policy}
              title="Store Policy"
              description="[Edit Policy]"
              onClick={() => navigate("/store-policy")}
            />

            <OverviewCard
              icon={assets.return_policy_icon}
              title="Return & Refund Period"
              description="[Edit Period]"
              onClick={() => navigate("/return-refund-policy")}
            />
          </div>
        </section>
      </main>
    </>
  );
}

function OverviewCard({ icon, color, title, description, onClick }) {
  return (
    <div className="terms-conditions-card" onClick={onClick}>
      <div className="terms-conditions-card-top">
        {icon ? (
          <img
            src={icon}
            alt={title}
            className="terms-conditions-card-icon"
          />
        ) : (
          <span className={`terms-conditions-dot ${color}`} />
        )}
        <span className="terms-conditions-card-title">{title}</span>
      </div>

      <div className="terms-conditions-divider" />

      <div className="terms-conditions-card-container">
        <span className="terms-conditions-card-description">{description}</span>
      </div>
    </div>
  );
}

export default TermsAndConditions;