import React, { useEffect, useMemo, useState } from "react";
import "./ReturnViewAll.css";
import { FaTrashCan, FaArrowLeft } from "react-icons/fa6";
import { IoSearchOutline } from "react-icons/io5";
import ReviewRefund from "./ReviewRefund.jsx"

function ReturnViewAll({ order = null, onClose = () => {}, orderStatus = "" }) {
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
    <div className="return-viewall-wrapper">

      {/* If modal is open, show ReviewRefund */}
      {showReasonModal && selectedItem ? (
        <ReviewRefund
          item={selectedItem}
          onClose={() => {
            setShowReasonModal(false);
            setSelectedItem(null);
          }}
        />
      ) : (
        <>
          <div className="return-viewall-topbar">
            <button className="return-viewall-back-btn" onClick={onClose}>
              <FaArrowLeft />
            </button>
            <div className="return-viewall-order-title">
              Order #{order?.orderId}
            </div>
          </div>

          <div className="return-viewall-content">
            <div className="return-viewall-card">
              <div className="return-viewall-card-header">
                <div className="return-viewall-header-right">
                  <div className="return-viewall-search-wrap">
                    <input
                      className="return-viewall-search-input"
                      placeholder="Search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <IoSearchOutline className="return-viewall-search-icon" />
                  </div>
                </div>
              </div>

              <div className="return-viewall-divider" />

              <ul className="return-viewall-list">
                {visible.length === 0 && (
                  <li className="return-viewall-empty">No items found.</li>
                )}

                {visible.map((item) => (
                  <li key={item.id} className="return-viewall-row">
                    <div className="return-viewall-item-col">
                      <div className="return-viewall-row-left">
                        <img
                          className="return-viewall-thumb"
                          src={item.image}
                          alt={item.name}
                        />

                        <div className="return-viewall-item-meta">
                          <div className="return-viewall-item-name">{item.name}</div>

                          <div className="return-viewall-item-sub">
                            <span className="return-viewall-meta">
                              Quantity:{" "}
                              <span className="return-viewall-qty-variant">
                                {item.qty}
                              </span>
                            </span>

                            {item.value && (
                              <span className="return-viewall-meta">
                                Variant:{" "}
                                <span className="return-viewall-qty-variant">
                                  {item.value}
                                </span>
                              </span>
                            )}
                          </div>

                          <div className="return-viewall-item-price">
                            ₱{Number(item.price).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="return-viewall-status-col">
                      <div className="return-viewall-status-inner">
                        <span
                          className="return-viewall-status-dot"
                          style={{ background: "#e36666" }}
                        />
                        <span className="return-viewall-status-label">
                          {item.status}
                          <span className="return-viewall-cancel-status-text">
                            ({item.refundStatus})
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="return-viewall-pay-col">
                      <div className="return-viewall-pay-meta">
                        <div className="return-viewall-pay-method">
                          <span className="return-viewall-small-label">
                            Payment Method:
                          </span>
                          <span className="return-viewall-method-val">
                            {order?.method}
                          </span>
                        </div>
                      </div>

                      <div className="return-viewall-btn-ctn">
                        {(item.refundStatus === "Refunded" || item.refundStatus === "Rejected") && (
                          <button type="button">
                            <FaTrashCan className="return-viewall-btn-trash" />
                          </button>
                        )}
                        <button 
                        type="button" 
                        className="return-viewall-btn-admin"
                        onClick={() => {
                          console.log(item);
                          setSelectedItem(item);
                          setShowReasonModal(true);

                        }}>
                          Review
                        </button>
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

export default ReturnViewAll;