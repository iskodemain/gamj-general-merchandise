import React, { useState } from "react";
import "./Provinces.css";

function Provinces({ onBack }) {
  const [provinces, setProvinces] = useState(["Cavite", "Metro Manila"]);

  function handleChange(index, value) {
    const next = [...provinces];
    next[index] = value;
    setProvinces(next);
  }

  function handleAdd() {
    // add an empty input row for a new province
    setProvinces((prev) => [...prev, ""]);
  }

  function handleDelete(index) {
    const next = provinces.filter((_, i) => i !== index);
    // keep at least one empty input so UI doesn't collapse
    setProvinces(next.length ? next : [""]);
  }

  function handleSave() {
    console.log("Saved provinces:", provinces);
    alert("Saved " + provinces.filter(Boolean).length + " province(s).");
  }

  return (
    <div className="provinces-page" role="region" aria-label="Provinces form">
      <h1 className="prov-title">List of Provinces Available for Order Delivery.</h1>

      <div className="form-section">
        <label className="section-label">List of provinces</label>

        <div className="inputs-list">
          {provinces.map((p, i) => (
            <div className="input-row" key={i}>
              <input
                className="province-input"
                placeholder="Enter the name of the province."
                value={p}
                onChange={(e) => handleChange(i, e.target.value)}
                aria-label={`Province ${i + 1}`}
              />

              <div className="row-actions">
                {i === provinces.length - 1 ? (
                  <button
                    type="button"
                    className="btn btn-add"
                    onClick={handleAdd}
                    aria-label={`Add province after ${i + 1}`}
                  >
                    Add More
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-delete"
                    onClick={() => handleDelete(i)}
                    aria-label={`Delete province ${i + 1}`}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-save" onClick={handleSave}>
          Save Changes
        </button>
        <button
          type="button"
          className="btn btn-neutral"
          onClick={() => (onBack ? onBack() : window.history.back())}
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default Provinces;