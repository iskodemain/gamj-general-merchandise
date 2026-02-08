import React, { useContext, useState, useMemo } from 'react'
import './InventoryTransactions.css'
import { AdminContext } from '../../context/AdminContextProvider'
import Navbar from '../Navbar';

const InventoryTransactions = () => {
  const { products, variantName, productVariantValues, productVariantCombination, fetchInventoryHistory } = useContext(AdminContext);
  
  // State for filters and sorting
  const [filterType, setFilterType] = useState('ALL'); // ALL, IN, OUT
  const [filterProduct, setFilterProduct] = useState('ALL');
  const [sortBy, setSortBy] = useState('DATE_DESC'); // DATE_DESC, DATE_ASC, QTY_DESC, QTY_ASC
  const [searchTerm, setSearchTerm] = useState('');

  // Helper function to get product name
  const getProductName = (productId) => {
    const product = products?.find(p => p.ID === productId);
    return product ? product.productName : 'Unknown Product';
  };

  // Helper function to get variant details
  const getVariantDetails = (variantValueId, variantCombinationId) => {
    if (variantCombinationId) {
      const combination = productVariantCombination?.find(c => c.ID === variantCombinationId);
      return combination ? combination.combinations : 'N/A';
    }
    
    if (variantValueId) {
      const variantValue = productVariantValues?.find(v => v.ID === variantValueId);
      if (variantValue) {
        const variantNameObj = variantName?.find(vn => vn.ID === variantValue.variantNameId);
        return variantNameObj ? `${variantNameObj.name}: ${variantValue.value}` : variantValue.value;
      }
    }
    
    return 'No Variant';
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter and sort inventory history
  const filteredAndSortedHistory = useMemo(() => {
    if (!fetchInventoryHistory) return [];

    let filtered = [...fetchInventoryHistory];

    // Filter by type
    if (filterType !== 'ALL') {
      filtered = filtered.filter(item => item.type === filterType);
    }

    // Filter by product
    if (filterProduct !== 'ALL') {
      filtered = filtered.filter(item => item.productId === parseInt(filterProduct));
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => {
        const productName = getProductName(item.productId).toLowerCase();
        const variantDetails = getVariantDetails(item.variantValueId, item.variantCombinationId).toLowerCase();
        const remarks = item.remarks?.toLowerCase() || '';
        const referenceId = item.referenceId?.toLowerCase() || '';
        
        return productName.includes(searchTerm.toLowerCase()) ||
               variantDetails.includes(searchTerm.toLowerCase()) ||
               remarks.includes(searchTerm.toLowerCase()) ||
               referenceId.includes(searchTerm.toLowerCase());
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'DATE_ASC':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'DATE_DESC':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'QTY_ASC':
          return a.quantity - b.quantity;
        case 'QTY_DESC':
          return b.quantity - a.quantity;
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  }, [fetchInventoryHistory, filterType, filterProduct, sortBy, searchTerm, products, productVariantCombination, productVariantValues, variantName]);

  // Get unique products for filter
  const uniqueProducts = useMemo(() => {
    if (!products) return [];
    return products.map(p => ({ ID: p.ID, name: p.productName }));
  }, [products]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!filteredAndSortedHistory) return { total: 0, stockIn: 0, stockOut: 0, totalQtyIn: 0, totalQtyOut: 0 };
    
    const stockIn = filteredAndSortedHistory.filter(item => item.type === 'IN');
    const stockOut = filteredAndSortedHistory.filter(item => item.type === 'OUT');
    
    return {
      total: filteredAndSortedHistory.length,
      stockIn: stockIn.length,
      stockOut: stockOut.length,
      totalQtyIn: stockIn.reduce((sum, item) => sum + item.quantity, 0),
      totalQtyOut: stockOut.reduce((sum, item) => sum + item.quantity, 0)
    };
  }, [filteredAndSortedHistory]);

  return (
    <>
      <Navbar TitleName="Inventory Transactions" />
      <div className="inventory-transactions-page">
        <div className="it-container">
          
          {/* Header */}
          <div className="it-header">
            <h1 className="it-title">Inventory Transactions History</h1>
            <p className="it-subtitle">View and track all inventory transactions</p>
          </div>

          {/* Statistics Cards */}
          <div className="it-stats-grid">
            <div className="it-stat-card">
              <div className="it-stat-content">
                <p className="it-stat-label">Total Transactions</p>
                <p className="it-stat-value">{stats.total}</p>
              </div>
            </div>
            
            <div className="it-stat-card">
              <div className="it-stat-content">
                <p className="it-stat-label">Stock In</p>
                <p className="it-stat-value">{stats.stockIn}</p>
                <p className="it-stat-detail">{stats.totalQtyIn} items</p>
              </div>
            </div>
            
            <div className="it-stat-card">
              <div className="it-stat-content">
                <p className="it-stat-label">Stock Out</p>
                <p className="it-stat-value">{stats.stockOut}</p>
                <p className="it-stat-detail">{stats.totalQtyOut} items</p>
              </div>
            </div>
            
            <div className="it-stat-card">
              <div className="it-stat-content">
                <p className="it-stat-label">Current Stock</p>
                <p className="it-stat-value">{stats.totalQtyIn - stats.totalQtyOut}</p>
                <p className="it-stat-detail">items</p>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="it-filters-section">
            
            {/* Search Bar */}
            <div className="it-search-wrapper">
              <input
                type="text"
                placeholder="Search by product, variant, reference, or remarks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="it-search-input"
              />
            </div>

            {/* Filter Controls */}
            <div className="it-filters-row">
              
              {/* Type Filter */}
              <div className="it-filter-group">
                <label className="it-filter-label">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="it-filter-select"
                >
                  <option value="ALL">All Types</option>
                  <option value="IN">Stock In</option>
                  <option value="OUT">Stock Out</option>
                </select>
              </div>

              {/* Product Filter */}
              <div className="it-filter-group">
                <label className="it-filter-label">Product</label>
                <select
                  value={filterProduct}
                  onChange={(e) => setFilterProduct(e.target.value)}
                  className="it-filter-select"
                >
                  <option value="ALL">All Products</option>
                  {uniqueProducts.map(product => (
                    <option key={product.ID} value={product.ID}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="it-filter-group">
                <label className="it-filter-label">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="it-filter-select"
                >
                  <option value="DATE_DESC">Date (Newest First)</option>
                  <option value="DATE_ASC">Date (Oldest First)</option>
                  <option value="QTY_DESC">Quantity (High to Low)</option>
                  <option value="QTY_ASC">Quantity (Low to High)</option>
                </select>
              </div>

            </div>
          </div>

          {/* Transactions Table */}
          <div className="it-table-wrapper">
            <table className="it-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Product</th>
                  <th>Variant</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Reference</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedHistory.length > 0 ? (
                  filteredAndSortedHistory.map((transaction) => (
                    <tr key={transaction.ID}>
                      <td data-label="Date & Time">
                        <span className="it-date">{formatDate(transaction.createdAt)}</span>
                      </td>
                      <td data-label="Product">
                        <span className="it-product-name">{getProductName(transaction.productId)}</span>
                      </td>
                      <td data-label="Variant">
                        <span className="it-variant">{getVariantDetails(transaction.variantValueId, transaction.variantCombinationId)}</span>
                      </td>
                      <td data-label="Type">
                        <span className={`it-type-badge ${transaction.type === 'IN' ? 'it-type-in' : 'it-type-out'}`}>
                          {transaction.type === 'IN' ? '📥 Stock In' : '📤 Stock Out'}
                        </span>
                      </td>
                      <td data-label="Quantity">
                        <span className={`it-quantity ${transaction.type === 'IN' ? 'it-qty-in' : 'it-qty-out'}`}>
                          {transaction.type === 'IN' ? '+' : '-'}{transaction.quantity}
                        </span>
                      </td>
                      <td data-label="Reference">
                        <span className="it-reference">{transaction.referenceId || 'N/A'}</span>
                      </td>
                      <td data-label="Remarks">
                        <span className="it-remarks">{transaction.remarks || 'No remarks'}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="it-no-data">
                      <div className="it-empty-state">
                        <span className="it-empty-icon">📦</span>
                        <p className="it-empty-text">No transactions found</p>
                        <p className="it-empty-subtext">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Results Count */}
          {filteredAndSortedHistory.length > 0 && (
            <div className="it-results-count">
              Showing {filteredAndSortedHistory.length} transaction{filteredAndSortedHistory.length !== 1 ? 's' : ''}
            </div>
          )}

        </div>
      </div>
    </>
  )
}

export default InventoryTransactions
