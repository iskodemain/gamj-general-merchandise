import React, { useEffect, useMemo, useState } from "react";
import "./CancelOrderReview.css";
import { FaTrashCan, FaArrowLeft } from "react-icons/fa6";
import { IoSearchOutline } from "react-icons/io5";
import CancelReason from "./CancelReason.jsx";

function CancelOrderReview({ order = null, onClose = () => {}, orderStatus = "" }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (!order) return;

    const filteredItems =
      orderStatus && order.items
        ? order.items.filter((i) => i.status === orderStatus)
        : order.items || [];

    setItems(filteredItems);
    setSearch("");
  }, [order, orderStatus]);


  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter(
      (i) =>
        (i.name || "").toLowerCase().includes(q) ||
        String(i.id).includes(q)
    );
  }, [items, search]);

  return (
    <div className="cor-review-wrapper">

      {/* If modal is open, show CancelReason */}
      {showReasonModal && selectedItem ? (
        <CancelReason
          item={selectedItem}
          onClose={() => {
            setShowReasonModal(false);
            setSelectedItem(null);
          }}
        />
      ) : (
        <>
          <div className="cor-review-topbar">
            <button className="cor-review-back-btn" onClick={onClose}>
              <FaArrowLeft />
            </button>
            <div className="cor-review-order-title">
              Order #{order?.orderId}
            </div>
          </div>

          <div className="cor-review-content">
            <div className="cor-review-card">
              <div className="cor-review-card-header">
                <div className="cor-review-header-right">
                  <div className="cor-review-search-wrap">
                    <input
                      className="cor-review-search-input"
                      placeholder="Search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <IoSearchOutline className="cor-review-search-icon" />
                  </div>
                </div>
              </div>

              <div className="cor-review-divider" />

              <ul className="cor-review-list">
                {visible.length === 0 && (
                  <li className="cor-review-empty">No items found.</li>
                )}

                {visible.map((item) => (
                  <li key={item.id} className="cor-review-row">
                    <div className="cor-review-item-col">
                      <div className="cor-review-row-left">
                        <img
                          className="cor-review-thumb"
                          src={item.image}
                          alt={item.name}
                        />

                        <div className="cor-review-item-meta">
                          <div className="cor-review-item-name">{item.name}</div>

                          <div className="cor-review-item-sub">
                            <span className="cor-review-meta">
                              Quantity:{" "}
                              <span className="cor-review-qty-variant">
                                {item.qty}
                              </span>
                            </span>

                            {item.value && (
                              <span className="cor-review-meta">
                                Variant:{" "}
                                <span className="cor-review-qty-variant">
                                  {item.value}
                                </span>
                              </span>
                            )}
                          </div>

                          <div className="cor-review-item-price">
                            ₱{Number(item.price).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="cor-review-status-col">
                      <div className="cor-review-status-inner">
                        <span
                          className="cor-review-status-dot"
                          style={{ background: "#e36666" }}
                        />
                        <span className="cor-review-status-label">
                          {item.status} by {item.cancelledBy}{" "}
                          <span className="cancel-status-text">
                            ({item.cancellationStatus})
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="cor-review-pay-col">
                      <div className="cor-review-pay-meta">
                        <div className="cor-review-pay-method">
                          <span className="cor-review-small-label">
                            Payment Method:
                          </span>
                          <span className="cor-review-method-val">
                            {order?.method}
                          </span>
                        </div>
                      </div>

                      <div className="cor-review-btn-ctn">
                        {item.cancellationStatus === "Completed" && (
                          <button type="button">
                            <FaTrashCan className="cor-review-btn-trash" />
                          </button>
                        )}

                        {item.cancelledBy === "Customer" && (
                          <button
                            type="button"
                            className="cor-review-btn-customer"
                            onClick={() => {
                              setSelectedItem(item);
                              setShowReasonModal(true);
                            }}
                          >
                            Reason
                          </button>
                        )}

                        {item.cancelledBy === "Admin" && (
                          <button type="button" className="cor-review-btn-admin">
                            Review
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CancelOrderReview;
