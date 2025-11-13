import React, { useContext, useEffect, useState } from 'react';
import './ProductCategory.css';
import { FaPlus, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { AdminContext } from '../../context/AdminContextProvider';
import Navbar from '../Navbar';

function ProductCategory({ onBack }) {
  const { productCategory } = useContext(AdminContext);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (productCategory && Array.isArray(productCategory)) {
      setCategories(productCategory);
    }
  }, [productCategory]);

  const addNewCategory = () => {
    const newCategory = {
      ID: Date.now(),
      categoryId: '',
      categoryName: '',
      createAt: new Date().toISOString(),
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const updateCategory = (index, value) => {
    setCategories((prev) => {
      const copy = [...prev];
      copy[index].categoryName = value;
      return copy;
    });
  };

  const deleteCategory = (index) => {
    setCategories((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteAll = () => {
    setCategories([]);
  };

  const saveChanges = () => {
    console.log('Categories to save:', categories);
    alert('Changes saved (simulation)');
  };

  return (
    <>
      <Navbar TitleName="List of Product Categories" />
      <div className="category-container">
        <div className="category-card">
          <div className="category-header">
            <div className="category-header-left">
              {onBack && (
                <button className="category-back" onClick={onBack} aria-label="Back">
                  <FaArrowLeft />
                </button>
              )}
              <h1 className="category-title">All Product Categories</h1>
            </div>

            <button className="category-add-btn" onClick={addNewCategory} aria-label="Add New">
              <FaPlus /> <span className="category-add-text">Add New</span>
            </button>
          </div>

          <div className="category-list">
            {categories.length > 0 ? (
              categories.map((cat, idx) => (
                <div className="category-row" key={cat.ID || idx}>
                  <input
                    className="category-input"
                    value={cat.categoryName}
                    placeholder="Enter category name"
                    onChange={(e) => updateCategory(idx, e.target.value)}
                  />
                  <button
                    className="category-delete-icon"
                    onClick={() => deleteCategory(idx)}
                    aria-label={`Delete category ${cat.categoryName}`}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))
            ) : (
              <p className="category-empty">No categories found.</p>
            )}
          </div>

          <div className="category-actions">
            <button className="category-save-btn" onClick={saveChanges}>
              Save Changes
            </button>
            <button className="category-delete-all-btn" onClick={deleteAll}>
              Delete All
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductCategory;
