import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets.js";
import "./Processing.css";
import ViewAll from "./ViewAll";
import Navbar from "./Navbar.jsx";
import { AdminContext } from "../context/AdminContextProvider.jsx";
import { FaArrowLeft } from "react-icons/fa6";


function Processing() {
  const { navigate, fetchOrders, fetchOrderItems, products, deliveryInfoList, barangays, cities, provinces } = useContext(AdminContext);

  const [showViewAll, setShowViewAll] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewProcessingOrders, setViewProcessingOrders] = useState([]);

  useEffect(() => {
  if (!fetchOrders || fetchOrders.length === 0) {
    setViewProcessingOrders([]);
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

    setViewProcessingOrders(formatted);
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


  const processingOrders = fetchOrders?.filter((order) => {
    const items = fetchOrderItems.filter(
      (item) => item.orderId === order.ID
    );
    return items.some((item) => item.orderStatus === "Processing");
  }) || [];


  return (
    <>
      <Navbar TitleName="Processing Orders" />
      <div className="processing-orders-container">
        {!showViewAll &&
          <div className="processing-back-ctn">
            <button className="processing-order-back-btn" onClick={() => navigate("/activeorders")}>
                <FaArrowLeft />
            </button>
            <h3 className="processing-text-title">Back</h3>
          </div>
        }
        {showViewAll ? (
          <ViewAll order={selectedOrder} onClose={() => setShowViewAll(false)} orderStatus="Processing"/>
        ) : (
          <div className="processing-orders-page">

            <div className="processing-orders-header-divider" />

            <div className="processing-orders-list">
              {processingOrders.length === 0 ? (
                <div className="empty-proc">
                  No processing orders.
                </div>
              ) : (
                processingOrders.map((order) => {
                  const items = fetchOrderItems.filter((item) => item.orderId === order.ID).filter((item) => item.orderStatus === "Processing");

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
                    <article className="proc-order-card" key={order.ID}>
                      <div className="proc-order-inner">
                        {/* LEFT SIDE */}
                        <div className="proc-order-left">
                          <ul className="proc-item-list">
                            {items.map((item) => {
                              const product = products.find((p) => p.ID === item.productId);

                              return (
                                <li className="proc-item-row" key={item.ID}>
                                  <img
                                    className="proc-item-img"
                                    src={product?.image1}
                                    alt={product?.productName}
                                  />

                                  <div className="proc-item-meta">
                                    <div className="proc-item-name">
                                      {product?.productName}
                                    </div>

                                    <div className="proc-item-details">
                                      <div className="proc-item-qtyblock">
                                        <div>
                                          Quantity: <span className="ppq-font">{item.quantity}</span>
                                        </div>

                                        <div className="proc-item-specs">
                                          {item.value && (
                                            <div>
                                              Variant: <span className="ppq-specs">{item.value}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      <div className="proc-item-price">
                                        ₱{parseFloat(item.subTotal).toFixed(2)}
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                        {/* RIGHT SIDE */}
                        <div className="proc-order-right">
                          <div className="proc-order-top">
                            <div className="proc-order-number">
                              Order ID: <strong>{order.orderId}</strong>
                            </div>

                            <div className="proc-order-total">
                              Total: ₱{orderTotal.toFixed(2)}
                            </div>
                          </div>

                          <div className="proc-order-info">
                            <div className="proc-info-row">
                              <div className="proc-info-label">Item: {items.length}</div>
                            </div>

                            <div className="proc-info-row">
                              <div className="proc-info-label">Method: {order.paymentMethod}</div>
                            </div>

                            <div className="proc-info-row">
                              <div className="proc-info-label">Date: {formatDate(order.dateOrdered)}</div>
                            </div>
                          </div>

                          {/* CUSTOMER INFO */}
                          <div className="proc-customer-block">
                            <div className="proc-cust-name">
                              {deliveryInfo?.medicalInstitutionName}
                            </div>

                            <div className="proc-cust-address">
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

                            <div className="proc-cust-contact">
                              <div className="proc-cust-email">
                                <span className="ppc-email">Email:</span> {deliveryInfo?.emailAddress}
                              </div>
                              <div className="proc-cust-phone">
                                <span className="ppc-contact">Contact No.:</span> +63 {deliveryInfo?.contactNumber}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="proc-viewall-btn"
                            onClick={() => {
                              const clean = viewProcessingOrders.find(
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

export default Processing;