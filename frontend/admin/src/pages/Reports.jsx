import React, { useContext, useMemo, useState } from "react";
import "./Reports.css";
import { AdminContext } from "../context/AdminContextProvider";
import Navbar from "../components/Navbar";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"
import { Document, Packer, Paragraph } from "docx";
import { saveAs } from "file-saver";

const Reports = () => {
  const {
    fetchOrderTransaction,
    fetchOrders,
    fetchOrderItems,
    fetchCancelledOrders,
    fetchInventoryStock,
    fetchInventoryBatch,
    fetchInventoryHistory,
    products,
    variantName,
    productVariantValues,
    productVariantCombination,
  } = useContext(AdminContext);

  /* ======================
     📅 DATE RANGE STATES
  ====================== */
  const [orderFrom, setOrderFrom] = useState("");
  const [orderTo, setOrderTo] = useState("");

  const [inventoryFrom, setInventoryFrom] = useState("");
  const [inventoryTo, setInventoryTo] = useState("");

  const inRange = (date, from, to) => {
    if (!from || !to) return true;
    const d = new Date(date);
    return d >= new Date(from) && d <= new Date(to);
  };

  /* ======================
     🔍 FILTERED DATA
  ====================== */
  const filteredOrderTransactions = useMemo(
    () =>
      fetchOrderTransaction.filter(t =>
        inRange(t.transactionDate, orderFrom, orderTo)
      ),
    [fetchOrderTransaction, orderFrom, orderTo]
  );

  const filteredInventoryHistory = useMemo(
    () =>
      fetchInventoryHistory.filter(h =>
        inRange(h.createdAt, inventoryFrom, inventoryTo)
      ),
    [fetchInventoryHistory, inventoryFrom, inventoryTo]
  );

  /* ======================
     📊 SUMMARY
  ====================== */
  const summary = useMemo(() => {
    const totalRevenue = filteredOrderTransactions
      .filter(t => t.transactionType === "Order Placed")
      .reduce((sum, t) => sum + Number(t.totalAmount || 0), 0);

    return {
      totalOrders: filteredOrderTransactions.length,
      totalRevenue,
      cancelledCount: fetchCancelledOrders.filter(c =>
        inRange(c.dateCancelled, orderFrom, orderTo)
      ).length,
    };
  }, [filteredOrderTransactions, fetchCancelledOrders, orderFrom, orderTo]);

  /* ======================
     🔧 HELPER FUNCTIONS
  ====================== */
  
  // Get orderId string from fetchOrders
  const getOrderId = (orderIdNum) => {
    const order = fetchOrders?.find(o => o.ID === orderIdNum);
    return order?.orderId || 'N/A';
  };

  // Get product details with variants (for single item)
  const getProductDetails = (productId, variantValueId, variantCombinationId) => {
    const product = products?.find(p => p.ID === productId);
    const productName = product?.productName || 'Unknown Product';

    let variantInfo = '';

    // Check for variant combination first
    if (variantCombinationId) {
      const combo = productVariantCombination?.find(c => c.ID === variantCombinationId);
      if (combo && combo.combinations) {
        try {
          const combinations = JSON.parse(combo.combinations);
          variantInfo = ` (${combinations.join(', ')})`;
        } catch {
          variantInfo = ` (${combo.combinations})`;
        }
      }
    }
    // Then check for single variant value
    else if (variantValueId) {
      const variant = productVariantValues?.find(v => v.ID === variantValueId);
      if (variant) {
        const vName = variantName?.find(vn => vn.ID === variant.variantNameId);
        variantInfo = ` (${vName?.name || 'Variant'}: ${variant.value})`;
      }
    }

    return `${productName}${variantInfo}`;
  };

  // Get product details for order transaction (with full variant info)
  const getOrderProductDetails = (orderIdNum, orderItemIdNum) => {
    // If there's an orderItemId, get that specific item with variants
    if (orderItemIdNum) {
      const item = fetchOrderItems?.find(oi => oi.ID === orderItemIdNum);
      if (item) {
        return getProductDetails(
          item.productId, 
          item.productVariantValueId, 
          item.productVariantCombinationId
        );
      }
      return 'Unknown Product';
    }
    
    // Otherwise, get all items for this order with their variants
    const items = fetchOrderItems?.filter(oi => oi.orderId === orderIdNum) || [];
    const productDetails = items.map(item => 
      getProductDetails(
        item.productId, 
        item.productVariantValueId, 
        item.productVariantCombinationId
      )
    );
    
    return productDetails.length > 0 ? productDetails.join(', ') : 'N/A';
  };

  /* ======================
    🧱 TABLE ROW BUILDERS
  ====================== */

  // ORDER REPORT ROWS (with orderId and product details including variants)
  const orderReportRows = useMemo(() => {
    return filteredOrderTransactions.map(tx => ({
      "Transaction ID": tx.transactionId,
      "Order ID": getOrderId(tx.orderId),
      "Product(s)": getOrderProductDetails(tx.orderId, tx.orderItemId),
      "Type": tx.transactionType,
      "Amount": `₱ ${Number(tx.totalAmount).toFixed(2)}`,
      "Payment": tx.paymentMethod,
      "Date": new Date(tx.transactionDate).toLocaleDateString(),
    }));
  }, [filteredOrderTransactions, fetchOrders, fetchOrderItems, products, variantName, productVariantValues, productVariantCombination]);

  // INVENTORY REPORT ROWS (with product names & variants)
  const inventoryReportRows = useMemo(() => {
    return filteredInventoryHistory.map(h => {
      const productDetails = getProductDetails(
        h.productId, 
        h.variantValueId, 
        h.variantCombinationId
      );

      return {
        "Product": productDetails,
        "Type": h.type,
        "Quantity": h.quantity,
        "Reference": h.referenceId || "-",
        "Date": new Date(h.createdAt).toLocaleDateString(),
      };
    });
  }, [filteredInventoryHistory, products, variantName, productVariantValues, productVariantCombination]);

  /* ======================
     ⬇️ EXPORT HELPERS
  ====================== */
  const exportCSV = (rows, filename) => {
    if (!rows.length) return;

    const headers = Object.keys(rows[0]).join(",");
    const values = rows.map(r =>
      Object.values(r).map(v => `"${v}"`).join(",")
    );

    const csv = [headers, ...values].join("\n");
    saveAs(new Blob([csv], { type: "text/csv" }), filename);
  };

  const exportExcel = (rows, filename) => {
    if (!rows.length) return;

    // 1️⃣ Lock header order (same as table)
    const headers = Object.keys(rows[0]);

    // 2️⃣ Force everything to STRING (no Excel auto-format)
    const data = rows.map(row =>
      headers.map(h => String(row[h] ?? ""))
    );

    // 3️⃣ Build AOA (Array of Arrays)
    const worksheet = XLSX.utils.aoa_to_sheet([
      headers,
      ...data
    ]);

    // 4️⃣ Optional: improve readability
    worksheet["!cols"] = headers.map(() => ({ wch: 25 }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    XLSX.writeFile(workbook, filename);
  };

  const exportPDF = (rows, title, filename) => {
    if (!rows.length) return;

    const doc = new jsPDF("l", "pt", "a4");
    doc.text(title, 40, 40);

    autoTable(doc, {
      startY: 60,
      head: [Object.keys(rows[0])],
      body: rows.map(r => Object.values(r)),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [40, 40, 40] },
    });

    doc.save(filename);
  };

  const exportDOCX = async (rows, filename) => {
    if (!rows.length) return;

    const headers = Object.keys(rows[0]);

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({ text: filename.replace(".docx", ""), bold: true }),

            ...headers.map(h =>
              new Paragraph({ text: h, bold: true })
            ),

            ...rows.flatMap(row =>
              Object.values(row).map(val =>
                new Paragraph(String(val))
              )
            ),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
  };

  return (
    <>
      <Navbar TitleName="Order & Inventory Reports" />

      <div className="reports-container">

        {/* ===== SUMMARY ===== */}
        <div className="summary-grid">
          <div className="card">
            <h4>Total Orders</h4>
            <p>{summary.totalOrders}</p>
          </div>
          <div className="card">
            <h4>Total Revenue</h4>
            <p>₱ {summary.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="card danger">
            <h4>Cancelled Orders</h4>
            <p>{summary.cancelledCount}</p>
          </div>
        </div>

        {/* ===== ORDER REPORTS ===== */}
        <section className="table-section">
          <div className="section-header">
            <h3>Order Reports</h3>

            <div className="date-range">
              <input type="date" value={orderFrom} onChange={e => setOrderFrom(e.target.value)} />
              <span>to</span>
              <input type="date" value={orderTo} onChange={e => setOrderTo(e.target.value)} />
            </div>

            <div className="export-buttons">
              <button onClick={() => exportCSV(orderReportRows, "orders.csv")}>CSV</button>
              <button onClick={() => exportExcel(orderReportRows, "orders.xlsx")}>XLSX</button>
              <button onClick={() => exportPDF(orderReportRows, "Order Reports", "orders.pdf")}>PDF</button>
              <button onClick={() => exportDOCX(orderReportRows, "orders.docx")}>DOCX</button>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Order ID</th>
                  <th>Product(s)</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrderTransactions.map(tx => (
                  <tr key={tx.ID}>
                    <td>{tx.transactionId}</td>
                    <td>{getOrderId(tx.orderId)}</td>
                    <td>{getOrderProductDetails(tx.orderId, tx.orderItemId)}</td>
                    <td>{tx.transactionType}</td>
                    <td>₱ {tx.totalAmount}</td>
                    <td>{tx.paymentMethod}</td>
                    <td>{new Date(tx.transactionDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ===== INVENTORY REPORTS ===== */}
        <section className="table-section">
          <div className="section-header">
            <h3>Inventory Reports</h3>

            <div className="date-range">
              <input type="date" value={inventoryFrom} onChange={e => setInventoryFrom(e.target.value)} />
              <span>to</span>
              <input type="date" value={inventoryTo} onChange={e => setInventoryTo(e.target.value)} />
            </div>

            <div className="export-buttons">
              <button onClick={() => exportCSV(inventoryReportRows, "inventory-history.csv")}>CSV</button>
              <button onClick={() => exportExcel(inventoryReportRows, "inventory-history.xlsx")}>XLSX</button>
              <button onClick={() => exportPDF(inventoryReportRows, "Inventory Reports", "inventory.pdf")}>PDF</button>
              <button onClick={() => exportDOCX(inventoryReportRows, "inventory.docx")}>DOCX</button>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Reference</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventoryHistory.map(h => (
                  <tr key={h.ID}>
                    <td>{getProductDetails(h.productId, h.variantValueId, h.variantCombinationId)}</td>
                    <td>{h.type}</td>
                    <td>{h.quantity}</td>
                    <td>{h.referenceId || '-'}</td>
                    <td>{new Date(h.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
};

export default Reports;