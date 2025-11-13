import React, { useState } from "react";
import { assets } from "../assets/assets.js";
import "./AllOrders.css";
import ViewAll from "./ViewAll";
import Navbar from "./Navbar.jsx";

const sampleOrders = [
  {
    id: 23,
    total: 1490.0,
    itemsCount: 3,
    method: "PayPal",
    status: "Processing",
    date: "Dec 20 2024",
    customer: {
      name: "Medical Hospital Cavite",
      address: "Brgy. San Roque\nCavite City, Cavite\nPhilippines 4100",
      email: "orders@medhospcavite.ph",
      phone: "+63 912 345 6789"
    },
    items: [
      { id: 1, image: assets.product1 || "https://via.placeholder.com/70", name: "Premium T-Shirt by bernil", qty: 1, size: "Adult - L", color: "Black", price: 499.0 },
      { id: 2, image: assets.product2 || "https://via.placeholder.com/70", name: "GAMJ Logo Cap by francis", qty: 1, size: "One Size", color: "Navy", price: 299.0 },
      { id: 3, image: assets.product3 || "https://via.placeholder.com/70", name: "large hotdogs (3pcs)", qty: 1, size: "N/A", color: "Mixed", price: 692.0 }
    ]
  },
  {
    id: 24,
    total: 820.0,
    itemsCount: 2,
    method: "Cash On Delivery",
    status: "Processing",
    date: "Dec 18 2024",
    customer: {
      name: "John Doe",
      address: "Unit 5B, 12th Ave\nMakati City, Metro Manila\nPhilippines 1200",
      email: "john.doe@example.com",
      phone: "+63 917 555 0123"
    },
    items: [
      { id: 1, image: assets.product4 || "https://via.placeholder.com/70", name: "Vintage Hoodie", qty: 1, size: "M", color: "Gray", price: 599.0 },
      { id: 2, image: assets.product5 || "https://via.placeholder.com/70", name: "Sticker Pack", qty: 1, size: "N/A", color: "Mixed", price: 221.0 }
    ]
  },
  // Add more orders here if needed
];

export default function AllOrders() {
  const [showViewAll, setShowViewAll] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  return (
    <>
    <Navbar TitleName="All Orders"/>
      <div className="pending-page">
        <header className="pending-header-row">
          {/* keep top white design, notif, logout, etc. (these live outside this component in your layout) */}
        </header>
        
        <div className="header-divider" />

        {/* replace only the orders-list area with ViewAll when toggled */}
        {showViewAll ? (
          <ViewAll
            order={selectedOrder}
            onClose={() => {
              setShowViewAll(false);
              setSelectedOrder(null);
            }}
          />
        ) : (
          <div className="orders-list">
            {sampleOrders.map(order => (
              <article className="order-card" key={order.id}>
                <div className="order-inner">
                  <div className="left-col">
                    <h3 className="section-heading">Products</h3>

                    <ul className="products">
                      {order.items.map(item => (
                        <li className="product-row" key={item.id}>
                          <img className="prod-img" src={item.image} alt={item.name} />
                          <div className="prod-meta">
                            <div className="prod-name">{item.name}</div>

                            <div className="prod-details">
                              <div className="prod-qty"><span className="bold">Quantity: {item.qty}</span></div>
                              <div className="prod-specs">
                                {item.size && <span>Size: {item.size}</span>}
                                {item.color && <span>Color: {item.color}</span>}
                              </div>
                              <div className="prod-price">₱{item.price.toFixed(2)}</div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="right-col">
                    <div className="order-top">
                      <div className="order-number">Order Number: <strong>{order.id}</strong></div>
                      <div className="order-total">₱{order.total.toFixed(2)}</div>
                    </div>

                    <div className="order-info">
                      <div className="info-row"><span className="label">Items</span><span className="value">{order.itemsCount}</span></div>
                      <div className="info-row"><span className="label">Method</span><span className="value">{order.method}</span></div>
                      <div className="info-row"><span className="label">Payment</span><span className="value">{order.status}</span></div>
                      <div className="info-row"><span className="label">Date</span><span className="value">{order.date}</span></div>
                    </div>

                    <div className="customer-block">
                      <div className="cust-name">{order.customer.name}</div>
                      <div className="cust-address">{order.customer.address}</div>
                      <div className="cust-contact">
                        <div className="cust-email">{order.customer.email}</div>
                        <div className="cust-phone">{order.customer.phone}</div>
                      </div>
                    </div>

                    <button
                      className="view-all-btn"
                      type="button"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowViewAll(true);
                      }}
                    >
                      View All
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}