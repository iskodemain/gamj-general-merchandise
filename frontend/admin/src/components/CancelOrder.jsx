import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets.js";
import "./CancelOrder.css";
import ViewAll from "./ViewAll";
import Navbar from "./Navbar.jsx";
import { AdminContext } from "../context/AdminContextProvider.jsx";
import CancelOrderReview from "./Cancellation/CancelOrderReview.jsx";
import { FaArrowLeft } from "react-icons/fa6";
import OrderPaymentProof from "./Modal/OrderPaymentProof.jsx";


function CancelOrder() {
  const { navigate, fetchOrders, fetchOrderItems, products, deliveryInfoList, barangays, cities, provinces, fetchCancelledOrders, fetchOrderProofPayment, setShowOrderPaymentProof, setSelectedPaymentProof, showOrderPaymentProof } = useContext(AdminContext);

  const [showViewAll, setShowViewAll] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewCancelledOrders, setViewCancelledOrders] = useState([]);

  useEffect(() => {
  if (!fetchOrders || fetchOrders.length === 0) {
    setViewCancelledOrders([]);
    return;
  }

  const formatted = fetchOrders
    .filter((o) => o.paymentMethod && o)
    .map((order) => {
      const items = fetchOrderItems.filter(
        (item) => item.orderId === order.ID
      );

      return {
        orderId: order.orderId,
        method: order.paymentMethod,
        date: order.dateOrdered,
        total: Number(order.totalAmount),
        itemsCount: items.length,

        items: items.map((item) => {
          const product = products.find(
            (p) => p.ID === item.productId
          );

          // Find cancellation record that matches this order item
          const cancelRecord = fetchCancelledOrders.find(
            (c) => c.orderItemId === item.ID
          );

          return {
            id: item.ID,
            name: product?.productName,
            image: product?.image1,
            qty: item.quantity,
            value: item.value,
            price: Number(item.subTotal),
            status: item.orderStatus,
            cancellationStatus: cancelRecord?.cancellationStatus,
            cancelledBy: cancelRecord?.cancelledBy,
          };
        }),
      };
    });

    setViewCancelledOrders(formatted);
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
      (proof) => proof.orderId === orderId && proof.customerId === customerId
    );
  };

  const handleReviewReceipt = (orderId, customerId) => {
    const proof = getPaymentProofForOrder(orderId, customerId);
    if (proof) {
      setSelectedPaymentProof(proof);
      setShowOrderPaymentProof(true);
    }
  };


  const cancelledOrders = fetchOrders?.filter((order) => {
    const items = fetchOrderItems.filter(
      (item) => item.orderId === order.ID
    );
    return items.some((item) => item.orderStatus === "Cancelled");
  }) || [];


  return (
    <>
      {showOrderPaymentProof && <OrderPaymentProof />}
      <Navbar TitleName="Order Cancellation" />
      <div className="cancel-orders-container">
        {!showViewAll &&
          <div className="cancel-back-ctn">
            <button className="cancel-order-back-btn" onClick={() => navigate("/orders")}>
                <FaArrowLeft />
            </button>
            <h3 className="cancel-text-title">Back</h3>
          </div>
        }
        {showViewAll ? (
          <CancelOrderReview
            order={selectedOrder}
            onClose={() => setShowViewAll(false)}
            orderStatus = "Cancelled"
          />
        ) : (
          <div className="cancel-orders-page">

            <div className="cancel-orders-header-divider" />

            <div className="cancel-orders-list">
              {cancelledOrders.length === 0 ? (
                <div className="empty-cancel">
                  No cancel orders.
                </div>
              ) : (
                cancelledOrders.toSorted((a, b) => new Date(b.dateOrdered) - new Date(a.dateOrdered)).map((order) => {
                  const items = fetchOrderItems
                    .filter((item) => item.orderId === order.ID)
                    .filter((item) => item.orderStatus === "Cancelled");

                  const subtotal = Number(order.subtotal || 0);
                  const shippingFee = Number(order.shippingFee || 0);
                  const paypalFee = Number(order.paypalFee || 0);
                  const totalAmount = Number(order.totalAmount || 0);

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
                    <article className="cancel-order-card" key={order.ID}>
                      <div className="cancel-order-inner">

                        <div className="cancel-order-left">
                          <ul className="cancel-item-list">
                            {items.map((item) => {
                              const product = products.find(
                                (p) => p.ID === item.productId
                              );

                              return (
                                <li className="cancel-item-row" key={item.ID}>
                                  <img
                                    className="cancel-item-img"
                                    src={product?.image1}
                                    alt={product?.productName}
                                  />

                                  <div className="cancel-item-meta">
                                    <div className="cancel-item-name">
                                      {product?.productName}
                                    </div>

                                    <div className="cancel-item-details">
                                      <div className="cancel-item-qtyblock">
                                        <div>
                                          Quantity:{" "}
                                          <span className="ppq-font">
                                            {item.quantity}
                                          </span>
                                        </div>

                                        <div className="cancel-item-specs">
                                          {item.value && (
                                            <div>
                                              Variant:{" "}
                                              <span className="ppq-specs">
                                                {item.value}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      <div className="cancel-item-price">
                                        ₱{parseFloat(item.subTotal).toFixed(2)}
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                        <div className="cancel-order-right">
                          <div className="cancel-order-top">
                            <div className="cancel-order-number">
                              Order ID: <strong>{order.orderId}</strong>
                            </div>
                          </div>

                          <div className="cancel-order-info">
                            <div className="cancel-info-row">
                              <div className="cancel-info-label">
                                Item: {items.length}
                              </div>
                            </div>

                            <div className="cancel-info-row">
                              <div className="cancel-info-label">
                                Method: {order.paymentMethod}
                              </div>
                            </div>

                            <div className="cancel-info-row">
                              <div className="cancel-info-label">
                                Date: {formatDate(order.dateOrdered)}
                              </div>
                            </div>
                          </div>

                          <div className="cancel-customer-block">
                            <div className="cancel-cust-name">
                              {deliveryInfo?.medicalInstitutionName}
                            </div>

                            <div className="cancel-cust-address">
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

                            <div className="cancel-cust-contact">
                              <div className="proc-cust-email">
                                <span className="ppc-email">Email:</span>{" "}
                                {deliveryInfo?.emailAddress}
                              </div>
                              <div className="proc-cust-phone">
                                <span className="ppc-contact">
                                  Contact No.:
                                </span>{" "}
                                +63 {deliveryInfo?.contactNumber}
                              </div>
                            </div>
                          </div>

                          <div className="cancel-order-total-wrapper">
                            <div className="cancel-order-total-card">

                              <div className="cancel-order-total-row">
                                <span className="cancel-label">Subtotal</span>
                                <span className="cancel-value">₱{subtotal.toFixed(2)}</span>
                              </div>

                              <div className="cancel-order-total-row">
                                <span className="cancel-label">Shipping Fee</span>
                                <span className="cancel-value">₱{shippingFee.toFixed(2)}</span>
                              </div>

                              {order.paymentMethod === 'Paypal' && paypalFee > 0 && (
                                <div className="cancel-order-total-row">
                                  <span className="cancel-label">PayPal Fee</span>
                                  <span className="cancel-value">₱{paypalFee.toFixed(2)}</span>
                                </div>
                              )}

                              <div className="cancel-order-total-divider"></div>

                              <div className="cancel-order-total-row cancel-total-highlight">
                                <span>Total</span>
                                <span>₱{totalAmount.toFixed(2)}</span>
                              </div>

                            </div>
                          </div>

                          <div className="cancel-buttons-container">
                            {/* PAYMENT PROOF STATUS */}
                            {order.paymentMethod === 'Paypal' && (
                              (() => {
                                const proof = getPaymentProofForOrder(order.ID, order.customerId);
                                if (proof) {
                                  return (
                                    <button
                                      type="button"
                                      className="cancel-review-receipt-btn"
                                      onClick={() => handleReviewReceipt(order.ID, order.customerId)}
                                    >
                                      <svg className="cancel-receipt-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      Review Receipt
                                    </button>
                                  );
                                } else {
                                  return (
                                    <div className="cancel-no-receipt-indicator">
                                      <svg className="cancel-warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
                              className="cancel-viewall-btn"
                              onClick={() => {
                                const clean = viewCancelledOrders.find(
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
        )}
      </div>
    </>
  );
}

export default CancelOrder;