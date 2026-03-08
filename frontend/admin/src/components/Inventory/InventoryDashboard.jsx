import { useContext, useState, useMemo, useEffect } from 'react';
import './InventoryDashboard.css';
import Navbar from '../Navbar';
import { AdminContext } from '../../context/AdminContextProvider';
import { FiSettings, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Loading from '../Loading.jsx';

export default function InventoryDashboard() {
  const {
    navigate,
    fetchInventoryStock,
    products,
    productVariantValues,
    productVariantCombination,
    currentUser,
    toastError,
    toastSuccess,
    fetchInventorySettings,
    addInventorySettings,
    updateInventorySettings,
    deleteInventorySettings
  } = useContext(AdminContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('product'); 
  const [filterStatus, setFilterStatus] = useState('all'); 
  const [loading, setLoading] = useState(false); 

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSettingsId, setEditingSettingsId] = useState(null);
  const [thresholdProduct, setThresholdProduct] = useState('');
  const [thresholdVariant, setThresholdVariant] = useState('');
  const [thresholdCombo, setThresholdCombo] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('');
  const [thresholdLoading, setThresholdLoading] = useState(false);

  const selectedProductData = products.find(p => p.ID === Number(thresholdProduct));
  const hasVariants = selectedProductData?.hasVariant;
  const hasVariantCombination = selectedProductData?.hasVariantCombination;

  useEffect(() => {
    if (!isEditMode) {
      setThresholdVariant('');
      setThresholdCombo('');
    }
  }, [thresholdProduct, isEditMode]);

  // ✅ Helper: Find threshold for a stock item
  const getThresholdForStock = (stock) => {
    const setting = fetchInventorySettings.find(s => 
      s.productId === stock.productId &&
      s.variantValueId === stock.variantValueId &&
      s.variantCombinationId === stock.variantCombinationId
    );
    return setting;
  };

  const resolveVariant = (stock) => {
    if (stock.variantCombinationId) {
      const combo = productVariantCombination.find(c => c.ID === stock.variantCombinationId);
      return combo ? combo.combinations : '-';
    }
    if (stock.variantValueId) {
      const single = productVariantValues.find(v => v.ID === stock.variantValueId);
      return single ? single.value : '-';
    }
    return '-';
  };

  const resolveProductName = (id) => {
    const p = products.find(pr => pr.ID === id);
    return p ? p.productName : 'Unknown';
  };

  const resolveUnitDetails = (productId) => {
    const product = products.find(p => p.ID === productId);

    if (!product) {
      return { unitType: '-', piecesPerBox: '-' };
    }

    const unitType = product.unitType || '-';

    let piecesPerBox = '-';

    if (unitType === 'PIECE') {
      piecesPerBox = 'N/A';
    } else {
      piecesPerBox = product.piecesPerBox ?? '-';
    }

    return { unitType, piecesPerBox };
  };

  const computeStatus = (qty, thresholdSettings) => {
    if (qty === 0) return 'OUT';
    if (!thresholdSettings) return 'OK'; // No threshold set
    return qty <= thresholdSettings.lowStockThreshold ? 'LOW' : 'OK';
  };

  // ── Filtered & Sorted Data ───────────────────────────────────────────────
  const filteredAndSortedData = useMemo(() => {
    let result = [...fetchInventoryStock];

    if (searchTerm) {
      const search = searchTerm.trim().toLowerCase();

      result = result.filter(stock => {
        const product = products.find(p => p.ID === stock.productId);

        const productName = resolveProductName(stock.productId).toLowerCase();
        const variant = resolveVariant(stock).toLowerCase();

        const unitType = product?.unitType?.toLowerCase() || '';
        const piecesPerBox = product?.piecesPerBox?.toString() || '';

        const stockQty = stock.totalQuantity?.toString() || '';

        const thresholdSettings = getThresholdForStock(stock);
        const status = computeStatus(stock.totalQuantity, thresholdSettings).toLowerCase();

        const productId = stock.productId?.toString() || '';

        return (
          productName.includes(search) ||
          variant.includes(search) ||
          unitType.includes(search) ||
          piecesPerBox.includes(search) ||
          stockQty.includes(search) ||
          status.includes(search) ||
          productId.includes(search)
        );
      });
    }

    if (filterStatus !== 'all') {
      result = result.filter(stock => {
        const thresholdSettings = getThresholdForStock(stock);
        const status = computeStatus(stock.totalQuantity, thresholdSettings);
        return status.toLowerCase() === filterStatus.toLowerCase();
      });
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'product':
          return resolveProductName(a.productId).localeCompare(resolveProductName(b.productId));
        case 'stock-asc':
          return a.totalQuantity - b.totalQuantity;
        case 'stock-desc':
          return b.totalQuantity - a.totalQuantity;
        case 'status': {
          const statusOrder = { OUT: 0, LOW: 1, OK: 2 };
          const thresholdA = getThresholdForStock(a);
          const thresholdB = getThresholdForStock(b);
          return statusOrder[computeStatus(a.totalQuantity, thresholdA)]
               - statusOrder[computeStatus(b.totalQuantity, thresholdB)];
        }
        default:
          return 0;
      }
    });

    return result;
  }, [fetchInventoryStock, searchTerm, sortBy, filterStatus, products, productVariantValues, productVariantCombination, fetchInventorySettings]);

  // ── Statistics ───────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = fetchInventoryStock.length;
    const low = fetchInventoryStock.filter(s => {
      const thresholdSettings = getThresholdForStock(s);
      return computeStatus(s.totalQuantity, thresholdSettings) === 'LOW';
    }).length;
    const out = fetchInventoryStock.filter(s => s.totalQuantity === 0).length;
    const ok  = total - low - out;
    return { total, low, out, ok };
  }, [fetchInventoryStock, fetchInventorySettings]);

  // ── Modal Helpers ────────────────────────────────────────────────────────
  const openAddModal = () => {
    setIsEditMode(false);
    setEditingSettingsId(null);
    setThresholdProduct('');
    setThresholdVariant('');
    setThresholdCombo('');
    setLowStockThreshold('');
    setShowModal(true);
  };

  const openEditModal = (stock) => {
    const thresholdSettings = getThresholdForStock(stock);
    if (!thresholdSettings) return;

    setIsEditMode(true);
    setEditingSettingsId(thresholdSettings.ID);
    setThresholdProduct(String(stock.productId));
    setThresholdVariant(stock.variantValueId ? String(stock.variantValueId) : '');
    setThresholdCombo(stock.variantCombinationId ? String(stock.variantCombinationId) : '');
    setLowStockThreshold(String(thresholdSettings.lowStockThreshold));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setEditingSettingsId(null);
  };

  const isFormValid = () => {
    if (!thresholdProduct) return false;
    if (lowStockThreshold === '' || Number(lowStockThreshold) < 1) return false;
    if (!isEditMode) {
      if (hasVariantCombination && !thresholdCombo) return false;
      if (hasVariants && !hasVariantCombination && !thresholdVariant) return false;
    }
    return true;
  };

  // ✅ ADD/UPDATE HANDLER
  const handleThresholdSubmit = async (e) => {
    e.preventDefault();

    if (!thresholdProduct) {
      toast.error('Please select a product', { ...toastError });
      return;
    }
    if (lowStockThreshold === '' || Number(lowStockThreshold) < 1) {
      toast.error('Please enter a valid low stock threshold.', { ...toastError });
      return;
    }

    if (!isEditMode) {
      if (hasVariantCombination && !thresholdCombo) {
        toast.error('This product requires a variant combination', { ...toastError });
        return;
      }
      if (hasVariants && !hasVariantCombination && !thresholdVariant) {
        toast.error('This product requires a variant selection', { ...toastError });
        return;
      }
    }

    setThresholdLoading(true);
    setLoading(true);

    let result;

    if (isEditMode) {
      // UPDATE
      const payload = {
        productInventorySettingsID: editingSettingsId,
        lowStockThreshold: Number(lowStockThreshold),
      };
      result = await updateInventorySettings(payload);
    } else {
      // ADD
      const payload = {
        productId: Number(thresholdProduct),
        variantValueId: thresholdVariant ? Number(thresholdVariant) : null,
        variantCombinationId: thresholdCombo ? Number(thresholdCombo) : null,
        lowStockThreshold: Number(lowStockThreshold),
      };
      result = await addInventorySettings(payload);
    }

    if (result) {
      toast.success(isEditMode ? 'Threshold updated successfully!' : 'Threshold added successfully!', { ...toastSuccess });
      closeModal();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }

    setThresholdLoading(false);
    setLoading(false);
  };

  // ✅ DELETE HANDLER
  const handleDeleteThreshold = async () => {
    if (!editingSettingsId) return;

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this threshold setting? This action cannot be undone.'
    );

    if (!confirmDelete) return;

    setThresholdLoading(true);
    setLoading(true);

    const result = await deleteInventorySettings(editingSettingsId);

    if (result) {
      toast.success('Threshold deleted successfully!', { ...toastSuccess });
      closeModal();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } 
    setThresholdLoading(false);
    setLoading(false);
  };

  const isAdminUser = ['Super Admin', 'Admin'].includes(currentUser);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {loading && <Loading />}
      <Navbar TitleName="Inventory Dashboard" />

      <div className="inventory-dashboard-container">

        {/* Statistics Cards */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-label">Total Items</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card stat-card-ok">
            <div className="stat-label">In Stock</div>
            <div className="stat-value">{stats.ok}</div>
          </div>
          <div className="stat-card stat-card-low">
            <div className="stat-label">Low Stock</div>
            <div className="stat-value">{stats.low}</div>
          </div>
          <div className="stat-card stat-card-out">
            <div className="stat-label">Out of Stock</div>
            <div className="stat-value">{stats.out}</div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="controls-bar">
          <input
            type="text"
            placeholder="🔍 Search products or variants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <div className="right-controls">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="ok">✅ In Stock</option>
              <option value="low">⚠️ Low Stock</option>
              <option value="out">❌ Out of Stock</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="product">Sort: Product Name</option>
              <option value="stock-asc">Sort: Stock (Low to High)</option>
              <option value="stock-desc">Sort: Stock (High to Low)</option>
              <option value="status">Sort: Status (Critical First)</option>
            </select>

            {isAdminUser && (
              <button onClick={() => navigate('inventory/add')} className="add-stock-btn">
                + Add Stock
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="results-count">
          Showing {filteredAndSortedData.length} of {fetchInventoryStock.length} items
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Product</th>
                <th>Unit Type</th>
                <th>Pieces per Box</th>
                <th>Variant</th>
                <th>Stock</th>
                <th>
                  <div className="th-threshold-wrap">
                    <span>Low Threshold</span>
                    {isAdminUser && (
                      <button
                        className="threshold-settings-btn"
                        onClick={openAddModal}
                        title="Set Low Stock Threshold"
                        aria-label="Open low stock threshold settings"
                      >
                        <FiSettings />
                      </button>
                    )}
                  </div>
                </th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredAndSortedData.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-results">
                    {searchTerm || filterStatus !== 'all'
                      ? '🔍 No items match your filters'
                      : 'No inventory data available'}
                  </td>
                </tr>
              ) : (
                filteredAndSortedData.map(stock => {
                  const product = products.find(p => p.ID === stock.productId);
                  const image   = product?.images?.[0] || 'https://via.placeholder.com/50';
                  const thresholdSettings = getThresholdForStock(stock);
                  const status  = computeStatus(stock.totalQuantity, thresholdSettings);

                  return (
                    <tr
                      key={stock.ID}
                      className={`${status === 'OUT' ? 'out-row' : ''} ${status === 'LOW' ? 'low-row' : ''}`.trim()}
                    >
                      <td>{stock.inventoryStockId}</td>
                      <td>
                        <img src={image} alt="product" className="prod-img" />
                      </td>
                      <td><strong>{resolveProductName(stock.productId)}</strong></td>

                      <td>{resolveUnitDetails(stock.productId).unitType}</td>

                      <td>{resolveUnitDetails(stock.productId).piecesPerBox}</td>

                      <td>{resolveVariant(stock)}</td>
                      <td>
                        <span className="stock-badge">{stock.totalQuantity}</span>
                      </td>
                      <td>
                        <div className="threshold-cell">
                          <span>{thresholdSettings ? thresholdSettings.lowStockThreshold : '-'}</span>
                          {thresholdSettings && isAdminUser && (
                            <button
                              className="edit-threshold-btn"
                              onClick={() => openEditModal(stock)}
                              title="Edit threshold"
                            >
                              <FiEdit2 />
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge status-${status.toLowerCase()}`}>
                          {status === 'OUT' ? '❌ OUT' : status === 'LOW' ? '⚠️ LOW' : '✅ OK'}
                        </span>
                      </td>
                    </tr>
                  );
                }).reverse()
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Low Stock Threshold Modal ───────────────────────────────────────── */}
      {showModal && (
        <div
          className="threshold-overlay"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="threshold-modal-title"
        >
          <div className="threshold-modal" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="threshold-modal-header">
              <div className="threshold-modal-title-group">
                {isEditMode ? <FiEdit2 className="threshold-modal-header-icon" /> : <FiSettings className="threshold-modal-header-icon" />}
                <h2 id="threshold-modal-title" className="threshold-modal-title">
                  {isEditMode ? 'Edit Low Stock Threshold' : 'Add Low Stock Threshold'}
                </h2>
              </div>
              <button
                className="threshold-modal-close-btn"
                onClick={closeModal}
                aria-label="Close modal"
                disabled={thresholdLoading}
              >
                ✕
              </button>
            </div>

            <p className="threshold-modal-subtitle">
              {isEditMode 
                ? 'Update the minimum quantity before this product is flagged as low stock.'
                : 'Configure the minimum quantity before a product is flagged as low stock.'}
            </p>

            {/* Form */}
            <form className="threshold-form" onSubmit={handleThresholdSubmit} >

              {/* Product dropdown */}
              <div className="threshold-form-group">
                <label className="threshold-label" htmlFor="t-product">
                  Product <span className="threshold-required">*</span>
                </label>
                <select
                  id="t-product"
                  className="threshold-select"
                  value={thresholdProduct}
                  onChange={(e) => setThresholdProduct(e.target.value)}
                  disabled={thresholdLoading || isEditMode}
                >
                  <option value="">-- Select Product --</option>
                  {products.map((p) => {
                    const isSimpleProduct = !p.hasVariant && !p.hasVariantCombination;
                    const alreadyExists = isSimpleProduct && fetchInventorySettings.some(
                      s => s.productId === p.ID && !s.variantValueId && !s.variantCombinationId
                    );
                    return (
                      <option key={p.ID} value={p.ID} disabled={alreadyExists}>
                        {p.productName}{alreadyExists ? ' (already set)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Single variant dropdown */}
              {thresholdProduct && hasVariants && !hasVariantCombination && (
                <div className="threshold-form-group">
                  <label className="threshold-label" htmlFor="t-variant">
                    Variant <span className="threshold-required">*</span>
                  </label>
                  <select
                    id="t-variant"
                    className="threshold-select"
                    value={thresholdVariant}
                    onChange={(e) => setThresholdVariant(e.target.value)}
                    disabled={thresholdLoading || isEditMode}
                  >
                    <option value="">-- Select Variant --</option>
                    {productVariantValues
                      .filter((v) => v.productId === Number(thresholdProduct))
                      .map((v) => {
                        const alreadyExists = fetchInventorySettings.some(
                          s => s.productId === Number(thresholdProduct) && s.variantValueId === v.ID
                        );
                        return (
                          <option key={v.ID} value={v.ID} disabled={alreadyExists}>
                            {v.value}{alreadyExists ? ' (already set)' : ''}
                          </option>
                        );
                      })}
                  </select>
                </div>
              )}

              {/* Variant combination dropdown */}
              {thresholdProduct && hasVariantCombination && (
                <div className="threshold-form-group">
                  <label className="threshold-label" htmlFor="t-combo">
                    Variant Combination <span className="threshold-required">*</span>
                  </label>
                  <select
                    id="t-combo"
                    className="threshold-select"
                    value={thresholdCombo}
                    onChange={(e) => setThresholdCombo(e.target.value)}
                    disabled={thresholdLoading || isEditMode}
                  >
                    <option value="">-- Select Combination --</option>
                    {productVariantCombination
                      .filter((c) => c.productId === Number(thresholdProduct))
                      .map((c) => {
                        const alreadyExists = fetchInventorySettings.some(
                          s => s.productId === Number(thresholdProduct) && s.variantCombinationId === c.ID
                        );
                        return (
                          <option key={c.ID} value={c.ID} disabled={alreadyExists}>
                            {c.combinations}{alreadyExists ? ' (already set)' : ''}
                          </option>
                        );
                      })}
                  </select>
                </div>
              )}

              {/* Low Stock Threshold input */}
              <div className="threshold-form-group">
                <label className="threshold-label" htmlFor="t-threshold">
                  Low Stock Threshold <span className="threshold-required">*</span>
                </label>
                <input
                  id="t-threshold"
                  type="number"
                  className="threshold-input"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  placeholder="e.g. 10"
                  min="1"
                  disabled={thresholdLoading}
                />
                <span className="threshold-hint">
                  Stock at or below this number will be flagged as ⚠️ LOW.
                </span>
              </div>

              {/* Action buttons */}
              <div className="threshold-modal-actions">
                {isEditMode && (
                  <button
                    type="button"
                    className="threshold-btn threshold-btn-delete"
                    onClick={handleDeleteThreshold}
                    disabled={thresholdLoading}
                  >
                    <FiTrash2 /> Delete
                  </button>
                )}
                <div className="threshold-modal-actions-right">
                  <button
                    type="button"
                    className="threshold-btn threshold-btn-cancel"
                    onClick={closeModal}
                    disabled={thresholdLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="threshold-btn threshold-btn-submit"
                    disabled={thresholdLoading || !isFormValid()}
                  >
                    {thresholdLoading 
                      ? 'Saving...' 
                      : isEditMode 
                        ? 'Save Changes' 
                        : 'Add Threshold'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}