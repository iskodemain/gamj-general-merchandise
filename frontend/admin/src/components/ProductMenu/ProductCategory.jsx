import React, { useContext, useEffect, useState } from 'react';
import './ProductCategory.css';
import { FaPlus, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { AdminContext } from '../../context/AdminContextProvider';
import Navbar from '../Navbar';
import Loading from '../Loading';
import { toast } from 'react-toastify';

function ProductCategory() {
  const { productCategory, addProductCategory, toastSuccess } = useContext(AdminContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productCategory && Array.isArray(productCategory)) {
      setCategories(productCategory);
    }
  }, [productCategory]);

  const addNewCategory = async () => {
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

  const saveChanges = async () => {
    const newCategories = categories.filter((c) => !c.categoryId && c.categoryName.trim() !== "");

    if (newCategories.length === 0) {
      return;
    }

    setLoading(true);
    let createdList = [];

    for (const cat of newCategories) {
      const created = await addProductCategory({ categoryName: cat.categoryName });

      if (created) {
        createdList.push(created);
      }
    }

    setLoading(false);

    if (createdList.length > 0) {
      toast.success("Categories saved successfully!", toastSuccess);

      // merge new saved categories into UI list
      setCategories((prev) => {
        const existing = prev.filter((c) => c.categoryId); // keep old ones
        return [...existing, ...createdList]; // include new database records
      });
    }
  };


  return (
    <>
      {loading && <Loading />}
      <Navbar TitleName="List of Product Categories" />
      <div className="category-container">
        <div className="category-card">
          {/* Header with Back Button Only */}
          <div className="category-header">
            <div className="cat-header">
              <button onClick={() => window.history.back()} className="cat-back">
                <FaArrowLeft />
              </button>
              <h1 className="cat-title">Back</h1>
            </div>
          </div>

          {/* Category List */}
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

          {/* Add New Button Below Categories */}
          <button className="category-add-btn-bottom" onClick={addNewCategory}>
            <FaPlus /> <span className="category-add-text">Add New</span>
          </button>

          {/* Action Buttons */}
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