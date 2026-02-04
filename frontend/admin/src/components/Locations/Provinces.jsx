import React, { useContext, useState, useEffect } from "react";
import "./Provinces.css";
import { AdminContext } from "../../context/AdminContextProvider";

function Provinces({ onBack }) {
  const { provinces, addProvince, updateProvince, deleteProvince } = useContext(AdminContext);
  const [provincesList, setProvincesList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize provinces list from context
  useEffect(() => {
    if (provinces && provinces.length > 0) {
      setProvincesList([...provinces]);
    } else {
      // Start with one empty row if no provinces exist
      setProvincesList([{ ID: null, provinceId: null, provinceName: "" }]);
    }
  }, [provinces]);

  // Handle input change for existing or new provinces
  function handleChange(index, value) {
    const updatedList = [...provincesList];
    updatedList[index] = {
      ...updatedList[index],
      provinceName: value
    };
    setProvincesList(updatedList);
    setHasChanges(true);
  }

  // Add a new empty province row
  function handleAdd() {
    setProvincesList((prev) => [
      ...prev,
      { ID: null, provinceId: null, provinceName: "" }
    ]);
    setHasChanges(true);
  }

  // Delete a province
  async function handleDelete(index) {
    const province = provincesList[index];
    
    // Confirm deletion
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${province.provinceName || 'this province'}"?`
    );
    
    if (!confirmDelete) return;

    setIsLoading(true);

    try {
      // If province has an ID, delete from backend
      if (province.ID && deleteProvince) {
        await deleteProvince(province.ID);
      }
      
      // Remove from local state
      const updatedList = provincesList.filter((_, i) => i !== index);
      
      // Keep at least one empty input
      if (updatedList.length === 0) {
        setProvincesList([{ ID: null, provinceId: null, provinceName: "" }]);
      } else {
        setProvincesList(updatedList);
      }
      
      setHasChanges(false);
    } catch (error) {
      console.error("Error deleting province:", error);
      alert("Failed to delete province. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Save all changes
  async function handleSave() {
    setIsLoading(true);

    try {
      const validProvinces = provincesList.filter(p => p.provinceName.trim() !== "");
      
      if (validProvinces.length === 0) {
        alert("Please add at least one province before saving.");
        setIsLoading(false);
        return;
      }

      // Process each province
      for (const province of validProvinces) {
        if (province.ID) {
          // Update existing province
          if (updateProvince) {
            await updateProvince(province.ID, { provinceName: province.provinceName });
          }
        } else {
          // Add new province
          if (addProvince) {
            await addProvince({ provinceName: province.provinceName });
          }
        }
      }

      alert(`Successfully saved ${validProvinces.length} province(s)!`);
      setHasChanges(false);
      
      // Optionally go back after save
      // if (onBack) onBack();
    } catch (error) {
      console.error("Error saving provinces:", error);
      alert("Failed to save provinces. Please try again.");
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

  return (
    <div className="province-page-container" role="region" aria-label="Provinces management">
      <div className="province-content-card">
        <h1 className="province-page-title">List of Provinces Available for Order Delivery</h1>

        <div className="province-form-section">
          <label className="province-section-label">Manage Provinces</label>

          <div className="province-inputs-list">
            {provincesList.map((province, index) => (
              <div className="province-input-row" key={index}>
                <input
                  className="province-text-input"
                  placeholder="Enter the name of the province"
                  value={province.provinceName || ""}
                  onChange={(e) => handleChange(index, e.target.value)}
                  aria-label={`Province ${index + 1}`}
                  disabled={isLoading}
                />

                <div className="province-row-actions">
                  {index === provincesList.length - 1 ? (
                    <button
                      type="button"
                      className="province-btn province-btn-add"
                      onClick={handleAdd}
                      aria-label="Add new province"
                      disabled={isLoading}
                    >
                      Add More
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="province-btn province-btn-delete"
                      onClick={() => handleDelete(index)}
                      aria-label={`Delete ${province.provinceName || 'province'}`}
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="province-form-actions">
          <button
            type="button"
            className="province-btn province-btn-save"
            onClick={handleSave}
            disabled={isLoading || !hasChanges}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            className="province-btn province-btn-back"
            onClick={handleBack}
            disabled={isLoading}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default Provinces;