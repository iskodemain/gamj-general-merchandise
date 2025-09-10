import React, { useState } from 'react';
import './productList.css';
import { FaPlus, FaTrash, FaArrowLeft } from 'react-icons/fa';

function ProductList({ onBack }) {
  const [categories, setCategories] = useState(['PPE', '']);

  const updateCategory = (index, value) => {
    setCategories(prev => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const addNewCategory = () => {
    setCategories(prev => [...prev, '']);
  };

  const deleteCategory = (index) => {
    setCategories(prev => prev.filter((_, i) => i !== index));
  };

  const deleteAll = () => {
    setCategories(['']);
  };

  const saveChanges = () => {
    // replace with real save logic (API call etc.)
    console.log('Saved categories:', categories.filter(Boolean));
    alert('Categories saved');
  };

  return (
    <div className="plc-container">
      <div className="plc-card">
        <div className="plc-header">
          <div className="plc-header-left">
            {onBack && (
              <button className="plc-back" onClick={onBack} aria-label="Back">
                <FaArrowLeft />
              </button>
            )}
            <h1 className="plc-title">All Product Categories</h1>
          </div>

          <button className="plc-add-btn" onClick={addNewCategory} aria-label="Add New">
            <FaPlus /> <span className="plc-add-text">Add New</span>
          </button>
        </div>

        <div className="plc-list">
          {categories.map((cat, idx) => (
            <div className="plc-row" key={idx}>
              <input
                className="plc-input"
                value={cat}
                placeholder={idx === 0 ? 'PPE' : 'New category'}
                onChange={(e) => updateCategory(idx, e.target.value)}
              />
              <button
                className="plc-delete-icon"
                onClick={() => deleteCategory(idx)}
                aria-label={`Delete category ${idx + 1}`}
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>

        <div className="plc-actions">
          <button className="plc-save-btn" onClick={saveChanges}>Save Changes</button>
          <button className="plc-delete-all-btn" onClick={deleteAll}>Delete All</button>
        </div>
      </div>
    </div>
  );
}

export default ProductList;