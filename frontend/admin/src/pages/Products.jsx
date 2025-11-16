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

  const mostStockProducts = products?.filter(
    (p) => p.stockQuantity >= 1000
  ).length || 0;

  const lowStockProducts = products?.filter(
    (p) => p.stockQuantity <= 10
  ).length || 0;

  const outOfStockProducts = products?.filter(
    (p) => p.isOutOfStock === true
  ).length || 0;

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
                <p className="small-text">Updated: Sep 25, 2025</p>
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
                <p className="small-text">Updated: Sep 25, 2025</p>
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
                <p className="small-text">Updated: Sep 25, 2025</p>
              </div>
            </div>

          </div>

          {/* Row 2 */}
          <div className="cards-row">

            {/* Most Stock Products */}
            <div className="product-card" onClick={() => navigate("/products/moststock")}>
              <div className="card-header">
                <img src={assets.most_stock_product_icon} className="card-icon" />
                <h3 className="card-title">Most Stock Products</h3>
              </div>
              <hr className="card-divider" />
              <div className="card-content">
                <p className="large-number">{mostStockProducts}</p>
                <p className="small-text">Updated: Sep 25, 2025</p>
              </div>
            </div>

            {/* Low Stock Products */}
            <div className="product-card" onClick={() => navigate("/products/lowstock")}>
              <div className="card-header">
                <img src={assets.low_stock_product_icon} className="card-icon" />
                <h3 className="card-title">Low Stock Products</h3>
              </div>
              <hr className="card-divider" />
              <div className="card-content">
                <p className="large-number">{lowStockProducts}</p>
                <p className="small-text">Updated: Sep 25, 2025</p>
              </div>
            </div>

            {/* Out of Stock Products */}
            <div className="product-card" onClick={() => navigate("/products/outofstock")}>
              <div className="card-header">
                <img src={assets.out_of_stock_product_icon} className="card-icon" />
                <h3 className="card-title">Out of Stock Products</h3>
              </div>
              <hr className="card-divider" />
              <div className="card-content">
                <p className="large-number">{outOfStockProducts}</p>
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
