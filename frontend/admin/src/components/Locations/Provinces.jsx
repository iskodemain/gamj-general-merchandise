import React, { useContext, useState, useEffect } from "react";
import "./Provinces.css";
import { AdminContext } from "../../context/AdminContextProvider";
import { toast } from 'react-toastify';
import Navbar from "../Navbar";

function Provinces({ onBack }) {
  const { provinces, addProvince, updateProvince, deleteProvince, toastSuccess } = useContext(AdminContext);
  const [provincesList, setProvincesList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize provinces list from context
  useEffect(() => {
    if (provinces && provinces.length > 0) {
      setProvincesList([...provinces]);
    } else {
      // Start with one empty row if no provinces exist
      setProvincesList([{ ID: Date.now(), isNew: true, provinceName: "" }]);
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
      { ID: Date.now(), isNew: true, provinceName: "" }
    ]);
    setHasChanges(true);
  }

  // Delete a province
  async function handleDelete(index) {
    const province = provincesList[index];

    if (province.isNew) {
      setProvincesList(prev => prev.filter((_, i) => i !== index));
      setHasChanges(true);
      return;
    }

    setIsLoading(true);
    const deleted = await deleteProvince(province.ID);
    setIsLoading(false);

    if (deleted) {
      // Remove from UI
      setProvincesList(prev => prev.filter((_, i) => i !== index));
      toast.success("Province deleted successfully!", toastSuccess);
    }
  }

  // Save all changes
  const handleSave = async () => {
    setIsLoading(true);

    let createdCount = 0;
    let updatedCount = 0;

    for (const prov of provincesList) {
      const name = prov.provinceName.trim();
      if (!name) continue;

      // NEW CATEGORY
      if (prov.isNew) {
        const created = await addProvince({ provinceName: name });
        if (created) createdCount++;
        continue;
      }

      // EXISTING CATEGORY — only update if changed
      const original = provinces.find(p => p.ID === prov.ID);

      if (original && original.provinceName !== name) {
        const updated = await updateProvince({
          provinceID: prov.ID,
          provinceName: name
        });

        if (updated) updatedCount++;
      }
    }

    setIsLoading(false);

    if (createdCount > 0 || updatedCount > 0) {
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

  return (
    <>
      <Navbar TitleName="Provinces" />
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
    </>
  );
}

export default Provinces;