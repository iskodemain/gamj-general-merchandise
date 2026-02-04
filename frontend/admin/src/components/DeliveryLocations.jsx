import React, { useState, useContext } from "react";
import "./DeliveryLocations.css";
import Provinces from "./Locations/Provinces";
import Cities from "./Locations/Cities";
import Barangay from "./Locations/Barangay";
import Navbar from "./Navbar";
import { AdminContext } from "../context/AdminContextProvider";

export default function DeliveryLocations() {
  const { barangays, cities, provinces } = useContext(AdminContext);
  const [view, setView] = useState("dashboard");

  // Calculate dynamic counts from backend data
  const provincesCount = provinces?.length || 0;
  const citiesCount = cities?.length || 0;
  const barangaysCount = barangays?.length || 0;

  if (view === "provinces") {
    return (
      <section className="delivery-location-container" aria-label="Provinces">
        <div className="delivery-location-panel">
          <Provinces onBack={() => setView("dashboard")} />
        </div>
      </section>
    );
  }

  if (view === "cities") {
    return (
      <section className="delivery-location-container" aria-label="Cities">
        <div className="delivery-location-panel">
          <Cities onBack={() => setView("dashboard")} />
        </div>
      </section>
    );
  }

  if (view === "barangay") {
    return (
      <section className="delivery-location-container" aria-label="Barangay">
        <div className="delivery-location-panel">
          <Barangay onBack={() => setView("dashboard")} />
        </div>
      </section>
    );
  }

  return (
    <>
      <Navbar TitleName="Delivery Locations" />
      <section className="delivery-location-container" aria-label="Delivery locations summary">
        <div className="delivery-stats-grid">
          {/* Country Card - Non-clickable */}
          <div className="delivery-stat-card delivery-country">
            <div className="delivery-stat-title">Country</div>
            <div className="delivery-stat-country">Philippines</div>
          </div>

          {/* Provinces Card - Clickable */}
          <div
            className="delivery-stat-card delivery-provinces delivery-clickable"
            role="button"
            tabIndex={0}
            onClick={() => setView("provinces")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setView("provinces");
              }
            }}
            aria-label={`Open provinces list. Total: ${provincesCount}`}
          >
            <div className="delivery-stat-title">List of Provinces</div>
            <div className="delivery-stat-number">{provincesCount}</div>
          </div>

          {/* Cities Card - Clickable */}
          <div
            className="delivery-stat-card delivery-cities delivery-clickable"
            role="button"
            tabIndex={0}
            onClick={() => setView("cities")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setView("cities");
              }
            }}
            aria-label={`Open cities list. Total: ${citiesCount}`}
          >
            <div className="delivery-stat-title">List of Cities</div>
            <div className="delivery-stat-number">{citiesCount}</div>
          </div>

          {/* Barangays Card - Clickable */}
          <div
            className="delivery-stat-card delivery-barangays delivery-clickable"
            role="button"
            tabIndex={0}
            onClick={() => setView("barangay")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setView("barangay");
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