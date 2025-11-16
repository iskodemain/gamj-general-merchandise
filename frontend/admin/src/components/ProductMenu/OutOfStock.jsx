import React, { useState, useContext, useMemo } from 'react';
import './OutofStock.css';
import { FaArrowLeft, FaTrash } from 'react-icons/fa';
import { AdminContext } from '../../context/AdminContextProvider';
import Navbar from '../Navbar';

function OutofStock({onBack}) {
  const { products, productCategory, navigate } = useContext(AdminContext);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('');

  // 🧠 Category lookup map
  const categoryMap = useMemo(() => {
    const map = {};
    productCategory?.forEach((cat) => {
      map[cat.ID] = cat.categoryName;
    });
    return map;
  }, [productCategory]);

  // 🔥 FILTER → ONLY STOCK > 1000
  const filteredProducts = useMemo(() => {
    let list = [...(products || [])];

    // ▶ only show products with stock >= 1000
    list = list.filter((p) => p.isOutOfStock === true);

    // ▶ search by name
    if (query.trim()) {
      list = list.filter((p) =>
        p.productName.toLowerCase().includes(query.toLowerCase())
      );
    }

    // ▶ filter by category
    if (filter) {
      list = list.filter((p) => {
        const categoryName = categoryMap[p.categoryId];
        return categoryName === filter;
      });
    }

    // ▶ sorting
    if (sortBy === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price);

    return list;
  }, [products, query, filter, sortBy, categoryMap]);

  const handleDelete = (id) => {
    alert(`Delete product ID: ${id}`);
  };

  const handleView = (productId) => {
    navigate(`/products/updateproduct/${productId}`);
  };

  return (
    <>
      <Navbar TitleName="Out of Stock Products" />
      <div className="tpc-container">
        <div className="tpc-card">

          <div className="tpc-controls">
            <div className="tpc-controls-left">
              {onBack && (
                <button className="tpc-back" onClick={onBack}>
                  <FaArrowLeft />
                </button>
              )}
            </div>

            <div className="tpc-controls-right">
              <button className="tpc-add-btn" onClick={() => navigate('/products/addproduct')}>
                Add Product
              </button>
            </div>
          </div>

          <table className="tpc-table" cellSpacing="0">
            <thead>
              <tr>
                <th>Image</th>
                <th className="left">Name</th>
                <th className="left">Category</th>
                <th className="center">Price</th>
                <th className="center">Stocks</th>
                <th className="center">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p.ID}>
                    <td>
                      <img
                        src={p.image1 || p.images?.[0]}
                        alt={p.productName}
                        className="tpc-thumb"
                      />
                    </td>
                    <td className="left">{p.productName}</td>
                    <td className="left">{categoryMap[p.categoryId] || '—'}</td>
                    <td className="center">₱{p.price.toFixed(2)}</td>
                    <td className="center">{p.stockQuantity}</td>

                    <td className="center">
                      <button className="tpc-view" onClick={() => handleView(p.productId)}>
                        View
                      </button>
                      <button className="tpc-trash" onClick={() => handleDelete(p.ID)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="center empty">
                    No products are displayed.
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

export default OutofStock;
