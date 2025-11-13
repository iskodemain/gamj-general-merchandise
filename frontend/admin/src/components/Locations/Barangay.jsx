import React, { useState } from "react";
import "./Barangay.css";

function Barangay({ onBack }) {
  const [selectedProvince, setSelectedProvince] = useState("Cavite");
  const [selectedCity, setSelectedCity] = useState("Carmona");
  const [barangays, setBarangays] = useState([{ id: 1, name: "Poblacion" }]);
  const [newBarangay, setNewBarangay] = useState("");

  function handleDelete(id) {
    setBarangays((prev) => prev.filter((b) => b.id !== id));
  }

  function handleAdd() {
    const name = newBarangay.trim();
    if (!name) return;
    setBarangays((prev) => [...prev, { id: Date.now(), name }]);
    setNewBarangay("");
  }

  function handleSave() {
    // visual-only: replace with API call if needed
    console.log("Saving barangays for", selectedProvince, selectedCity, barangays);
  }

  return (
    <div className="cities-page">
      <div className="cities-card" role="region" aria-label="Barangay">
        <div className="cities-header">
          <h2 className="cities-title">List of Barangays Available for Order Delivery</h2>
        </div>

        <label className="section-label" htmlFor="province-select">
          Select a province
        </label>
        <div className="province-row">
          <select
            id="province-select"
            className="province-select"
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            aria-label="Select province"
          >
            <option value="Cavite">Cavite</option>
            <option value="Laguna">Laguna</option>
            <option value="Batangas">Batangas</option>
          </select>
        </div>

        <label className="section-label" htmlFor="city-select" style={{ marginTop: 12 }}>
          Select a city
        </label>
        <div className="province-row">
          <select
            id="city-select"
            className="province-select"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            aria-label="Select city"
          >
            <option value="Carmona">Carmona</option>
            <option value="General Trias">General Trias</option>
            <option value="Silang">Silang</option>
          </select>
        </div>

        <label className="section-label" style={{ marginTop: 18 }}>
          List of barangay
        </label>

        <div className="inputs-list">
          {barangays.map((b) => (
            <div className="input-row" key={b.id}>
              <input
                className="city-input"
                value={b.name}
                onChange={(e) =>
                  setBarangays((prev) => prev.map((it) => (it.id === b.id ? { ...it, name: e.target.value } : it)))
                }
                aria-label={`Barangay ${b.name}`}
              />
              <div className="row-actions">
                <button
                  type="button"
                  className="btn btn-delete"
                  onClick={() => handleDelete(b.id)}
                  aria-label={`Delete ${b.name}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {/* add new barangay row */}
          <div className="input-row">
            <input
              className="city-input"
              placeholder="Enter the name of the barangay"
              value={newBarangay}
              onChange={(e) => setNewBarangay(e.target.value)}
              aria-label="New barangay name"
            />
            <div className="row-actions">
              <button type="button" className="btn btn-add" onClick={handleAdd} aria-label="Add more">
                Add More
              </button>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-save" onClick={handleSave}>
            Save Changes
          </button>
          <button
            type="button"
            className="btn-neutral"
            onClick={() => (onBack ? onBack() : window.history.back())}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default Barangay;