import React, { useState, useContext, useEffect } from "react";
import "./Barangay.css";
import { AdminContext } from "../../context/AdminContextProvider";
import Navbar from "../Navbar";
import { toast } from "react-toastify";

function Barangay({ onBack }) {
  const { provinces, cities, barangays, addBarangay, updateBarangay, deleteBarangay, toastSuccess  } = useContext(AdminContext);
  const [selectedProvinceId, setSelectedProvinceId] = useState(null);
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [filteredCities, setFilteredCities] = useState([]);
  const [barangaysList, setBarangaysList] = useState([]);
  const [newBarangayName, setNewBarangayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize with first province
  useEffect(() => {
    if (provinces && provinces.length > 0 && !selectedProvinceId) {
      setSelectedProvinceId(provinces[0].ID);
    }
  }, [provinces, selectedProvinceId]);

  // Filter cities when province changes
  useEffect(() => {
    if (selectedProvinceId && cities) {
      const filtered = cities.filter(city => city.provinceId === selectedProvinceId);
      setFilteredCities(filtered);
      
      // Auto-select first city in the filtered list
      if (filtered.length > 0) {
        setSelectedCityId(filtered[0].ID);
      } else {
        setSelectedCityId(null);
      }
    } else {
      setFilteredCities([]);
      setSelectedCityId(null);
    }
  }, [selectedProvinceId, cities]);

  // Filter barangays when city changes
  useEffect(() => {
    if (selectedCityId && selectedProvinceId && barangays) {
      const filtered = barangays.filter(
        barangay => barangay.cityId === selectedCityId && barangay.provinceId === selectedProvinceId
      );
      setBarangaysList([...filtered]);
    } else {
      setBarangaysList([]);
    }
  }, [selectedCityId, selectedProvinceId, barangays]);

  // Handle province selection change
  function handleProvinceChange(e) {
    setSelectedProvinceId(Number(e.target.value));
  }

  // Handle city selection change
  function handleCityChange(e) {
    setSelectedCityId(Number(e.target.value));
  }

  function handleAddBarangay() {
    const name = newBarangayName.trim();
    if (!name || !selectedCityId || !selectedProvinceId) return;

    setBarangaysList(prev => [
      ...prev,
      {
        ID: Date.now(),       // temp ID for React rendering
        isNew: true,
        barangayName: name,
        cityId: selectedCityId,
        provinceId: selectedProvinceId
      }
    ]);

    setNewBarangayName("");
    setHasChanges(true);
  }

  // Handle existing barangay name change
  function handleBarangayChange(index, value) {
    const updated = [...barangaysList];
    updated[index] = { ...updated[index], barangayName: value };
    setBarangaysList(updated);
    setHasChanges(true);
  }

  // Delete a barangay
  async function handleDeleteBarangay(index) {
    const barangay = barangaysList[index];

    if (barangay.isNew) {
      setBarangaysList(prev => prev.filter((_, i) => i !== index));
      setHasChanges(true);
      return;
    }

    setIsLoading(true);
    const deleted = await deleteBarangay(barangay.ID);
    setIsLoading(false);

    if (deleted) {
      setBarangaysList(prev => prev.filter((_, i) => i !== index));
      toast.success("Barangay deleted successfully!", toastSuccess);
    }
  }

  // Save all changes
  async function handleSaveChanges() {
    setIsLoading(true);

    let created = 0;
    let updated = 0;

    // Create array with all barangays to save
    const allBarangaysToSave = [...barangaysList];

    // Add the pending barangay from input field if it has a value
    const pendingBarangayName = newBarangayName.trim();
    if (pendingBarangayName && selectedCityId && selectedProvinceId) {
      allBarangaysToSave.push({
        ID: Date.now(),
        isNew: true,
        barangayName: pendingBarangayName,
        cityId: selectedCityId,
        provinceId: selectedProvinceId
      });
    }

    // Loop through allBarangaysToSave
    for (const barangay of allBarangaysToSave) {
      const name = barangay.barangayName.trim();
      if (!name) continue;

      if (barangay.isNew) {
        const res = await addBarangay({
          barangayName: name,
          cityId: selectedCityId,
          provinceId: selectedProvinceId
        });
        if (res) created++;
        continue;
      }

      const original = barangays.find(b => b.ID === barangay.ID);
      if (original && original.barangayName !== name) {
        const res = await updateBarangay({
          barangayID: barangay.ID,
          barangayName: name,
          cityId: selectedCityId,
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

  // Get selected province and city names for display
  const selectedProvince = provinces?.find(p => p.ID === selectedProvinceId);
  const selectedCity = filteredCities?.find(c => c.ID === selectedCityId);

  return (
    <>
      <Navbar TitleName="Barangays" />
      <div className="barangay-page-container">
        <div className="barangay-content-card" role="region" aria-label="Barangays management">
          <div className="barangay-header">
            <h2 className="barangay-page-title">List of Barangays Available for Order Delivery</h2>
          </div>

          {/* Province Selector */}
          <div className="barangay-province-section">
            <label className="barangay-section-label" htmlFor="barangay-province-select">
              Select a province
            </label>
            <div className="barangay-selector-row">
              <select
                id="barangay-province-select"
                className="barangay-select"
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

          {/* City Selector */}
          <div className="barangay-city-section">
            <label className="barangay-section-label" htmlFor="barangay-city-select">
              Select a city
            </label>
            <div className="barangay-selector-row">
              <select
                id="barangay-city-select"
                className="barangay-select"
                value={selectedCityId || ""}
                onChange={handleCityChange}
                aria-label="Select city"
                disabled={isLoading || !filteredCities || filteredCities.length === 0}
              >
                {!filteredCities || filteredCities.length === 0 ? (
                  <option value="">No cities available for this province</option>
                ) : (
                  filteredCities.map(city => (
                    <option key={city.ID} value={city.ID}>
                      {city.cityName}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Barangays List */}
          <div className="barangay-form-section">
            <label className="barangay-section-label">
              List of barangays in {selectedCity?.cityName || "selected city"}, {selectedProvince?.provinceName || ""}
            </label>

            <div className="barangay-inputs-list">
              {/* Existing Barangays */}
              {barangaysList.map((barangay, index) => (
                <div className="barangay-input-row" key={index}>
                  <input
                    className="barangay-text-input"
                    value={barangay.barangayName}
                    onChange={(e) => handleBarangayChange(index, e.target.value)}
                    aria-label={`Barangay ${barangay.barangayName}`}
                    disabled={isLoading}
                    placeholder="Barangay name"
                  />
                  <div className="barangay-row-actions">
                    <button
                      type="button"
                      className="barangay-btn barangay-btn-delete"
                      onClick={() => handleDeleteBarangay(index)}
                      aria-label={`Delete ${barangay.barangayName}`}
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {/* Add New Barangay Row */}
              <div className="barangay-input-row">
                <input
                  className="barangay-text-input"
                  placeholder="Enter the name of the barangay"
                  value={newBarangayName}
                  onChange={(e) => {
                    setNewBarangayName(e.target.value);
                    setHasChanges(e.target.value.trim() !== "");
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddBarangay();
                    }
                  }}
                  aria-label="New barangay name"
                  disabled={isLoading || !selectedCityId}
                />
                <div className="barangay-row-actions">
                  <button
                    type="button"
                    className="barangay-btn barangay-btn-add"
                    onClick={handleAddBarangay}
                    aria-label="Add barangay"
                    disabled={isLoading}
                  >
                    Add More
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="barangay-form-actions">
            <button
              type="button"
              className="barangay-btn barangay-btn-save"
              onClick={handleSaveChanges}
              disabled={isLoading || !hasChanges || !selectedCityId}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              className="barangay-btn barangay-btn-back"
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

export default Barangay;