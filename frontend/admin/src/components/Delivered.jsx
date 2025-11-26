import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets.js";
import "./Delivered.css";
import ViewAll from "./ViewAll";
import Navbar from "./Navbar.jsx";
import { FaTrashCan } from "react-icons/fa6";
import { AdminContext } from "../context/AdminContextProvider.jsx";
import { FaArrowLeft } from "react-icons/fa6";


function Delivered() {
  const { navigate, fetchOrders, fetchOrderItems, products, deliveryInfoList, barangays, cities, provinces } = useContext(AdminContext);

  const [showViewAll, setShowViewAll] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewDeliveredOrders, setViewDeliveredOrders] = useState([]);

  useEffect(() => {
  if (!fetchOrders || fetchOrders.length === 0) {
    setViewDeliveredOrders([]);
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

    setViewDeliveredOrders(formatted);
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


  const deliveredOrders = fetchOrders?.filter((order) => {
    const items = fetchOrderItems.filter(
      (item) => item.orderId === order.ID
    );
    return items.some((item) => item.orderStatus === "Delivered");
  }) || [];

  const handleDeleteDeliveredOrder = async () => {
    // PROCESS THIS
  }

  return (
    <>
      <Navbar TitleName="Delivered Orders" />
      <div className="delivered-orders-container">
        {!showViewAll &&
          <div className="delivered-back-ctn">
            <button className="delivered-order-back-btn" onClick={() => navigate("/activeorders")}>
                <FaArrowLeft />
            </button>
            <h3 className="delivered-text-title">Back</h3>
          </div>
        }

        {showViewAll ? (
          <ViewAll
            order={selectedOrder}
            onClose={() => setShowViewAll(false)}
            orderStatus="Delivered"
          />
        ) : (
          <div className="delivered-orders-page">
            <div className="delivered-orders-header-divider" />

            <div className="delivered-orders-list">
              {deliveredOrders.length === 0 ? (
                <div className="empty-del">No delivered orders.</div>
              ) : (
                deliveredOrders.map((order) => {
                  const items = fetchOrderItems
                    .filter((item) => item.orderId === order.ID)
                    .filter((item) => item.orderStatus === "Delivered");

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
                    <article className="del-order-card" key={order.ID}>
                      <div className="del-order-inner">
                        {/* LEFT */}
                        <div className="del-order-left">
                          <ul className="del-item-list">
                            {items.map((item) => {
                              const product = products.find(
                                (p) => p.ID === item.productId
                              );

                              return (
                                <li className="del-item-row" key={item.ID}>
                                  <img
                                    className="del-item-img"
                                    src={product?.image1}
                                    alt={product?.productName}
                                  />

                                  <div className="del-item-meta">
                                    <div className="del-item-name">
                                      {product?.productName}
                                    </div>

                                    <div className="del-item-details">
                                      <div className="del-item-qtyblock">
                                        <div>
                                          Quantity:{" "}
                                          <span className="ppq-font">
                                            {item.quantity}
                                          </span>
                                        </div>

                                        <div className="del-item-specs">
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

                                      <div className="del-item-price">
                                        ₱{parseFloat(item.subTotal).toFixed(2)}
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                        {/* RIGHT */}
                        <div className="del-order-right">
                          <div className="del-order-top">
                            <div className="del-order-number">
                              Order ID: <strong>{order.orderId}</strong>
                            </div>

                            <div className="del-order-total">
                              Total: ₱{orderTotal.toFixed(2)}
                            </div>
                          </div>

                          <div className="del-order-info">
                            <div className="del-info-row">
                              <div className="del-info-label">
                                Item: {items.length}
                              </div>
                            </div>

                            <div className="del-info-row">
                              <div className="del-info-label">
                                Method: {order.paymentMethod}
                              </div>
                            </div>

                            <div className="del-info-row">
                              <div className="del-info-label">
                                Date: {formatDate(order.dateOrdered)}
                              </div>
                            </div>
                          </div>

                          {/* CUSTOMER INFO */}
                          <div className="del-customer-block">
                            <div className="del-cust-name">
                              {deliveryInfo?.medicalInstitutionName}
                            </div>

                            <div className="del-cust-address">
                              <span className="pp-address">Address: </span>
                              <span className="ppl-adddress">
                                {deliveryInfo?.detailedAddress}, {barangay?.barangayName},{" "}
                                {city?.cityName}, {province?.provinceName},{" "}
                                {deliveryInfo?.zipCode}, {deliveryInfo?.country}
                              </span>
                            </div>

                            <div className="del-cust-contact">
                              <div className="del-cust-email">
                                <span className="ppc-email">Email:</span>{" "}
                                {deliveryInfo?.emailAddress}
                              </div>

                              <div className="del-cust-phone">
                                <span className="ppc-contact">Contact No.:</span>{" "}
                                +63 {deliveryInfo?.contactNumber}
                              </div>
                            </div>
                          </div>

                          <button type="button" className="del-viewall-btn" onClick={() => {
                              const clean = viewDeliveredOrders.find(
                                (o) => o.orderId === order.orderId
                              );
                              setSelectedOrder(clean);
                              setShowViewAll(true);
                            }}>
                            View All
                          </button>

                          <button type="button" onClick={handleDeleteDeliveredOrder} className="trash-viewall-btn"><FaTrashCan /></button>
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

export default Delivered;