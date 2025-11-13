import React, { useContext, useState, useMemo } from 'react';
import './TotalProduct.css';
import { FaTrash, FaSearch } from 'react-icons/fa';
import Navbar from '../Navbar';
import { AdminContext } from '../../context/AdminContextProvider';

function TotalProduct() {
  const { products, productCategory } = useContext(AdminContext);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('');

  const handleDelete = (id) => {
    // You can replace this later with a modal confirmation
    alert(`Delete product ID: ${id}`);
  };

  const handleView = (p) => {
    alert(`Viewing Product: ${p.productName}`);
  };

  // 🧠 Build category lookup map for faster category name resolution
  const categoryMap = useMemo(() => {
    const map = {};
    productCategory?.forEach((cat) => {
      map[cat.ID] = cat.categoryName;
    });
    return map;
  }, [productCategory]);

  // 🧩 Filtered, searched, and sorted product list
  const filteredProducts = useMemo(() => {
    let list = [...(products || [])];

    // Search by name
    if (query.trim()) {
      list = list.filter((p) =>
        p.productName.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Filter by category
    if (filter) {
      list = list.filter((p) => {
        const categoryName = categoryMap[p.categoryId];
        return categoryName === filter;
      });
    }

    // Sort by price
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [products, query, filter, sortBy, categoryMap]);

  return (
    <>
      <Navbar TitleName="Total Products" />
      <div className="tp-container">
        <div className="tp-card">

          {/* 🔍 Filter / Sort / Search Controls */}
          <div className="tp-controls">
            <div className="tp-controls-left">
              {/* Category Filter */}
              <label className="tp-select-label">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {productCategory?.map((cat) => (
                    <option key={cat.ID} value={cat.categoryName}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </label>

              {/* Sort Dropdown */}
              <label className="tp-select-label">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="">Sort By</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                </select>
              </label>
            </div>

            <div className="tp-controls-right">
              <button className="tp-add-btn">Add Product</button>

              <div className="tp-search">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <FaSearch className="tp-search-icon" />
              </div>
            </div>
          </div>

          {/* 🧾 Product Table */}
          <table className="tp-table" cellSpacing="0">
            <thead>
              <tr>
                <th>Image</th>
                <th className="left">Name</th>
                <th className="left">Category</th>
                <th className="left">Price</th>
                <th className="left">Stock</th>
                <th className="left">Status</th>
                <th className="left">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p.ID} onClick={() => handleView(p)} className='view-product'>
                    <td>
                      <img
                        src={p.image1 || p.images?.[0]}
                        alt={p.productName}
                        className="tp-thumb"
                      />
                    </td>
                    <td className="left">{p.productName}</td>
                    <td className="left">{categoryMap[p.categoryId] || '—'}</td>
                    <td className="left">₱{p.price.toFixed(2)}</td>
                    <td className="left">{p.stockQuantity}</td>
                    <td className="left">
                      {p.isActive ? (
                        <span className="status-active">Active</span>
                      ) : (
                        <span className="status-inactive">Inactive</span>
                      )}
                    </td>
                    <td className="center tp-actions">
                      <button className="tp-trash" onClick={() => handleDelete(p.ID)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="center empty">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default TotalProduct;
