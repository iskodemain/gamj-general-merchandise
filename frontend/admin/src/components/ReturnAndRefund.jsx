import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets.js";
import "./ReturnAndRefund.css";
import Navbar from "./Navbar.jsx";
import { AdminContext } from "../context/AdminContextProvider.jsx";
import ReturnViewAll from "./ReturnRefund/ReturnViewAll.jsx";
import { FaArrowLeft } from "react-icons/fa6";

function ReturnAndRefund() {
  const { navigate, fetchOrders, fetchOrderItems, products, deliveryInfoList, barangays, cities, provinces, fetchReturnRefundOrders } = useContext(AdminContext);

  const [showViewAll, setShowViewAll] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewReturnRefundOrders, setViewReturnRefundOrders] = useState([]);

  useEffect(() => {
    if (!fetchOrders || fetchOrders.length === 0) {
      setViewReturnRefundOrders([]);
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
          itemsCount: items.length,

          items: items.map((item) => {
            const product = products.find(
              (p) => p.ID === item.productId
            );

            const returnRefundRecord = fetchReturnRefundOrders.find(
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
              refundStatus: returnRefundRecord?.refundStatus,
            };
          }),
        };
      });

    setViewReturnRefundOrders(formatted);
  }, [fetchOrders, fetchOrderItems, products]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const returnRefundOrders = fetchOrders?.filter((order) => {
    const items = fetchOrderItems.filter(
      (item) => item.orderId === order.ID
    );
    return items.some((item) => item.orderStatus === "Return/Refund");
  }) || [];

  return (
    <>
      <Navbar TitleName="Return and Refund" />
      <div className="return-refund-container">
        {!showViewAll &&
          <div className="return-refund-back-ctn">
            <button className="return-refund-back-btn" onClick={() => navigate("/orders")}>
              <FaArrowLeft />
            </button>
            <h3 className="return-refund-text-title">Back</h3>
          </div>
        }
        {showViewAll ? (
          <ReturnViewAll
            order={selectedOrder}
            onClose={() => setShowViewAll(false)}
            orderStatus="Return/Refund"
          />
        ) : (
          <div className="return-refund-page">

            <div className="return-refund-header-divider" />

            <div className="return-refund-list">
              {returnRefundOrders.length === 0 ? (
                <div className="return-refund-empty">
                  No return/refund orders.
                </div>
              ) : (
                returnRefundOrders.toSorted((a, b) => new Date(b.dateOrdered) - new Date(a.dateOrdered)).map((order) => {
                  const items = fetchOrderItems
                    .filter((item) => item.orderId === order.ID)
                    .filter((item) => item.orderStatus === "Return/Refund");

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
                    <article className="return-refund-card" key={order.ID}>
                      <div className="return-refund-inner">

                        <div className="return-refund-left">
                          <ul className="return-refund-item-list">
                            {items.map((item) => {
                              const product = products.find(
                                (p) => p.ID === item.productId
                              );

                              return (
                                <li className="return-refund-item-row" key={item.ID}>
                                  <img
                                    className="return-refund-item-img"
                                    src={product?.image1}
                                    alt={product?.productName}
                                  />

                                  <div className="return-refund-item-meta">
                                    <div className="return-refund-item-name">
                                      {product?.productName}
                                    </div>

                                    <div className="return-refund-item-details">
                                      <div className="return-refund-item-qtyblock">
                                        <div>
                                          Quantity:{" "}
                                          <span className="ppq-font">
                                            {item.quantity}
                                          </span>
                                        </div>

                                        <div className="return-refund-item-specs">
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

                                      <div className="return-refund-item-price">
                                        ₱{parseFloat(item.subTotal).toFixed(2)}
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                        <div className="return-refund-right">
                          <div className="return-refund-top">
                            <div className="return-refund-number">
                              Order ID: <strong>{order.orderId}</strong>
                            </div>

                            <div className="return-refund-total">
                              Total: ₱{orderTotal.toFixed(2)}
                            </div>
                          </div>

                          <div className="return-refund-info">
                            <div className="return-refund-info-row">
                              <div className="return-refund-info-label">
                                Item: {items.length}
                              </div>
                            </div>

                            <div className="return-refund-info-row">
                              <div className="return-refund-info-label">
                                Method: {order.paymentMethod}
                              </div>
                            </div>

                            <div className="return-refund-info-row">
                              <div className="return-refund-info-label">
                                Date: {formatDate(order.dateOrdered)}
                              </div>
                            </div>
                          </div>

                          <div className="return-refund-customer-block">
                            <div className="return-refund-cust-name">
                              {deliveryInfo?.medicalInstitutionName}
                            </div>

                            <div className="return-refund-cust-address">
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

                            <div className="return-refund-cust-contact">
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
                            className="return-refund-viewall-btn"
                            onClick={() => {
                              const clean = viewReturnRefundOrders.find(
                                (o) => o.orderId === order.orderId
                              );
                              console.log("Selected Order:", clean);
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

export default ReturnAndRefund;