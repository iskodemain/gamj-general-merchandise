import React, { useContext, useEffect, useState } from 'react';
import './ProductCategory.css';
import { FaPlus, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { AdminContext } from '../../context/AdminContextProvider';
import Navbar from '../Navbar';
import Loading from '../Loading';
import { toast } from 'react-toastify';

function ProductCategory() {
  const { productCategory, addProductCategory, toastSuccess, updateProductCategory, deleteProductCategory, deleteAllProductCategories } = useContext(AdminContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productCategory && Array.isArray(productCategory)) {
      // Deep clone so editing won't mutate original
      setCategories(JSON.parse(JSON.stringify(productCategory)));
    }
  }, [productCategory]);


  const addNewCategory = () => {
    setCategories(prev => [
      ...prev,
      {
        ID: Date.now(),    // temporary ID for frontend only
        isNew: true,
        categoryName: ""
      }
    ]);
  };

  const updateCategory = (index, value) => {
    setCategories(prev => {
      const list = [...prev];
      list[index].categoryName = value;
      return list;
    });
  };

  const deleteCategoryHandler = async (index) => {
    const cat = categories[index];

    // DELETE NEW UNSAVED CATEGORY – just remove from UI
    if (cat.isNew) {
      setCategories(prev => prev.filter((_, i) => i !== index));
      return;
    }

    setLoading(true);
    const deleted = await deleteProductCategory(cat.ID);
    setLoading(false);

    if (deleted) {
      // Remove from UI
      setCategories(prev => prev.filter((_, i) => i !== index));
      toast.success("Category deleted successfully!", toastSuccess);
    }
  };


  const deleteAllHandler = async () => {
    if (!categories.length) return;

    const hasExisting = categories.some(c => !c.isNew);

    // If only NEW categories → clear UI instantly
    if (!hasExisting) {
        setCategories([]);
        return;
    }

    setLoading(true);
    const deleted = await deleteAllProductCategories();
    setLoading(false);

    if (deleted) {
        setCategories([]); // update UI
        toast.success("All categories deleted successfully!", toastSuccess);
    }
  };


  const saveChanges = async () => {
    setLoading(true);

    let createdCount = 0;
    let updatedCount = 0;

    for (const cat of categories) {
      const name = cat.categoryName.trim();
      if (!name) continue;

      // NEW CATEGORY
      if (cat.isNew) {
        const created = await addProductCategory({ categoryName: name });
        if (created) createdCount++;
        continue;
      }

      // EXISTING CATEGORY — only update if changed
      const original = productCategory.find(p => p.ID === cat.ID);

      if (original && original.categoryName !== name) {
        const updated = await updateProductCategory({
          categoryID: cat.ID,
          categoryName: name
        });

        if (updated) updatedCount++;
      }
    }

    setLoading(false);

    if (createdCount > 0 || updatedCount > 0) {
      toast.success("Changes saved successfully!", toastSuccess);
    }
  };

  return (
    <>
      {loading && <Loading />}
      <Navbar TitleName="List of Product Categories" />
      <div className="category-container">
        <div className="category-card">

          <div className="category-header">
            <div className="cat-header">
              <button onClick={() => window.history.back()} className="cat-back">
                <FaArrowLeft />
              </button>
              <h1 className="cat-title">Back</h1>
            </div>
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
                    onClick={() => deleteCategoryHandler(idx)}
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

          <button className="category-add-btn-bottom" onClick={addNewCategory}>
            <FaPlus /> <span className="category-add-text">Add New</span>
          </button>

          <div className="category-actions">
            <button className="category-save-btn" onClick={saveChanges}>
              Save Changes
            </button>
            <button className="category-delete-all-btn" onClick={deleteAllHandler}>Delete All</button>
          </div>

        </div>
      </div>
    </>
  );
}

export default ProductCategory;
