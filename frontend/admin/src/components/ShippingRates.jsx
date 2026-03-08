import React, { useContext, useState, useEffect } from "react";
import "./ShippingRates.css";
import Navbar from "../components/Navbar.jsx";
import { AdminContext } from "../context/AdminContextProvider.jsx";
import { toast } from "react-toastify";
import Loading from "../components/Loading.jsx";

// ── Icons ──────────────────────────────────────────────────────────────────
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
  );
}
function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
    </svg>
  );
}
function ShipIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 0-1 1v8" />
      <rect x="9" y="11" width="14" height="10" rx="2" />
      <circle cx="12" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    </svg>
  );
}

// ── Empty row factory ──────────────────────────────────────────────────────
const makeEmptyRow = () => ({
  _key: Date.now() + Math.random(),
  isNew: true,
  ID: null,
  shippingRateId: null,
  provinceId: "",
  cityId: "",
  barangayId: "",
  fee: "",
  isActive: true,
});

// ── Main Component ─────────────────────────────────────────────────────────
function ShippingRates() {
  const {
    fetchShippingRates,
    addShippingRates,
    updateShippingRates,
    deleteShippingRates,
    handleFetchShippingRates,
    provinces,
    cities,
    barangays,
    toastSuccess,
    toastError,
  } = useContext(AdminContext);

  const [rows, setRows] = useState([makeEmptyRow()]);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // holds row to delete

  // ── Populate rows from fetched data ──────────────────────────────────────
  useEffect(() => {
    if (fetchShippingRates && fetchShippingRates.length > 0) {
      const mapped = fetchShippingRates.map((r) => ({
        _key: r.ID,
        isNew: false,
        ID: r.ID,
        shippingRateId: r.shippingRateId,
        provinceId: r.provinceId ? String(r.provinceId) : "",
        cityId: r.cityId ? String(r.cityId) : "",
        barangayId: r.barangayId ? String(r.barangayId) : "",
        fee: r.fee !== null && r.fee !== undefined ? String(r.fee) : "",
        isActive: r.isActive,
      }));
      setRows([...mapped, makeEmptyRow()]);
    } else {
      setRows([makeEmptyRow()]);
    }
  }, [fetchShippingRates]);

  // ── Filtered dropdowns per row ────────────────────────────────────────────
  const citiesFor = (provinceId) =>
    provinceId ? cities.filter((c) => String(c.provinceId) === String(provinceId)) : [];

  const barangaysFor = (provinceId, cityId) =>
    provinceId && cityId
      ? barangays.filter(
          (b) => String(b.provinceId) === String(provinceId) && String(b.cityId) === String(cityId)
        )
      : [];

  // ── Row change handler ────────────────────────────────────────────────────
  const handleChange = (idx, field, value) => {
    setRows((prev) => {
      const updated = prev.map((row, i) => {
        if (i !== idx) return row;
        const next = { ...row, [field]: value };
        // Reset downstream selects when province changes
        if (field === "provinceId") { next.cityId = ""; next.barangayId = ""; }
        if (field === "cityId") { next.barangayId = ""; }
        return next;
      });

      // Auto-add a new empty row when the last row gets a province
      const last = updated[updated.length - 1];
      if (field === "provinceId" && value && idx === updated.length - 1) {
        return [...updated, makeEmptyRow()];
      }
      return updated;
    });
  };

  // ── Delete handler ────────────────────────────────────────────────────────
  const handleDeleteRow = async (row) => {
    if (row.isNew) {
      // Just remove from local state if it's not the only row
      setRows((prev) => {
        if (prev.length === 1) return [makeEmptyRow()];
        return prev.filter((r) => r._key !== row._key);
      });
      return;
    }
    setDeleteConfirm(row);
  };

  const confirmDelete = async () => {
    const row = deleteConfirm;
    setDeleteConfirm(null);
    setLoading(true);
    const result = await deleteShippingRates(row.ID);
    setLoading(false);
    if (result) {
      toast.success("Shipping rate deleted.", { ...toastSuccess });
      await handleFetchShippingRates();
    }
  };

  // ── Save handler ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    // Validate all non-empty rows (rows that have a province selected)
    const dirtyRows = rows.filter((r) => r.provinceId !== "");

    if (dirtyRows.length === 0) {
      toast.error("Please add at least one shipping rate.", { ...toastError });
      return;
    }

    for (let i = 0; i < dirtyRows.length; i++) {
      const r = dirtyRows[i];
      if (!r.fee || isNaN(Number(r.fee)) || Number(r.fee) < 0) {
        toast.error(`Row ${i + 1}: Please enter a valid shipping fee.`, { ...toastError });
        return;
      }
    }

    setLoading(true);

    for (const row of dirtyRows) {
      const payload = {
        provinceId: Number(row.provinceId),
        cityId: row.cityId ? Number(row.cityId) : null,
        barangayId: row.barangayId ? Number(row.barangayId) : null,
        fee: Number(row.fee),
        isActive: row.isActive,
      };

      if (row.isNew) {
        const result = await addShippingRates(payload);
        if (!result) { setLoading(false); return; }
      } else {
        const result = await updateShippingRates({ ...payload, ID: row.ID });
        if (!result) { setLoading(false); return; }
      }
    }

    setLoading(false);
    toast.success("Shipping rates saved successfully!", { ...toastSuccess });
    await handleFetchShippingRates();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {loading && <Loading />}
      <Navbar TitleName="Shipping Rates" />

      <div className="sr-page">
        {/* Page Header */}
        <div className="sr-page-header">
          <div className="sr-header-left">
            <div className="sr-header-icon"><ShipIcon /></div>
            <div>
              <h1 className="sr-page-title">Shipping Rates</h1>
              <p className="sr-page-subtitle">Configure delivery fees by province, city, or barangay</p>
            </div>
          </div>
          <button className="sr-save-btn" onClick={handleSave}>
            <SaveIcon /><span>Save Changes</span>
          </button>
        </div>

        {/* Table Card */}
        <div className="sr-card">
          {/* Table Header */}
          <div className="sr-table-head">
            <div className="sr-col sr-col-province">Province <span className="sr-required">*</span></div>
            <div className="sr-col sr-col-city">City <span className="sr-optional">(optional)</span></div>
            <div className="sr-col sr-col-barangay">Barangay <span className="sr-optional">(optional)</span></div>
            <div className="sr-col sr-col-fee">Shipping Fee (₱)</div>
            <div className="sr-col sr-col-active">Active</div>
            <div className="sr-col sr-col-action"></div>
          </div>

          {/* Rows */}
          <div className="sr-table-body">
            {rows.map((row, idx) => {
              const isLastEmpty = row.isNew && !row.provinceId;
              const filteredCities = citiesFor(row.provinceId);
              const filteredBarangays = barangaysFor(row.provinceId, row.cityId);

              return (
                <div
                  key={row._key}
                  className={`sr-row ${row.isNew ? "sr-row--new" : ""} ${isLastEmpty ? "sr-row--placeholder" : ""}`}
                >
                  {/* Province */}
                  <div className="sr-col sr-col-province">
                    <div className="sr-select-wrap">
                      <select
                        className={`sr-select ${!row.provinceId ? "sr-select--placeholder" : ""}`}
                        value={row.provinceId}
                        onChange={(e) => handleChange(idx, "provinceId", e.target.value)}
                      >
                        <option value="" disabled hidden>Select Province</option>
                        {provinces.map((p) => (
                          <option key={p.ID} value={String(p.ID)}>{p.provinceName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* City */}
                  <div className="sr-col sr-col-city">
                    <div className="sr-select-wrap">
                      <select
                        className={`sr-select ${!row.cityId ? "sr-select--placeholder" : ""}`}
                        value={row.cityId}
                        onChange={(e) => handleChange(idx, "cityId", e.target.value)}
                        disabled={!row.provinceId}
                      >
                        <option value="">— Any City —</option>
                        {filteredCities.map((c) => (
                          <option key={c.ID} value={String(c.ID)}>{c.cityName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Barangay */}
                  <div className="sr-col sr-col-barangay">
                    <div className="sr-select-wrap">
                      <select
                        className={`sr-select ${!row.barangayId ? "sr-select--placeholder" : ""}`}
                        value={row.barangayId}
                        onChange={(e) => handleChange(idx, "barangayId", e.target.value)}
                        disabled={!row.cityId}
                      >
                        <option value="">— Any Barangay —</option>
                        {filteredBarangays.map((b) => (
                          <option key={b.ID} value={String(b.ID)}>{b.barangayName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Fee */}
                  <div className="sr-col sr-col-fee">
                    <div className="sr-fee-wrap">
                      <span className="sr-peso-sign">₱</span>
                      <input
                        type="number"
                        className="sr-fee-input"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={row.fee}
                        onChange={(e) => handleChange(idx, "fee", e.target.value)}
                        disabled={!row.provinceId}
                      />
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <div className="sr-col sr-col-active">
                    <label className="sr-toggle" title={row.isActive ? "Active" : "Inactive"}>
                      <input
                        type="checkbox"
                        checked={row.isActive}
                        onChange={(e) => handleChange(idx, "isActive", e.target.checked)}
                        disabled={!row.provinceId}
                      />
                      <span className="sr-toggle-track">
                        <span className="sr-toggle-thumb" />
                      </span>
                    </label>
                  </div>

                  {/* Action */}
                  <div className="sr-col sr-col-action">
                    {isLastEmpty ? (
                      <div className="sr-new-badge"><PlusIcon /><span>New</span></div>
                    ) : (
                      <button
                        className="sr-delete-btn"
                        onClick={() => handleDeleteRow(row)}
                        title="Delete this rate"
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty state */}
          {rows.length === 1 && rows[0].isNew && (
            <div className="sr-empty-state">
              <svg viewBox="0 0 64 64" width="44" height="44" fill="none" stroke="#c0ccd8" strokeWidth="1.5">
                <rect x="8" y="16" width="48" height="36" rx="4"/>
                <path d="M8 24h48"/><path d="M20 16V8h24v8"/>
                <circle cx="20" cy="36" r="4"/><circle cx="44" cy="36" r="4"/>
              </svg>
              <p>No shipping rates yet. Select a province above to add your first rate.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="sr-confirm-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="sr-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sr-confirm-icon">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            </div>
            <div className="sr-confirm-body">
              <h3 className="sr-confirm-title">Delete Shipping Rate?</h3>
              <p className="sr-confirm-desc">
                This will permanently remove the rate for <strong>{
                  provinces.find(p => String(p.ID) === String(deleteConfirm.provinceId))?.provinceName || "this location"
                }</strong>. This cannot be undone.
              </p>
            </div>
            <div className="sr-confirm-actions">
              <button className="sr-confirm-delete" onClick={confirmDelete}>Yes, Delete</button>
              <button className="sr-confirm-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ShippingRates;