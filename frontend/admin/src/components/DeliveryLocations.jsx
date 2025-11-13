import React, { useState } from "react";
import "./DeliveryLocations.css";
import Provinces from "./Locations/Provinces";
import Cities from "./Locations/Cities";
import Barangay from "./Locations/Barangay";
import Navbar from "./Navbar";
export default function DeliveryLocations() {
  const [view, setView] = useState("dashboard"); // "dashboard" | "provinces" | "cities"

  if (view === "provinces") {
    return (
      <section className="dashboard-card" aria-label="Provinces">
        <div className="locations-panel">
          <Provinces onBack={() => setView("dashboard")} />
        </div>
      </section>
    );
  }

  if (view === "cities") {
    return (
      <section className="dashboard-card" aria-label="Cities">
        <div className="locations-panel">
          <Cities onBack={() => setView("dashboard")} />
        </div>
      </section>
    );
  }
  if (view === "barangay") {
    return (
      <section className="dashboard-card" aria-label="Barangay">
        <div className="locations-panel">
          <Barangay onBack={() => setView("dashboard")} />
        </div>
      </section>
    );
  }

  return (
    <>
    <Navbar TitleName="Delivery Locations"/>
      <section className="dashboard-card" aria-label="Delivery locations summary">
        <div className="stats-grid">
          <div className="stat-card country">
            <div className="stat-title">Country</div>
            <div className="stat-country">Philippines</div>
          </div>

          <div
            className="stat-card provinces"
            role="button"
            tabIndex={0}
            onClick={() => setView("provinces")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setView("provinces");
            }}
            aria-label="Open provinces"
          >
            <div className="stat-title">List of Provinces</div>
            <div className="stat-number">1</div>
          </div>

          <div
            className="stat-card cities"
            role="button"
            tabIndex={0}
            onClick={() => setView("cities")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setView("cities");
            }}
            aria-label="Open cities"
          >
            <div className="stat-title">List of Cities</div>
            <div className="stat-number">1</div>
          </div>
          <div
            className="stat-card barangays"
            role="button"
            tabIndex={0}
            onClick={() => setView("barangay")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setView("baragay");
            }}
            aria-label="Open barangay"
          >
            <div className="stat-title">List of Barangay</div>
            <div className="stat-number">1</div>
          </div>
        </div>
      </section>
    </>
  );
}