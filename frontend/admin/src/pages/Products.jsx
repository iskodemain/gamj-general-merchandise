import React, { useContext, useState } from 'react';
import { assets } from "../assets/assets.js";
import './Products.css';
import { AdminContext } from '../context/AdminContextProvider.jsx';
import Navbar from '../components/Navbar.jsx';

function Products() {
  const { navigate } = useContext(AdminContext);
  
  return (
    <>
      <Navbar TitleName="Products"/>
      <div className="products-container">
        <div className="cards-grid">
          {/* Row 1: 4 cards */}
          <div className="cards-row">
            <div className="product-card" onClick={() => navigate("/products/addproduct")}>
              <div className="card-header">
                <img src={assets.add_product_icon } className="card-icon" />
                <h3 className="card-title">Add Product</h3>
              </div>
              <hr className="card-divider" />
              <div className="card-content">
                <p className="large-text">Add New</p>
                <p className="small-text">Updated: Sep 25, 2025</p>
              </div>
            </div>
            
            <div className="product-card" onClick={() => navigate("/products/productcategory")}>
              <div className="card-header">
                <img src={assets.product_category_icon} className="card-icon" />
                <h3 className="card-title">List of Product Categories</h3>
              </div>
              <hr className="card-divider" />
              <div className="card-content">
                <p className="large-number">1</p>
                <p className="small-text">Updated: Sep 25, 2025</p>
              </div>
            </div>
            
            <div className="product-card" onClick={() => navigate("/products/totalproduct")}>
              <div className="card-header">
                <img src={assets.total_product_icon} className="card-icon" />
                <h3 className="card-title">Total Product</h3>
              </div>
              <hr className="card-divider" />
              <div className="card-content">
                <p className="large-number">3</p>
                <p className="small-text">Updated: Sep 25, 2025</p>
              </div>
            </div>
          </div>
          
          {/* Row 2: 3 cards */}
          <div className="cards-row">
            <div className="product-card" onClick={() => navigate("/products/moststock")}>
              <div className="card-header">
                <img src={assets.most_stock_product_icon} className="card-icon" />
                <h3 className="card-title">Most Stock Products</h3>
              </div>
              <hr className="card-divider" />
              <div className="card-content">
                <p className="large-number">1</p>
                <p className="small-text">Updated: Sep 25, 2025</p>
              </div>
            </div>
            
            <div className="product-card" onClick={() => navigate("/products/lowstock")}>
              <div className="card-header">
                <img src={assets.low_stock_product_icon} className="card-icon" />
                <h3 className="card-title">Low Stock Products</h3>
              </div>
              <hr className="card-divider" />
              <div className="card-content">
                <p className="large-number">2</p>
                <p className="small-text">Updated: Sep 25, 2025</p>
              </div>
            </div>
            
            <div className="product-card" onClick={() => navigate("/products/outofstock")}>
              <div className="card-header">
                <img src={assets.out_of_stock_product_icon} className="card-icon" />
                <h3 className="card-title">Out of Stock Products</h3>
              </div>
              <hr className="card-divider" />
              <div className="card-content">
                <p className="large-number">1</p>
                <p className="small-text">Updated: Sep 25, 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Products;