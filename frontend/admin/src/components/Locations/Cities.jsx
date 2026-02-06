import React, { useState, useContext, useEffect } from "react";
import "./Cities.css";
import { AdminContext } from "../../context/AdminContextProvider";
import Navbar from "../Navbar";

function Cities({ onBack }) {
  const { provinces, cities, addCity, updateCity, deleteCity } = useContext(AdminContext);
  const [selectedProvinceId, setSelectedProvinceId] = useState(null);
  const [filteredCities, setFilteredCities] = useState([]);
  const [newCityName, setNewCityName] = useState("");
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
    if (selectedProvinceId && cities) {
      const filtered = cities.filter(city => city.provinceId === selectedProvinceId);
      setFilteredCities([...filtered]);
    } else {
      setFilteredCities([]);
    }
  }, [selectedProvinceId, cities]);

  // Handle province selection change
  function handleProvinceChange(e) {
    if (hasChanges) {
      const confirmChange = window.confirm(
        "You have unsaved changes. Changing province will discard them. Continue?"
      );
      if (!confirmChange) return;
    }
    
    setSelectedProvinceId(Number(e.target.value));
    setNewCityName("");
    setHasChanges(false);
  }

  // Handle existing city name change
  function handleCityChange(index, newName) {
    const updatedCities = [...filteredCities];
    updatedCities[index] = {
      ...updatedCities[index],
      cityName: newName
    };
    setFilteredCities(updatedCities);
    setHasChanges(true);
  }

  // Add new city to the list
  function handleAddCity() {
    const cityName = newCityName.trim();
    
    if (!cityName) {
      alert("Please enter a city name.");
      return;
    }

    if (!selectedProvinceId) {
      alert("Please select a province first.");
      return;
    }

    // Add to local state with temporary ID
    const newCity = {
      ID: null,
      cityId: null,
      provinceId: selectedProvinceId,
      cityName: cityName
    };

    setFilteredCities(prev => [...prev, newCity]);
    setNewCityName("");
    setHasChanges(true);
  }

  // Delete a city
  async function handleDeleteCity(index) {
    const city = filteredCities[index];
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${city.cityName}"?`
    );
    
    if (!confirmDelete) return;

    setIsLoading(true);

    try {
      // If city has an ID, delete from backend
      if (city.ID && deleteCity) {
        await deleteCity(city.ID);
      }

      // Remove from local state
      const updatedCities = filteredCities.filter((_, i) => i !== index);
      setFilteredCities(updatedCities);
      setHasChanges(false);
    } catch (error) {
      console.error("Error deleting city:", error);
      alert("Failed to delete city. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Save all changes
  async function handleSaveChanges() {
    if (!selectedProvinceId) {
      alert("Please select a province.");
      return;
    }

    setIsLoading(true);

    try {
      const validCities = filteredCities.filter(city => city.cityName.trim() !== "");

      // Process each city
      for (const city of validCities) {
        if (city.ID) {
          // Update existing city
          if (updateCity) {
            await updateCity(city.ID, {
              cityName: city.cityName,
              provinceId: selectedProvinceId
            });
          }
        } else {
          // Add new city
          if (addCity) {
            await addCity({
              cityName: city.cityName,
              provinceId: selectedProvinceId
            });
          }
        }
      }

      alert(`Successfully saved ${validCities.length} city/cities!`);
      setHasChanges(false);
      setNewCityName("");
    } catch (error) {
      console.error("Error saving cities:", error);
      alert("Failed to save cities. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Handle back with unsaved changes warning
  function handleBack() {
    if (hasChanges) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmLeave) return;
    }
    
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
              {filteredCities.map((city, index) => (
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
                  onChange={(e) => setNewCityName(e.target.value)}
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
                    onClick={handleAddCity}
                    aria-label="Add city"
                    disabled={isLoading || !selectedProvinceId || !newCityName.trim()}
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