import React, { useContext, useMemo, useState } from "react";
import "./BatchList.css";
import Navbar from "../Navbar";
import { AdminContext } from "../../context/AdminContextProvider";

export default function BatchList() {
  const {
    navigate,
    fetchInventoryBatch = [],
    fetchInventoryStock = [],
    products = [],
    productVariantValues = [],
    productVariantCombination = [],
  } = useContext(AdminContext);

  // UI state
  const [query, setQuery] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterExpiry, setFilterExpiry] = useState("all");
  const [showLowOnly, setShowLowOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  // Helper: Resolve product name
  const resolveProduct = (productId) => {
    const p = products.find((x) => x.ID === productId);
    return p ? p.productName : "Unknown Product";
  };

  // Helper: Resolve variant display
  const resolveVariant = (batch) => {
    if (batch.variantCombinationId) {
      const combo = productVariantCombination.find((c) => c.ID === batch.variantCombinationId);
      return combo ? combo.combinations : "-";
    }
    if (batch.variantValueId) {
      const v = productVariantValues.find((v) => v.ID === batch.variantValueId);
      return v ? v.value : "-";
    }
    return "No Variant";
  };

  // Helper: Format date
  const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };

  // Helper: Calculate days until expiration
  const daysUntil = (isoDate) => {
    if (!isoDate) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const d = new Date(isoDate);
    d.setHours(0, 0, 0, 0);
    const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Helper: Find low stock threshold for a batch
  const findLowThreshold = (batch) => {
    const stockRow = fetchInventoryStock.find((s) => {
      if (s.productId !== batch.productId) return false;
      
      // Match variant combination
      if (batch.variantCombinationId && s.variantCombinationId === batch.variantCombinationId) {
        return true;
      }
      
      // Match variant value
      if (batch.variantValueId && s.variantValueId === batch.variantValueId) {
        return true;
      }
      
      // Match no variants (both null)
      if (!batch.variantCombinationId && !batch.variantValueId && 
          !s.variantCombinationId && !s.variantValueId) {
        return true;
      }
      
      return false;
    });
    
    return stockRow ? Number(stockRow.lowStockThreshold || 0) : 10; // Default threshold: 10
  };

  // Build supplier list for filter
  const supplierOptions = useMemo(() => {
    const set = new Set();
    fetchInventoryBatch.forEach((b) => {
      if (b.supplier && b.supplier.trim()) {
        set.add(b.supplier.trim());
      }
    });
    return Array.from(set).sort();
  }, [fetchInventoryBatch]);

  // Prepare display rows
  const rows = useMemo(() => {
    // Map all batches with computed fields
    const list = fetchInventoryBatch.map((b) => {
      const productName = resolveProduct(b.productId);
      const variantLabel = resolveVariant(b);
      const expDays = daysUntil(b.expirationDate);
      const lowThresh = findLowThreshold(b);
      const isLow = Number(b.remainingQuantity) <= lowThresh;
      
      // Determine expiration status
      let expirationStatus = "ok";
      if (b.expirationDate === null || b.expirationDate === undefined) {
        expirationStatus = "noexpiry";
      } else if (expDays !== null) {
        if (expDays < 0) {
          expirationStatus = "expired";
        } else if (expDays <= 30) {
          expirationStatus = "near";
        }
      }

      return {
        ...b,
        productName,
        variantLabel,
        expirationDays: expDays,
        lowStockThreshold: lowThresh,
        isLow,
        expirationStatus,
      };
    });

    // Apply search filter
    let filtered = list;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      filtered = filtered.filter((r) => {
        const searchText = [
          r.batchId || "",
          r.batchNumber || "",
          r.productName || "",
          r.variantLabel || "",
          r.supplier || "",
          r.notes || ""
        ].join(" ").toLowerCase();
        
        return searchText.includes(q);
      });
    }

    // Apply supplier filter
    if (filterSupplier) {
      filtered = filtered.filter((r) => r.supplier === filterSupplier);
    }

    // Apply expiry filter
    if (filterExpiry !== "all") {
      filtered = filtered.filter((r) => r.expirationStatus === filterExpiry);
    }

    // Apply low stock filter
    if (showLowOnly) {
      filtered = filtered.filter((r) => r.isLow);
    }

    // Apply sorting
    const sorted = [...filtered];
    switch (sortBy) {
      case "newest":
        sorted.sort((a, b) => new Date(b.dateReceived) - new Date(a.dateReceived));
        break;
      case "oldest":
        sorted.sort((a, b) => new Date(a.dateReceived) - new Date(b.dateReceived));
        break;
      case "rem-asc":
        sorted.sort((a, b) => Number(a.remainingQuantity) - Number(b.remainingQuantity));
        break;
      case "rem-desc":
        sorted.sort((a, b) => Number(b.remainingQuantity) - Number(a.remainingQuantity));
        break;
      default:
        break;
    }

    return sorted;
  }, [
    fetchInventoryBatch,
    fetchInventoryStock,
    products,
    productVariantValues,
    productVariantCombination,
    query,
    filterSupplier,
    filterExpiry,
    showLowOnly,
    sortBy,
  ]);

  // Handler: View batch details
  const handleView = (batch) => {
    // Navigate to batch detail page or open modal
    console.log("View batch:", batch);
    // Example: navigate(`/admin/inventory/batch/${batch.ID}`);
  };

  // Get display status
  const getStatusDisplay = (row) => {
    if (row.expirationStatus === "expired") return { text: "EXPIRED", class: "expired" };
    if (row.isLow) return { text: "LOW STOCK", class: "low" };
    if (row.expirationStatus === "near") return { text: "EXPIRING SOON", class: "near" };
    if (row.expirationStatus === "noexpiry") return { text: "NO EXPIRY", class: "noexpiry" };
    return { text: "ACTIVE", class: "ok" };
  };

  return (
    <>
      <Navbar TitleName="Batch List" />

      <div className="batchlist-container">
        <div className="batchlist-wrapper">
          
          {/* Header */}
          <div className="batchlist-header">
            <div className="batchlist-title-section">
              <h1 className="batchlist-title">Inventory Batches</h1>
              <p className="batchlist-subtitle">
                Showing {rows.length} of {fetchInventoryBatch.length} batches
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="batchlist-controls">
            {/* Search */}
            <div className="batchlist-search-wrapper">
              <input
                type="text"
                className="batchlist-search"
                placeholder="🔍 Search batch, product, supplier..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="batchlist-filters">
              <select 
                className="batchlist-select"
                value={filterSupplier} 
                onChange={(e) => setFilterSupplier(e.target.value)}
              >
                <option value="">All Suppliers</option>
                {supplierOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select 
                className="batchlist-select"
                value={filterExpiry} 
                onChange={(e) => setFilterExpiry(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="expired">Expired</option>
                <option value="near">Expiring Soon (≤30 days)</option>
                <option value="noexpiry">No Expiry Date</option>
                <option value="ok">Active</option>
              </select>

              <select 
                className="batchlist-select"
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="rem-desc">Highest Stock</option>
                <option value="rem-asc">Lowest Stock</option>
              </select>

              <label className="batchlist-checkbox">
                <input 
                  type="checkbox" 
                  checked={showLowOnly} 
                  onChange={(e) => setShowLowOnly(e.target.checked)} 
                />
                <span>Low Stock Only</span>
              </label>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="batchlist-table-container">
            <table className="batchlist-table">
              <thead>
                <tr>
                  <th>Batch Number</th>
                  <th>Product</th>
                  <th>Variant</th>
                  <th>Received</th>
                  <th>Remaining</th>
                  <th>Supplier</th>
                  <th>Expiration</th>
                  <th>Date Received</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="batchlist-empty">
                      {query || filterSupplier || filterExpiry !== "all" || showLowOnly
                        ? "🔍 No batches match your filters"
                        : " No batches available"}
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const status = getStatusDisplay(row);
                    
                    return (
                      <tr 
                        key={row.ID} 
                        className={`batchlist-row ${status.class}`}
                      >
                        <td className="batchlist-cell-batch">
                          {row.batchNumber || row.batchId || "-"}
                        </td>
                        <td className="batchlist-cell-product">
                          <strong>{row.productName}</strong>
                        </td>
                        <td className="batchlist-cell-variant">
                          {row.variantLabel}
                        </td>
                        <td className="batchlist-cell-qty">
                          {row.quantityReceived}
                        </td>
                        <td className="batchlist-cell-remaining">
                          <span className={`batchlist-qty-badge ${row.isLow ? "low" : ""}`}>
                            {row.remainingQuantity}
                          </span>
                        </td>
                        <td className="batchlist-cell-supplier">
                          {row.supplier || "-"}
                        </td>
                        <td className="batchlist-cell-expiry">
                          {row.expirationDate ? (
                            <div>
                              <div>{formatDate(row.expirationDate)}</div>
                              {row.expirationDays !== null && (
                                <div className="batchlist-expiry-days">
                                  {row.expirationDays < 0 
                                    ? `${Math.abs(row.expirationDays)} days ago` 
                                    : `${row.expirationDays} days left`}
                                </div>
                              )}
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="batchlist-cell-date">
                          {formatDate(row.dateReceived)}
                        </td>
                        <td className="batchlist-cell-status">
                          <span className={`batchlist-status-badge ${status.class}`}>
                            {status.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="batchlist-cards">
            {rows.length === 0 ? (
              <div className="batchlist-empty-cards">
                {query || filterSupplier || filterExpiry !== "all" || showLowOnly
                  ? "🔍 No batches match your filters"
                  : "No batches available"}
              </div>
            ) : (
              rows.map((row) => {
                const status = getStatusDisplay(row);
                
                return (
                  <div key={row.ID} className={`batchlist-card ${status.class}`}>
                    <div className="batchlist-card-header">
                      <div className="batchlist-card-title">
                        {row.batchNumber || row.batchId || "No Batch #"}
                      </div>
                      <span className={`batchlist-status-badge ${status.class}`}>
                        {status.text}
                      </span>
                    </div>

                    <div className="batchlist-card-body">
                      <div className="batchlist-card-row">
                        <span className="batchlist-card-label">Product:</span>
                        <span className="batchlist-card-value">{row.productName}</span>
                      </div>

                      <div className="batchlist-card-row">
                        <span className="batchlist-card-label">Variant:</span>
                        <span className="batchlist-card-value">{row.variantLabel}</span>
                      </div>

                      <div className="batchlist-card-row">
                        <span className="batchlist-card-label">Received:</span>
                        <span className="batchlist-card-value">{row.quantityReceived}</span>
                      </div>

                      <div className="batchlist-card-row">
                        <span className="batchlist-card-label">Remaining:</span>
                        <span className={`batchlist-card-value ${row.isLow ? "low" : ""}`}>
                          {row.remainingQuantity} {row.isLow && "⚠️"}
                        </span>
                      </div>

                      <div className="batchlist-card-row">
                        <span className="batchlist-card-label">Supplier:</span>
                        <span className="batchlist-card-value">{row.supplier || "-"}</span>
                      </div>

                      <div className="batchlist-card-row">
                        <span className="batchlist-card-label">Expiration:</span>
                        <span className="batchlist-card-value">
                          {row.expirationDate ? formatDate(row.expirationDate) : "—"}
                        </span>
                      </div>

                      <div className="batchlist-card-row">
                        <span className="batchlist-card-label">Date Received:</span>
                        <span className="batchlist-card-value">
                          {formatDate(row.dateReceived)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </>
  );
}