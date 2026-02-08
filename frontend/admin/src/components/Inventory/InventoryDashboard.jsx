import { useContext, useState, useMemo } from 'react';
import './InventoryDashboard.css';
import Navbar from '../Navbar';
import { AdminContext } from '../../context/AdminContextProvider';

export default function InventoryDashboard() {
  const { navigate, fetchInventoryStock, products, productVariantValues, productVariantCombination } = useContext(AdminContext);

  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('product'); // product, stock-asc, stock-desc, status
  const [filterStatus, setFilterStatus] = useState('all'); // all, low, ok, out

  // Helper functions
  const resolveVariant = (stock) => {
    if (stock.variantCombinationId) {
      const combo = productVariantCombination.find(c => c.ID === stock.variantCombinationId);
      return combo ? combo.combinations : "-";
    }
    if (stock.variantValueId) {
      const single = productVariantValues.find(v => v.ID === stock.variantValueId);
      return single ? single.value : "-";
    }
    return "-";
  };

  const resolveProductName = (id) => {
    const p = products.find(pr => pr.ID === id);
    return p ? p.productName : "Unknown";
  };

  const computeStatus = (qty, threshold) => {
    if (qty === 0) return "OUT";
    return qty <= threshold ? "LOW" : "OK";
  };

  // Filtered and sorted data
  const filteredAndSortedData = useMemo(() => {
    let result = [...fetchInventoryStock];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(stock => {
        const productName = resolveProductName(stock.productId).toLowerCase();
        const variant = resolveVariant(stock).toLowerCase();
        return productName.includes(search) || variant.includes(search);
      });
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(stock => {
        const status = computeStatus(stock.totalQuantity, stock.lowStockThreshold);
        return status.toLowerCase() === filterStatus.toLowerCase();
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'product':
          return resolveProductName(a.productId).localeCompare(resolveProductName(b.productId));
        
        case 'stock-asc':
          return a.totalQuantity - b.totalQuantity;
        
        case 'stock-desc':
          return b.totalQuantity - a.totalQuantity;
        
        case 'status':
          const statusA = computeStatus(a.totalQuantity, a.lowStockThreshold);
          const statusB = computeStatus(b.totalQuantity, b.lowStockThreshold);
          const statusOrder = { OUT: 0, LOW: 1, OK: 2 };
          return statusOrder[statusA] - statusOrder[statusB];
        
        default:
          return 0;
      }
    });

    return result;
  }, [fetchInventoryStock, searchTerm, sortBy, filterStatus, products, productVariantValues, productVariantCombination]);

  // Statistics
  const stats = useMemo(() => {
    const total = fetchInventoryStock.length;
    const low = fetchInventoryStock.filter(s => computeStatus(s.totalQuantity, s.lowStockThreshold) === "LOW").length;
    const out = fetchInventoryStock.filter(s => s.totalQuantity === 0).length;
    const ok = total - low - out;
    return { total, low, out, ok };
  }, [fetchInventoryStock]);

  const handleAddStock = () => {
    navigate("inventory/add");
  };


  return (
    <>
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
          {/* Search */}
          <input
            type="text"
            placeholder="🔍 Search products or variants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          {/* Filters & Sort */}
          <div className="right-controls">
            {/* Filter by Status */}
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

            {/* Sort */}
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

            {/* Add Stock Button */}
            <button onClick={handleAddStock} className="add-stock-btn">
              + Add Stock
            </button>
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
                <th>Variant</th>
                <th>Stock</th>
                <th>Low Threshold</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredAndSortedData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-results">
                    {searchTerm || filterStatus !== 'all' 
                      ? '🔍 No items match your filters' 
                      : 'No inventory data available'}
                  </td>
                </tr>
              ) : (
                filteredAndSortedData.map(stock => {
                  const product = products.find(p => p.ID === stock.productId);
                  const image = product?.images?.[0] || 'https://via.placeholder.com/50';
                  const status = computeStatus(stock.totalQuantity, stock.lowStockThreshold);
                  
                  return (
                    <tr key={stock.ID} className={`${status === "OUT" ? "out-row" : ""} ${status === "LOW" ? "low-row" : ""}`.trim()}>
                      <td>
                        {stock.inventoryStockId}
                      </td>
                      <td>
                        <img src={image} alt="product" className="prod-img" />
                      </td>
                      <td>
                        <strong>{resolveProductName(stock.productId)}</strong>
                      </td>
                      <td>{resolveVariant(stock)}</td>
                      <td>
                        <span className="stock-badge">{stock.totalQuantity}</span>
                      </td>
                      <td>{stock.lowStockThreshold}</td>
                      <td>
                        <span className={`status-badge status-${status.toLowerCase()}`}>
                          {status === "OUT" ? "❌ OUT" : status === "LOW" ? "⚠️ LOW" : "✅ OK"}
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
    </>
  );
}