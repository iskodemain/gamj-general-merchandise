import React, { useState, useContext, useEffect } from "react";
import "./Cities.css";
import { AdminContext } from "../../context/AdminContextProvider";
import Navbar from "../Navbar";
import { toast } from "react-toastify";

function Cities({ onBack }) {
  const { provinces, cities, addCity, updateCity, deleteCity, toastSuccess } = useContext(AdminContext);
  const [selectedProvinceId, setSelectedProvinceId] = useState(null);
  const [newCityName, setNewCityName] = useState("");
  const [citiesList, setCitiesList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize with first province
  useEffect(() => {
    if (provinces && provinces.length > 0 && !selectedProvinceId) {
      setSelectedProvinceId(provinces[0].ID);
    }
  }, [provinces, selectedProvinceId]);

  // Filter cities whenever province selection or cities data changes
  useEffect(() => {
    if (!selectedProvinceId) return;

    const list = cities
      ?.filter(city => Number(city.provinceId) === Number(selectedProvinceId))
      .map(city => ({ ...city, isNew: false })) || [];

    setCitiesList(list);
    setHasChanges(false);
  }, [selectedProvinceId, cities]);

  // Handle province selection change
  function handleProvinceChange(e) {
    setSelectedProvinceId(Number(e.target.value));
  }

  function handleAddCity() {
    const name = newCityName.trim();
    if (!name || !selectedProvinceId) return;

    setCitiesList(prev => [
      ...prev,
      {
        ID: Date.now(),       // temp ID for React rendering
        isNew: true,
        cityName: name,
        provinceId: selectedProvinceId
      }
    ]);

    setNewCityName("");
    setHasChanges(true);
  }

  // Handle existing city name change
  function handleCityChange(index, value) {
    const updated = [...citiesList];
    updated[index] = { ...updated[index], cityName: value };
    setCitiesList(updated);
    setHasChanges(true);
  }

  // Delete a city
  async function handleDeleteCity(index) {
    const city = citiesList[index];

    if (city.isNew) {
      setCitiesList(prev => prev.filter((_, i) => i !== index));
      setHasChanges(true);
      return;
    }

    setIsLoading(true);
    const deleted = await deleteCity(city.ID);
    setIsLoading(false);

    if (deleted) {
      setCitiesList(prev => prev.filter((_, i) => i !== index));
      toast.success("City deleted successfully!", toastSuccess);
    }
  }


  // Save all changes
  async function handleSaveChanges() {
    setIsLoading(true);

    let created = 0;
    let updated = 0;

    const allCitiesToSave = [...citiesList];

    const pendingCityName = newCityName.trim();
    if (pendingCityName && selectedProvinceId) {
      allCitiesToSave.push({
        ID: Date.now(),
        isNew: true,
        cityName: pendingCityName,
        provinceId: selectedProvinceId
      });
    }

    for (const city of allCitiesToSave) {
      const name = city.cityName.trim();
      if (!name) continue;

      if (city.isNew) {
        const res = await addCity({
          cityName: name,
          provinceId: selectedProvinceId
        });
        if (res) created++;
        continue;
      }

      const original = cities.find(c => c.ID === city.ID);
      if (original && original.cityName !== name) {
        const res = await updateCity({
          cityID: city.ID,
          cityName: name,
          provinceId: selectedProvinceId
        });
        if (res) updated++;
      }
    }

    setIsLoading(false);

    if (created || updated) {
      toast.success("Changes saved successfully!", toastSuccess);
      setHasChanges(false);
    }
  }


  // Handle back with unsaved changes warning
  function handleBack() {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  }

  // Get selected province name for display
  const selectedProvince = provinces?.find(p => p.ID === selectedProvinceId);


  return (
    <>
      <Navbar TitleName="Cities" />
      <div className="city-page-container">
        <div className="city-content-card" role="region" aria-label="Cities management">
          <div className="city-header">
            <h2 className="city-page-title">List of Cities Available for Order Delivery</h2>
          </div>

          {/* Province Selector */}
          <div className="city-province-section">
            <label className="city-section-label" htmlFor="city-province-select">
              Select a province
            </label>
            <div className="city-province-row">
              <select
                id="city-province-select"
                className="city-province-select"
                value={selectedProvinceId || ""}
                onChange={handleProvinceChange}
                aria-label="Select province"
                disabled={isLoading || !provinces || provinces.length === 0}
              >
                {!provinces || provinces.length === 0 ? (
                  <option value="">No provinces available</option>
                ) : (
                  provinces.map(province => (
                    <option key={province.ID} value={province.ID}>
                      {province.provinceName}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Cities List */}
          <div className="city-form-section">
            <label className="city-section-label">
              List of cities in {selectedProvince?.provinceName || "selected province"}
            </label>

            <div className="city-inputs-list">
              {/* Existing Cities */}
              {citiesList.map((city, index) => (
                <div className="city-input-row" key={index}>
                  <input
                    className="city-text-input"
                    value={city.cityName}
                    onChange={(e) => handleCityChange(index, e.target.value)}
                    aria-label={`City ${city.cityName}`}
                    disabled={isLoading}
                    placeholder="City name"
                  />
                  <div className="city-row-actions">
                    <button
                      type="button"
                      className="city-btn city-btn-delete"
                      onClick={() => handleDeleteCity(index)}
                      aria-label={`Delete ${city.cityName}`}
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {/* Add New City Row */}
              <div className="city-input-row">
                <input
                  className="city-text-input"
                  placeholder="Enter the name of the city"
                  value={newCityName}
                  onChange={(e) => {
                    setNewCityName(e.target.value);
                    setHasChanges(e.target.value.trim() !== "");
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCity();
                    }
                  }}
                  aria-label="New city name"
                  disabled={isLoading || !selectedProvinceId}
                />
                <div className="city-row-actions">
                  <button
                    type="button"
                    className="city-btn city-btn-add"
                    aria-label="Add city"
                    onClick={handleAddCity}
                    disabled={isLoading}
                  >
                    Add More
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="city-form-actions">
            <button
              type="button"
              className="city-btn city-btn-save"
              onClick={handleSaveChanges}
              disabled={isLoading || !hasChanges || !selectedProvinceId}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              className="city-btn city-btn-back"
              onClick={handleBack}
              disabled={isLoading}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Cities;