import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets.js";
import "./OutforDelivery.css";
import ViewAll from "./ViewAll";
import Navbar from "./Navbar.jsx";
import { AdminContext } from "../context/AdminContextProvider.jsx";


function OutforDelivery() {
  const { navigate, fetchOrders, fetchOrderItems, products, deliveryInfoList, barangays, cities, provinces } = useContext(AdminContext);

  const [showViewAll, setShowViewAll] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewOutForDeliveryOrders, setViewOutForDeliveryOrders] = useState([]);

  useEffect(() => {
  if (!fetchOrders || fetchOrders.length === 0) {
    setViewOutForDeliveryOrders([]);
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

    setViewOutForDeliveryOrders(formatted);
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


  const outForDeliveryOrders = fetchOrders?.filter((order) => {
    const items = fetchOrderItems.filter(
      (item) => item.orderId === order.ID
    );
    return items.some((item) => item.orderStatus === "Out for Delivery");
  }) || [];


  return (
    <>
      <Navbar TitleName="Out for Delivery Orders" />
      <div className="outfordelivery-orders-container">
        {showViewAll ? (
          <ViewAll order={selectedOrder} onClose={() => setShowViewAll(false)} orderStatus="Out for Delivery" />
        ) : (
          <div className="outfordelivery-orders-page">

            <div className="outfordelivery-orders-header-divider" />

            <div className="outfordelivery-orders-list">
              {outForDeliveryOrders.length === 0 ? (
                <div className="empty-ofd">
                  No out for delivery orders.
                </div>
              ) : (
                outForDeliveryOrders.map((order) => {
                  const items = fetchOrderItems
                    .filter((item) => item.orderId === order.ID)
                    .filter((item) => item.orderStatus === "Out for Delivery");

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
                    <article className="ofd-order-card" key={order.ID}>
                      <div className="ofd-order-inner">

                        <div className="ofd-order-left">
                          <ul className="ofd-item-list">
                            {items.map((item) => {
                              const product = products.find((p) => p.ID === item.productId);

                              return (
                                <li className="ofd-item-row" key={item.ID}>
                                  <img
                                    className="ofd-item-img"
                                    src={product?.image1}
                                    alt={product?.productName}
                                  />

                                  <div className="ofd-item-meta">
                                    <div className="ofd-item-name">
                                      {product?.productName}
                                    </div>

                                    <div className="ofd-item-details">
                                      <div className="ofd-item-qtyblock">
                                        <div>
                                          Quantity: <span className="ppq-font">{item.quantity}</span>
                                        </div>

                                        <div className="ofd-item-specs">
                                          {item.value && (
                                            <div>
                                              Variant: <span className="ppq-specs">{item.value}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      <div className="ofd-item-price">
                                        ₱{parseFloat(item.subTotal).toFixed(2)}
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                        <div className="ofd-order-right">
                          <div className="ofd-order-top">
                            <div className="ofd-order-number">
                              Order ID: <strong>{order.orderId}</strong>
                            </div>

                            <div className="ofd-order-total">
                              Total: ₱{orderTotal.toFixed(2)}
                            </div>
                          </div>

                          <div className="ofd-order-info">
                            <div className="ofd-info-row">
                              <div className="ofd-info-label">Item: {items.length}</div>
                            </div>

                            <div className="ofd-info-row">
                              <div className="ofd-info-label">Method: {order.paymentMethod}</div>
                            </div>

                            <div className="ofd-info-row">
                              <div className="ofd-info-label">Date: {formatDate(order.dateOrdered)}</div>
                            </div>
                          </div>

                          <div className="ofd-customer-block">
                            <div className="ofd-cust-name">
                              {deliveryInfo?.medicalInstitutionName}
                            </div>

                            <div className="ofd-cust-address">
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

                            <div className="ofd-cust-contact">
                              <div className="proc-cust-email">
                                <span className="ppc-email">Email:</span> {deliveryInfo?.emailAddress}
                              </div>
                              <div className="proc-cust-phone">
                                <span className="ppc-contact">Contact No.:</span> +63 {deliveryInfo?.contactNumber}
                              </div>
                            </div>
                          </div>

                          <button
                            className="ofd-viewall-btn"
                            onClick={() => {
                              const clean = viewOutForDeliveryOrders.find(
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

export default OutforDelivery;