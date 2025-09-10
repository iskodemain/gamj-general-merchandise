import React, { useState } from "react";
import "./cities.css";

function Cities({ onBack }) {
  const [selectedProvince, setSelectedProvince] = useState("Cavite");
  const [cities, setCities] = useState([{ id: 1, name: "Carmona" }]);
  const [newCity, setNewCity] = useState("");

  function handleDelete(id) {
    setCities((prev) => prev.filter((c) => c.id !== id));
  }

  function handleAdd() {
    const name = newCity.trim();
    if (!name) return;
    setCities((prev) => [...prev, { id: Date.now(), name }]);
    setNewCity("");
  }

  function handleSave() {
    // visual-only: you can replace with API call
    console.log("Saving cities for", selectedProvince, cities);
    // provide user feedback in real app
  }

  return (
    <div className="cities-page">
      <div className="cities-card" role="region" aria-label="Cities">
        <div className="cities-header">
          <h2 className="cities-title">List of Cities Available for Order Delivery</h2>
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

        <label className="section-label" style={{ marginTop: 18 }}>
          List of cities
        </label>

        <div className="inputs-list">
          {cities.map((c) => (
            <div className="input-row" key={c.id}>
              <input
                className="city-input"
                value={c.name}
                onChange={(e) =>
                  setCities((prev) => prev.map((it) => (it.id === c.id ? { ...it, name: e.target.value } : it)))
                }
                aria-label={`City ${c.name}`}
              />
              <div className="row-actions">
                <button
                  type="button"
                  className="btn btn-delete"
                  onClick={() => handleDelete(c.id)}
                  aria-label={`Delete ${c.name}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {/* add new city row */}
          <div className="input-row">
            <input
              className="city-input"
              placeholder="Enter the name of the city"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              aria-label="New city name"
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

export default Cities;