import React, { useContext } from 'react';
import { assets } from "../assets/assets.js";
import './Products.css';
import { AdminContext } from '../context/AdminContextProvider.jsx';
import Navbar from '../components/Navbar.jsx';

function Products() {
  const { navigate, productCategory, products } = useContext(AdminContext);

  // 🧮 Dynamic Counts
  const totalCategories = productCategory?.length || 0;
  const totalProducts = products?.length || 0;

  return (
    <>
      <Navbar TitleName="Products" />
      <div className="products-container">
        <div className="cards-grid">

          {/* Row 1 */}
          <div className="cards-row">

            {/* Add Product */}
            <div className="product-card" onClick={() => navigate("/products/addproduct")}>
              <div className="card-header">
                <img src={assets.add_product_icon} className="card-icon" />
                <h3 className="card-title">Add Product</h3>
              </div>
              <hr className="card-divider" />
              <div className="card-content">
                <p className="large-text">Add New</p>
              </div>
            </div>

            {/* Product Categories */}
            <div className="product-card" onClick={() => navigate("/products/productcategory")}>
              <div className="card-header">
                <img src={assets.product_category_icon} className="card-icon" />
                <h3 className="card-title">List of Product Categories</h3>
              </div>
              <hr className="card-divider" />
              <div className="card-content">
                <p className="large-number">{totalCategories}</p>
              </div>
            </div>

            {/* Total Products */}
            <div className="product-card" onClick={() => navigate("/products/totalproduct")}>
              <div className="card-header">
                <img src={assets.total_product_icon} className="card-icon" />
                <h3 className="card-title">Total Products</h3>
              </div>
              <hr className="card-divider" />
              <div className="card-content">
                <p className="large-number">{totalProducts}</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}

export default Products;
