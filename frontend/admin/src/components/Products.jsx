import React, { useState } from 'react';
import { assets } from "../assets/assets.js";
import './products.css';
import ProductList from './ProductMenu/ProductList.jsx';
import TotalProduct from './ProductMenu/TotalProduct.jsx'; 
import MostStock from './ProductMenu/MostStock.jsx'; 
import LowStock from './ProductMenu/LowStock.jsx';
import OutOfStock from './ProductMenu/OutOfStock.jsx';
function Products({ onAddProductClick }) {
  const [showProductList, setShowProductList] = useState(false);
  const [showTotalProduct, setShowTotalProduct] = useState(false);
  const [showMostStock, setShowMostStock] = useState(false);
  const [showLowStock, setShowLowStock] = useState(false); // added state
  const [showOutOfStock, setShowOutOfStock] = useState(false); // added state
  if (showProductList) {
    return <ProductList onBack={() => setShowProductList(false)} />;
  }

  if (showTotalProduct) {
    return <TotalProduct onBack={() => setShowTotalProduct(false)} />;
  }

  if (showMostStock) {
    return <MostStock onBack={() => setShowMostStock(false)} />;
  }

  if (showLowStock) {
    return <LowStock onBack={() => setShowLowStock(false)} />;
  }
  if (showOutOfStock) {
    return <OutOfStock onBack={() => setShowOutOfStock(false)} />;
  }
  
  return (
    <div className="products-container">
      <div className="cards-grid">
        {/* Row 1: 4 cards */}
        <div className="cards-row">
          <div className="product-card clickable" onClick={onAddProductClick}>
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
          
          <div className="product-card clickable" onClick={() => setShowProductList(true)}>
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
          
          <div className="product-card clickable" onClick={() => setShowTotalProduct(true)}>
            <div className="card-header">
              <img src={assets.total_product_icon} className="card-icon" />
              <h3 className="card-title">Total Products</h3>
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
          <div className="product-card clickable" onClick={() => setShowMostStock(true)}>
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
          
          <div className="product-card clickable" onClick={() => setShowLowStock(true)}>
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
          
          <div className="product-card clickable" onClick={() => setShowOutOfStock(true)}>
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
  );
}

export default Products;