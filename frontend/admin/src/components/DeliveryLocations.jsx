import React, { useContext } from "react";
import "./DeliveryLocations.css";
import Navbar from "./Navbar";
import { AdminContext } from "../context/AdminContextProvider";

export default function DeliveryLocations() {
  const { barangays, cities, provinces, navigate } = useContext(AdminContext);

  // Calculate dynamic counts from backend data
  const provincesCount = provinces?.length || 0;
  const citiesCount = cities?.length || 0;
  const barangaysCount = barangays?.length || 0;

  return (
    <>
      <Navbar TitleName="Delivery Locations" />

      <section
        className="delivery-location-container"
        aria-label="Delivery locations summary"
      >
        <div className="delivery-stats-grid">
          {/* Country Card - Non-clickable */}
          <div className="delivery-stat-card delivery-country">
            <div className="delivery-stat-title">Country</div>
            <div className="delivery-stat-country">Philippines</div>
          </div>

          {/* Provinces Card */}
          <div
            className="delivery-stat-card delivery-provinces delivery-clickable"
            role="button"
            tabIndex={0}
            onClick={() => navigate("/delivery-locations/provinces")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/delivery-locations/provinces");
              }
            }}
            aria-label={`Open provinces list. Total: ${provincesCount}`}
          >
            <div className="delivery-stat-title">List of Provinces</div>
            <div className="delivery-stat-number">{provincesCount}</div>
          </div>

          {/* Cities Card */}
          <div
            className="delivery-stat-card delivery-cities delivery-clickable"
            role="button"
            tabIndex={0}
            onClick={() => navigate("/delivery-locations/cities")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/delivery-locations/cities");
              }
            }}
            aria-label={`Open cities list. Total: ${citiesCount}`}
          >
            <div className="delivery-stat-title">List of Cities</div>
            <div className="delivery-stat-number">{citiesCount}</div>
          </div>

          {/* Barangays Card */}
          <div
            className="delivery-stat-card delivery-barangays delivery-clickable"
            role="button"
            tabIndex={0}
            onClick={() => navigate("/delivery-locations/barangays")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/delivery-locations/barangays");
              }
            }}
            aria-label={`Open barangay list. Total: ${barangaysCount}`}
          >
            <div className="delivery-stat-title">List of Barangay</div>
            <div className="delivery-stat-number">{barangaysCount}</div>
          </div>
        </div>
      </section>
    </>
  );
}
