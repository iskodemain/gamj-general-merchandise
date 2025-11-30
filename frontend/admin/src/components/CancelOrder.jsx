import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets.js";
import "./CancelOrder.css";
import ViewAll from "./ViewAll";
import Navbar from "./Navbar.jsx";
import { AdminContext } from "../context/AdminContextProvider.jsx";
import CancelOrderReview from "./Cancellation/CancelOrderReview.jsx";
import { FaArrowLeft } from "react-icons/fa6";


function CancelOrder() {
  const { navigate, fetchOrders, fetchOrderItems, products, deliveryInfoList, barangays, cities, provinces, fetchCancelledOrders } = useContext(AdminContext);

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


  const cancelledOrders = fetchOrders?.filter((order) => {
    const items = fetchOrderItems.filter(
      (item) => item.orderId === order.ID
    );
    return items.some((item) => item.orderStatus === "Cancelled");
  }) || [];


  return (
    <>
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

                            <div className="cancel-order-total">
                              Total: ₱{orderTotal.toFixed(2)}
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