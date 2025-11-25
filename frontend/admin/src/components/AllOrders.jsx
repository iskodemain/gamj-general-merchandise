import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets.js";
import "./AllOrders.css";
import ViewAll from "./ViewAll";
import Navbar from "./Navbar.jsx";
import { AdminContext } from "../context/AdminContextProvider.jsx";


function AllOrders() {
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
        orderId: order.orderId,
        method: order.paymentMethod,
        date: order.dateOrdered,
        total: Number(order.totalAmount),
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

  // STEP 1: Only Pending orders from "orders"
  const pendingOrders = fetchOrders?.filter((order) => {
    const items = fetchOrderItems.filter(
      (item) => item.orderId === order.ID
    );
    return items.some((item) => item.orderStatus === "Pending" || item.orderStatus === "Processing" || item.orderStatus === "Out for Delivery" || item.orderStatus === "Delivered");
  }) || [];

  return (
    <>
    <Navbar TitleName="All Orders" />
      <div className="ao-container">
        {showViewAll ? (
          <ViewAll
            order={selectedOrder}
            onClose={() => setShowViewAll(false)}
          />
        ) : (
          <div className="ao-page">
            <div className="ao-header-divider" />

            <div className="ao-list">
              {pendingOrders.map((order) => {
                const items = fetchOrderItems.filter(
                  (item) => item.orderId === order.ID
                );

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
                  <article className="ao-card" key={order.ID}>
                    <div className="ao-inner">

                      <div className="ao-left-col">
                        <ul className="ao-items">
                          {items.map((item) => {
                            const product = products.find(
                              (p) => p.ID === item.productId
                            );

                            return (
                              <li className="ao-row" key={item.ID}>
                                <img
                                  className="ao-img"
                                  src={product?.image1}
                                  alt={product?.productName}
                                />

                                <div className="ao-meta">
                                  <div className="ao-name">
                                    {product?.productName}
                                  </div>

                                  <div className="ao-details">
                                    <div className="ao-qty-row">
                                      <div>
                                        Quantity:{" "}
                                        <span className="ao-qty">
                                          {item.quantity}
                                        </span>
                                      </div>

                                      <div className="ao-spec-wrap">
                                        {item.value && (
                                          <div>
                                            Variant:{" "}
                                            <span className="ao-spec">
                                              {item.value}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="ao-price">
                                      ₱{parseFloat(item.subTotal).toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      <div className="ao-right-col">
                        <div className="ao-order-top">
                          <div className="ao-order-id">
                            Order ID: <strong>{order.orderId}</strong>
                          </div>

                          <div className="ao-order-total">
                            Total: ₱{orderTotal.toFixed(2)}
                          </div>
                        </div>

                        <div className="ao-order-info">
                          <div className="ao-info-row">
                            <div className="ao-info-label">
                              Item: {items.length}
                            </div>
                          </div>

                          <div className="ao-info-row">
                            <div className="ao-info-label">
                              Method: {order.paymentMethod}
                            </div>
                          </div>

                          <div className="ao-info-row">
                            <div className="ao-info-label">
                              Date: {formatDate(order.dateOrdered)}
                            </div>
                          </div>
                        </div>

                        <div className="ao-customer">
                          <div className="ao-cust-name">
                            {deliveryInfo?.medicalInstitutionName}
                          </div>

                          <div className="ao-cust-address">
                            <span className="ao-addr-label">Address: </span>
                            <span className="ao-addr-val">
                              {deliveryInfo?.detailedAddress},{" "}
                              {barangay?.barangayName},{" "}
                              {city?.cityName},{" "}
                              {province?.provinceName},{" "}
                              {deliveryInfo?.zipCode},{" "}
                              {deliveryInfo?.country}
                            </span>
                          </div>

                          <div className="ao-cust-contact">
                            <div className="ao-cust-email">
                              <span className="ao-email-label">Email:</span>{" "}
                              {deliveryInfo?.emailAddress}
                            </div>
                            <div className="ao-cust-phone">
                              <span className="ao-phone-label">
                                Contact No.:
                              </span>{" "}
                              +63 {deliveryInfo?.contactNumber}
                            </div>
                          </div>
                        </div>

                        <button
                          className="ao-view-btn"
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
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default AllOrders;