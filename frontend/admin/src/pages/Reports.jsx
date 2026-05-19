import React, { useContext, useMemo, useState } from "react";
import "./Reports.css";
import { AdminContext } from "../context/AdminContextProvider";
import Navbar from "../components/Navbar";
import ExportBar from "../components/ExportBar";
import { exportExcel, exportPDF, printTable } from "../utils/exportUtils";

const ORDER_TYPE_OPTIONS = [
  "All","Pending","Processing","Out for Delivery","Delivered","Cancellation","Return and Refund",
];
const PAYMENT_OPTIONS = ["All", "Cash On Delivery", "Paypal"];
const INV_TYPE_OPTIONS = ["All", "Stock In", "Stock Out", "Return", "Damaged", "Adjust"];
const INV_TYPE_MAP = { "Stock In":"IN","Stock Out":"OUT","Return":"RETURN","Damaged":"DAMAGED","Adjust":"ADJUST" };
const STOCK_STATUS_OPTIONS = ["All", "In Stock", "Low Stock", "Out of Stock"];

const Reports = () => {
  const {
    fetchOrderTransaction, fetchOrders, fetchOrderItems,
    fetchInventoryStock, fetchInventoryHistory, fetchInventorySettings,
    products, variantName, productVariantValues, productVariantCombination,
  } = useContext(AdminContext);

  const [orderFrom, setOrderFrom] = useState("");
  const [orderTo, setOrderTo] = useState("");
  const [orderTypeFilter, setOrderTypeFilter] = useState("All");
  const [orderPaymentFilter, setOrderPaymentFilter] = useState("All");
  const [inventoryFrom, setInventoryFrom] = useState("");
  const [inventoryTo, setInventoryTo] = useState("");
  const [invTypeFilter, setInvTypeFilter] = useState("All");
  const [stockStatusFilter, setStockStatusFilter] = useState("All");

  const inRange = (date, from, to) => {
    if (!from && !to) return true;
    const d = new Date(date);
    if (from && d < new Date(from)) return false;
    if (to) { const end = new Date(to); end.setHours(23,59,59,999); if (d > end) return false; }
    return true;
  };

  const getOrderId = (id) => fetchOrders?.find(o => o.ID === id)?.orderId || "N/A";

  const getProductDetails = (productId, variantValueId, variantCombinationId) => {
    const product = products?.find(p => p.ID === productId);
    const name = product?.productName || "Unknown";
    if (variantCombinationId) {
      const combo = productVariantCombination?.find(c => c.ID === variantCombinationId);
      if (combo?.combinations) {
        try { return `${name} (${JSON.parse(combo.combinations).join(", ")})`; } catch { return `${name} (${combo.combinations})`; }
      }
    }
    if (variantValueId) {
      const v = productVariantValues?.find(v => v.ID === variantValueId);
      if (v) { const vn = variantName?.find(vn => vn.ID === v.variantNameId); return `${name} (${vn?.name || "Variant"}: ${v.value})`; }
    }
    return name;
  };

  const getOrderProductDetails = (orderIdNum, orderItemIdNum) => {
    if (orderItemIdNum) {
      const item = fetchOrderItems?.find(oi => oi.ID === orderItemIdNum);
      if (item) return getProductDetails(item.productId, item.productVariantValueId, item.productVariantCombinationId);
      return "Unknown";
    }
    const items = fetchOrderItems?.filter(oi => oi.orderId === orderIdNum) || [];
    return items.map(i => getProductDetails(i.productId, i.productVariantValueId, i.productVariantCombinationId)).join(", ") || "N/A";
  };

  const getThreshold = (productId, variantValueId, variantCombinationId) =>
    fetchInventorySettings?.find(s => s.productId === productId && s.variantValueId === variantValueId && s.variantCombinationId === variantCombinationId);

  const getCurrentStock = (productId, variantValueId, variantCombinationId) =>
    fetchInventoryStock?.find(s => s.productId === productId && s.variantValueId === variantValueId && s.variantCombinationId === variantCombinationId)?.totalQuantity ?? 0;

  const getStockStatus = (productId, variantValueId, variantCombinationId) => {
    const qty = getCurrentStock(productId, variantValueId, variantCombinationId);
    if (qty === 0) return "Out of Stock";
    const t = getThreshold(productId, variantValueId, variantCombinationId);
    return t && qty <= t.lowStockThreshold ? "Low Stock" : "In Stock";
  };

  const orderTypeLabelMap = {
    "Pending": ["Order Placed"],
    "Processing": ["Order Processing"],
    "Out for Delivery": ["Out for Delivery"],
    "Delivered": ["Order Delivered"],
    "Cancellation": ["Order Cancelled","Order Cancellation Processed","Order Cancellation Request","Order Cancellation Request Cancelled","Admin Cancellation Removed","Order Cancellation Refunded"],
    "Return and Refund": ["Order Refund Requested","Order Refund Approved","Order Refund Processing","Order Refund Completed","Order Refund Rejected","Return/Refund Stock Processed"],
  };

  const filteredOrderTransactions = useMemo(() => {
    let list = [...(fetchOrderTransaction || [])];
    list = list.filter(t => inRange(t.transactionDate, orderFrom, orderTo));
    if (orderTypeFilter !== "All") {
      const allowed = orderTypeLabelMap[orderTypeFilter] || [];
      list = list.filter(t => allowed.includes(t.transactionType));
    }
    if (orderPaymentFilter !== "All") list = list.filter(t => t.paymentMethod === orderPaymentFilter);
    return list.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
  }, [fetchOrderTransaction, orderFrom, orderTo, orderTypeFilter, orderPaymentFilter]);

  const filteredInventoryHistory = useMemo(() => {
    let list = [...(fetchInventoryHistory || [])];
    list = list.filter(h => inRange(h.createdAt, inventoryFrom, inventoryTo));
    if (invTypeFilter !== "All") { const mapped = INV_TYPE_MAP[invTypeFilter]; if (mapped) list = list.filter(h => h.type === mapped); }
    if (stockStatusFilter !== "All") list = list.filter(h => getStockStatus(h.productId, h.variantValueId, h.variantCombinationId) === stockStatusFilter);
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [fetchInventoryHistory, inventoryFrom, inventoryTo, invTypeFilter, stockStatusFilter, fetchInventoryStock, fetchInventorySettings]);

  const orderRows = useMemo(() => filteredOrderTransactions.map(tx => ({
    "Transaction ID": tx.transactionId,
    "Order ID": getOrderId(tx.orderId),
    "Product(s)": getOrderProductDetails(tx.orderId, tx.orderItemId),
    "Type": tx.transactionType,
    "Amount": `₱${Number(tx.totalAmount).toFixed(2)}`,
    "Payment": tx.paymentMethod || "—",
    "Date": new Date(tx.transactionDate).toLocaleDateString(),
  })), [filteredOrderTransactions]);

  const inventoryRows = useMemo(() => filteredInventoryHistory.map(h => ({
    "Product": getProductDetails(h.productId, h.variantValueId, h.variantCombinationId),
    "Type": h.type,
    "Qty": h.quantity,
    "Stock After": h.stockAfter ?? "—",
    "Stock Status": getStockStatus(h.productId, h.variantValueId, h.variantCombinationId),
    "Reference": h.referenceId || "—",
    "Date": new Date(h.createdAt).toLocaleDateString(),
  })), [filteredInventoryHistory]);

  const statusClass = (s) => s === "Out of Stock" ? "status-out" : s === "Low Stock" ? "status-low" : "status-ok";
  const statusLabel = (s) => s === "Out of Stock" ? "❌ OUT" : s === "Low Stock" ? "⚠️ LOW" : "✅ OK";

  return (
    <>
      <Navbar TitleName="Order & Inventory Reports" />
      <div className="reports-container">

        {/* ══ ORDER REPORTS ══ */}
        <section className="rpt-section">
          <div className="rpt-section-head">
            <h3 className="rpt-section-title">Order Reports</h3>
            <div className="rpt-controls">
              <div className="rpt-filters">
                <div className="rpt-filter-group">
                  <label className="rpt-filter-label">Type</label>
                  <select className="rpt-select" value={orderTypeFilter} onChange={e => setOrderTypeFilter(e.target.value)}>
                    {ORDER_TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="rpt-filter-group">
                  <label className="rpt-filter-label">Payment</label>
                  <select className="rpt-select" value={orderPaymentFilter} onChange={e => setOrderPaymentFilter(e.target.value)}>
                    {PAYMENT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="rpt-filter-group">
                  <label className="rpt-filter-label">From</label>
                  <input className="rpt-date" type="date" value={orderFrom} onChange={e => setOrderFrom(e.target.value)} />
                </div>
                <div className="rpt-filter-group">
                  <label className="rpt-filter-label">To</label>
                  <input className="rpt-date" type="date" value={orderTo} onChange={e => setOrderTo(e.target.value)} />
                </div>
              </div>
              <ExportBar
                disabled={!orderRows.length}
                onExcelClick={() => exportExcel(orderRows, "order-report.xlsx")}
                onPDFClick={() => exportPDF(orderRows, "Order Report", "order-report.pdf")}
                onPrintClick={() => printTable(orderRows, "Order Report")}
              />
            </div>
          </div>
          <div className="rpt-count">{orderRows.length} record{orderRows.length !== 1 ? "s" : ""}</div>
          <div className="rpt-table-wrap">
            <table className="rpt-table">
              <thead><tr><th>Transaction ID</th><th>Order ID</th><th>Product(s)</th><th>Type</th><th>Amount</th><th>Payment</th><th>Date</th></tr></thead>
              <tbody>
                {orderRows.length ? orderRows.map((r, i) => (
                  <tr key={i}>
                    <td>{r["Transaction ID"]}</td>
                    <td>{r["Order ID"]}</td>
                    <td className="rpt-td-product">{r["Product(s)"]}</td>
                    <td>{r["Type"]}</td>
                    <td>{r["Amount"]}</td>
                    <td>{r["Payment"]}</td>
                    <td>{r["Date"]}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="7" className="rpt-empty">No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ══ INVENTORY REPORTS ══ */}
        <section className="rpt-section">
          <div className="rpt-section-head">
            <h3 className="rpt-section-title">Inventory Reports</h3>
            <div className="rpt-controls">
              <div className="rpt-filters">
                <div className="rpt-filter-group">
                  <label className="rpt-filter-label">Type</label>
                  <select className="rpt-select" value={invTypeFilter} onChange={e => setInvTypeFilter(e.target.value)}>
                    {INV_TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="rpt-filter-group">
                  <label className="rpt-filter-label">Stock Status</label>
                  <select className="rpt-select" value={stockStatusFilter} onChange={e => setStockStatusFilter(e.target.value)}>
                    {STOCK_STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="rpt-filter-group">
                  <label className="rpt-filter-label">From</label>
                  <input className="rpt-date" type="date" value={inventoryFrom} onChange={e => setInventoryFrom(e.target.value)} />
                </div>
                <div className="rpt-filter-group">
                  <label className="rpt-filter-label">To</label>
                  <input className="rpt-date" type="date" value={inventoryTo} onChange={e => setInventoryTo(e.target.value)} />
                </div>
              </div>
              <ExportBar
                disabled={!inventoryRows.length}
                onExcelClick={() => exportExcel(inventoryRows, "inventory-report.xlsx")}
                onPDFClick={() => exportPDF(inventoryRows, "Inventory Report", "inventory-report.pdf")}
                onPrintClick={() => printTable(inventoryRows, "Inventory Report")}
              />
            </div>
          </div>
          <div className="rpt-count">{inventoryRows.length} record{inventoryRows.length !== 1 ? "s" : ""}</div>
          <div className="rpt-table-wrap">
            <table className="rpt-table">
              <thead><tr><th>Product</th><th>Type</th><th>Qty</th><th>Stock After</th><th>Stock Status</th><th>Reference</th><th>Date</th></tr></thead>
              <tbody>
                {inventoryRows.length ? inventoryRows.map((r, i) => {
                  const s = r["Stock Status"];
                  return (
                    <tr key={i}>
                      <td className="rpt-td-product">{r["Product"]}</td>
                      <td>{r["Type"]}</td>
                      <td>{r["Qty"]}</td>
                      <td>{r["Stock After"]}</td>
                      <td><span className={`rpt-status-badge ${statusClass(s)}`}>{statusLabel(s)}</span></td>
                      <td>{r["Reference"]}</td>
                      <td>{r["Date"]}</td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="7" className="rpt-empty">No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </>
  );
};

export default Reports;
