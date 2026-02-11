import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets.js";
import "./Pending.css";
import ViewAll from "./ViewAll";
import Navbar from "./Navbar.jsx";
import { AdminContext } from "../context/AdminContextProvider.jsx";
import { FaArrowLeft } from "react-icons/fa6";
import OrderPaymentProof from "./Modal/OrderPaymentProof.jsx";


function Pending() {
  const { navigate, fetchOrders, fetchOrderItems, products, deliveryInfoList, barangays, cities, provinces,fetchOrderProofPayment, setShowOrderPaymentProof, setSelectedPaymentProof, showOrderPaymentProof } = useContext(AdminContext);

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
        orderId: order.orderId,
        customerId: order.customerId,
        method: order.paymentMethod,
        date: order.dateOrdered,
        itemsCount: items.length,

        items: items.map((item) => {
          const product = products.find(
            (p) => p.ID === item.productId
          );

          return {
            id: item.ID,
            name: product?.productName,
            image: product?.image1,
            qty: item.quantity,
            value: item.value,
            price: Number(item.subTotal),
            status: item.orderStatus,
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

  const getPaymentProofForOrder = (orderId, customerId) => {
    return fetchOrderProofPayment.find(
      proof => proof.orderId === orderId && proof.customerId === customerId
    );
  };

  // Handle review receipt click
  const handleReviewReceipt = (orderId, customerId) => {
    const proof = getPaymentProofForOrder(orderId, customerId);
    if (proof) {
      setSelectedPaymentProof(proof);
      setShowOrderPaymentProof(true);
    }
  };

  // STEP 1: Only Pending orders from "orders"
  // Only show orders that have at least one item with status "Processing"
  const pendingOrders = fetchOrders?.filter((order) => {
    const items = fetchOrderItems.filter(
      (item) => item.orderId === order.ID
    );
    return items.some((item) => item.orderStatus === "Pending");
  }) || [];


  return (
    <>
      {showOrderPaymentProof && <OrderPaymentProof />}
      <Navbar TitleName="Pending Orders" />
      <div className="pending-products-container">
        {!showViewAll &&
          <div className="pending-back-ctn">
            <button className="pending-order-back-btn" onClick={() => navigate("/activeorders")}>
                <FaArrowLeft />
            </button>
            <h3 className="pending-text-title">Back</h3>
          </div>
        }
        {/* VIEW ALL PAGE */}
        {showViewAll ? (<ViewAll order={selectedOrder} onClose={() => setShowViewAll(false)} orderStatus="Pending"/>) : 
          <div className="pending-products-page">
            <div className="pending-products-header-divider" />
            <div className="pending-products-list">
              <div className="pending-orders-list">
                {pendingOrders.length === 0 ? (
                  <div className="empty-pen">
                    No pending orders.
                  </div>
                ) : (
                  pendingOrders.toSorted((a, b) => new Date(b.dateOrdered) - new Date(a.dateOrdered)).map((order) => {
                    const items = fetchOrderItems.filter((item) => item.orderId === order.ID).filter((item) => item.orderStatus === "Pending");

                    const orderTotal = items.reduce(
                      (sum, item) => sum + parseFloat(item.subTotal || 0),
                      0
                    );

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
                                            Quantity: <span className="ppq-font">{item.quantity}</span>
                                          </div>

                                          <div className="pending-product-specs">
                                            {item.value && (
                                              <div>
                                                Variant: <span className="ppq-specs">{item.value}</span>
                                              </div>
                                            )}
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
                                <span className="ppl-adddress">
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
                                  <span className="ppc-email">Email:</span> {deliveryInfo?.emailAddress}
                                </div>
                                <div className="pending-product-cust-phone">
                                  <span className="ppc-contact">Contact No.:</span> +63 {deliveryInfo?.contactNumber}
                                </div>
                              </div>
                            </div>

                            {/* BUTTONS CONTAINER */}
                            <div className="pending-product-buttons-container">
                              {/* PAYMENT PROOF STATUS */}
                              {order.paymentMethod === 'Paypal' && (
                                (() => {
                                  const proof = getPaymentProofForOrder(order.ID, order.customerId);
                                  
                                  if (proof) {
                                    return (
                                      <button
                                        type="button"
                                        className="pending-review-receipt-btn"
                                        onClick={() => handleReviewReceipt(order.ID, order.customerId)}
                                      >
                                        <svg className="pending-receipt-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Review Receipt
                                      </button>
                                    );
                                  } else {
                                    return (
                                      <div className="pending-no-receipt-indicator">
                                        <svg className="pending-warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <span>No Receipt Uploaded</span>
                                      </div>
                                    );
                                  }
                                })()
                              )}

                              {/* VIEW ALL BUTTON */}
                              <button
                                type="button"
                                className="pending-product-view-all-btn"
                                onClick={() => {
                                  const clean = viewPendingOrders.find(
                                    (o) => o.orderId === order.orderId
                                  );
                                  setSelectedOrder(clean);
                                  setShowViewAll(true);
                                }}
                              >
                                View All
                              </button>
                            </div>

                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        } 
      </div>
    </>
  );
}

export default Pending;