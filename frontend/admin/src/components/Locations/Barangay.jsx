import React, { useState, useContext, useEffect } from "react";
import "./Barangay.css";
import { AdminContext } from "../../context/AdminContextProvider";
import Navbar from "../Navbar";

function Barangay({ onBack }) {
  const { provinces, cities, barangays, addBarangay, updateBarangay, deleteBarangay } = useContext(AdminContext);
  const [selectedProvinceId, setSelectedProvinceId] = useState(null);
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [filteredCities, setFilteredCities] = useState([]);
  const [filteredBarangays, setFilteredBarangays] = useState([]);
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
      setFilteredBarangays([...filtered]);
    } else {
      setFilteredBarangays([]);
    }
  }, [selectedCityId, selectedProvinceId, barangays]);

  // Handle province selection change
  function handleProvinceChange(e) {
    if (hasChanges) {
      const confirmChange = window.confirm(
        "You have unsaved changes. Changing province will discard them. Continue?"
      );
      if (!confirmChange) return;
    }
    
    setSelectedProvinceId(Number(e.target.value));
    setNewBarangayName("");
    setHasChanges(false);
  }

  // Handle city selection change
  function handleCityChange(e) {
    if (hasChanges) {
      const confirmChange = window.confirm(
        "You have unsaved changes. Changing city will discard them. Continue?"
      );
      if (!confirmChange) return;
    }
    
    setSelectedCityId(Number(e.target.value));
    setNewBarangayName("");
    setHasChanges(false);
  }

  // Handle existing barangay name change
  function handleBarangayChange(index, newName) {
    const updatedBarangays = [...filteredBarangays];
    updatedBarangays[index] = {
      ...updatedBarangays[index],
      barangayName: newName
    };
    setFilteredBarangays(updatedBarangays);
    setHasChanges(true);
  }

  // Add new barangay to the list
  function handleAddBarangay() {
    const barangayName = newBarangayName.trim();
    
    if (!barangayName) {
      alert("Please enter a barangay name.");
      return;
    }

    if (!selectedProvinceId) {
      alert("Please select a province first.");
      return;
    }

    if (!selectedCityId) {
      alert("Please select a city first.");
      return;
    }

    // Add to local state with temporary ID
    const newBarangay = {
      ID: null,
      barangayId: null,
      provinceId: selectedProvinceId,
      cityId: selectedCityId,
      barangayName: barangayName
    };

    setFilteredBarangays(prev => [...prev, newBarangay]);
    setNewBarangayName("");
    setHasChanges(true);
  }

  // Delete a barangay
  async function handleDeleteBarangay(index) {
    const barangay = filteredBarangays[index];
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${barangay.barangayName}"?`
    );
    
    if (!confirmDelete) return;

    setIsLoading(true);

    try {
      // If barangay has an ID, delete from backend
      if (barangay.ID && deleteBarangay) {
        await deleteBarangay(barangay.ID);
      }

      // Remove from local state
      const updatedBarangays = filteredBarangays.filter((_, i) => i !== index);
      setFilteredBarangays(updatedBarangays);
      setHasChanges(false);
    } catch (error) {
      console.error("Error deleting barangay:", error);
      alert("Failed to delete barangay. Please try again.");
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

    if (!selectedCityId) {
      alert("Please select a city.");
      return;
    }

    setIsLoading(true);

    try {
      const validBarangays = filteredBarangays.filter(barangay => barangay.barangayName.trim() !== "");

      // Process each barangay
      for (const barangay of validBarangays) {
        if (barangay.ID) {
          // Update existing barangay
          if (updateBarangay) {
            await updateBarangay(barangay.ID, {
              barangayName: barangay.barangayName,
              cityId: selectedCityId,
              provinceId: selectedProvinceId
            });
          }
        } else {
          // Add new barangay
          if (addBarangay) {
            await addBarangay({
              barangayName: barangay.barangayName,
              cityId: selectedCityId,
              provinceId: selectedProvinceId
            });
          }
        }
      }

      alert(`Successfully saved ${validBarangays.length} barangay(s)!`);
      setHasChanges(false);
      setNewBarangayName("");
    } catch (error) {
      console.error("Error saving barangays:", error);
      alert("Failed to save barangays. Please try again.");
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
              {filteredBarangays.map((barangay, index) => (
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
                  onChange={(e) => setNewBarangayName(e.target.value)}
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
                    disabled={isLoading || !selectedCityId || !newBarangayName.trim()}
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