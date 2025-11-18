import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets.js";
import "./Pending.css";
import ViewAll from "./ViewAll";
import Navbar from "./Navbar.jsx";
import { AdminContext } from "../context/AdminContextProvider.jsx";


function Pending() {
  const { navigate, fetchOrders, fetchOrderItems, products, deliveryInfoList, barangays, cities, provinces } = useContext(AdminContext);

  const [showViewAll, setShowViewAll] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewPendingOrders, setViewPendingOrders] = useState([]);

  useEffect(() => {
  if (!fetchOrders || fetchOrders.length === 0) {
    setViewPendingOrders([]);
    return;
  }

  const formatted = fetchOrders
    .filter((o) => o.paymentMethod && o)   // MUST MATCH pendingOrders filter
    .map((order) => {
      const items = fetchOrderItems.filter(
        (item) => item.orderId === order.ID
      );

      return {
        orderId: order.ID,
        method: order.paymentMethod,
        date: order.dateOrdered,
        total: Number(order.totalAmount),
        itemsCount: items.length,

        items: items.map((item) => {
          const product = products.find(
            (p) => p.ID === item.productId
          );

          let value = "No Variant";
          if (item.variantValues && item.variantValues.length > 0) {
            value = item.variantValues.map((v) => v.value).join(", ");
          }

          return {
            id: item.ID,
            name: product?.productName || "Product",
            image: product?.image1,
            qty: item.quantity,
            value,
            price: Number(item.subTotal) / item.quantity,
            status: item.orderStatus || "Pending",
          };
        }),
      };
    });

    setViewPendingOrders(formatted);
  }, [fetchOrders, fetchOrderItems, products]);



  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // STEP 1: Only Pending orders from "orders"
  const pendingOrders = fetchOrders?.filter(o => o.paymentMethod && o) || [];

  return (
    <>
      <Navbar TitleName="Pending Orders" />
      <div className="pending-products-container">
        <div className="pending-products-page">
          <div className="pending-products-header-divider" />
          {/* VIEW ALL PAGE */}
          {showViewAll && <ViewAll order={selectedOrder} onClose={() => setShowViewAll(false)}/>} 
            
          <div className="pending-products-list">
              {pendingOrders.map((order) => {
                // STEP 2: Get all orderItems belonging to this order
                const items = fetchOrderItems.filter(
                  (item) => item.orderId === order.ID
                );

                // STEP 3: Compute total
                const orderTotal = items.reduce(
                  (sum, item) => sum + parseFloat(item.subTotal || 0),
                  0
                );

                // STEP 4: Customer delivery info
                const deliveryInfo = deliveryInfoList.find(
                  (d) => d.customerId === order.customerId
                );

                const barangay = barangays.find(
                  (b) => b.ID === deliveryInfo?.barangayId
                );
                const city = cities.find(
                  (c) => c.ID === deliveryInfo?.cityId
                );
                const province = provinces.find(
                  (p) => p.ID === deliveryInfo?.provinceId
                );

                return (
                  <article className="pending-product-card" key={order.ID}>
                    <div className="pending-product-inner">

                      {/* LEFT SIDE – PRODUCT LIST */}
                      <div className="pending-product-left-col">
                        <ul className="pending-product-items">
                          {items.map((item) => {
                            const product = products.find(
                              (p) => p.ID === item.productId
                            );

                            return (
                              <li className="pending-product-row" key={item.ID}>
                                <img
                                  className="pending-product-img"
                                  src={product?.image1}
                                  alt={product?.productName}
                                />

                                <div className="pending-product-meta">
                                  <div className="pending-product-name">
                                    {product?.productName}
                                  </div>

                                  <div className="pending-product-details">
                                    <div className="pending-product-qty-value">
                                      <div>
                                        Qty: {item.quantity}
                                      </div>

                                      <div className="pending-product-specs">
                                        {item.value && item.value}
                                      </div>
                                      
                                    </div>

                                    <div className="pending-product-price">
                                      ₱{parseFloat(item.subTotal).toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      {/* RIGHT SIDE – ORDER DETAILS */}
                      <div className="pending-product-right-col">
                        <div className="pending-product-order-top">
                          <div className="pending-product-order-number">
                            Order ID: <strong>{order.orderId}</strong>
                          </div>

                          <div className="pending-product-order-total">
                            Total: ₱{orderTotal.toFixed(2)}
                          </div>
                        </div>

                        <div className="pending-product-order-info">
                          <div className="pending-product-info-row">
                            <div className="pending-product-label">Item: {items.length}</div>
                          </div>

                          <div className="pending-product-info-row">
                            <div className="pending-product-label">
                              Method: {order.paymentMethod}
                            </div>
                          </div>

                          <div className="pending-product-info-row">
                            <div className="pending-product-label">
                              Date: {formatDate(order.dateOrdered)}
                            </div>
                          </div>
                        </div>

                        {/* CUSTOMER INFO */}
                        <div className="pending-product-customer-block">
                          <div className="pending-product-cust-name">
                            {deliveryInfo?.medicalInstitutionName}
                          </div>

                          <div className="pending-product-cust-address">
                            <span className="pp-address">Address: </span>
                            <span>
                              {deliveryInfo?.detailedAddress},{" "}
                              {barangay?.barangayName},{" "}
                              {city?.cityName},{" "}
                              {province?.provinceName},{" "}
                              {deliveryInfo?.zipCode},{" "}
                              {deliveryInfo?.country}
                            </span>
                          </div>

                          <div className="pending-product-cust-contact">
                            <div className="pending-product-cust-email">
                              Email: {deliveryInfo?.emailAddress}
                            </div>
                            <div className="pending-product-cust-phone">
                              Contact No.: {deliveryInfo?.contactNumber}
                            </div>
                          </div>
                        </div>

                        {/* VIEW ALL BUTTON */}
                        <button
                          className="pending-product-view-all-btn"
                          onClick={() => {
                            console.log("Clicked order from Pending:", order);
                            const clean = viewPendingOrders.find(
                              (o) => o.orderId === order.ID
                            );
                            console.log("Matched clean order:", clean);
                            setSelectedOrder(clean);
                            setShowViewAll(true);
                          }}
                        >
                          View All
                        </button>

                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
        </div>
      </div>
    </>
  );
}

export default Pending;