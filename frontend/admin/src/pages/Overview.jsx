// src/components/Overview.jsx
import React, { useContext, useMemo, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import "./Overview.css";
import { AdminContext } from "../context/AdminContextProvider.jsx";

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend} from "chart.js";
import { Line, Pie, Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Overview() {
  const { navigate, fetchOrders, fetchOrderItems, products, fetchCancelledOrders, deliveryInfoList, fetchReturnRefundOrders, fetchInventoryStock, fetchInventoryBatch, fetchInventoryHistory, fetchOrderTransaction, customerList } = useContext(AdminContext);

  // timeframe toggle for line chart
  const [timeframe, setTimeframe] = useState("weekly"); // 'daily' or 'weekly'

  // --------------------------
  // Section (1) Overview cards
  // --------------------------
  const stats = useMemo(() => {
    // ACTIVE ORDER STATUSES
    const ACTIVE = ["Pending", "Processing", "Out for Delivery", "Delivered"];
    const activeSet = new Set();

    fetchOrderItems.forEach((item) => {
      if (ACTIVE.includes(item.orderStatus)) {
        activeSet.add(`${item.orderId}-${item.orderStatus}`);
      }
    });

    const activeOrders = activeSet.size;
    const cancellations = fetchCancelledOrders.length || 0;
    const returnsRefunds = fetchReturnRefundOrders.length || 0;

    // ---- INVENTORY (REAL) ----
    const availableStock = fetchInventoryStock.reduce(
      (sum, item) => sum + (item.totalQuantity || 0),
      0
    );

    const lowStockAlerts = fetchInventoryStock.filter(
      item => item.totalQuantity <= item.lowStockThreshold
    ).length;

    const outOfStock = fetchInventoryStock.filter(
      item => item.totalQuantity === 0
    ).length;

    return {
      activeOrders,
      cancellations,
      returnsRefunds,
      availableStock,
      lowStockAlerts,
      outOfStock,
    };
  }, [
    fetchOrderItems,
    fetchCancelledOrders,
    fetchReturnRefundOrders,
    fetchInventoryStock
  ]);

  // -----------------------------------------
  // Section (2) Orders Over Time (line chart)
  // -----------------------------------------
  // Build daily or weekly aggregated counts from fetchOrders / fetchOrderItems
  const ordersOverTime = useMemo(() => {
    const now = new Date();
    if (timeframe === "daily") {
      // last 7 days
      const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (6 - i));
        return d;
      });
      const labels = days.map((d) =>
        d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
      );
      const data = days.map((d) => {
        const start = new Date(d);
        start.setHours(0, 0, 0, 0);
        const end = new Date(d);
        end.setHours(23, 59, 59, 999);
        // count orders that have at least one item placed that day (use order.dateOrdered)
        return fetchOrders.filter((o) => {
          if (!o.dateOrdered) return false;
          const od = new Date(o.dateOrdered);
          return od >= start && od <= end;
        }).length;
      });
      return { labels, data };
    } else if (timeframe === "monthly") {
        // Last 12 months
        const months = Array.from({ length: 12 }).map((_, i) => {
          const d = new Date(now);
          d.setMonth(now.getMonth() - (11 - i));
          d.setDate(1);
          return d;
        });

        const labels = months.map((d) =>
          d.toLocaleDateString(undefined, {
            month: "short",
            year: "2-digit",
          })
        );

        const data = months.map((start) => {
          const end = new Date(start);
          end.setMonth(start.getMonth() + 1);
          end.setDate(0);
          end.setHours(23, 59, 59, 999);

          return fetchOrders.filter((o) => {
            if (!o.dateOrdered) return false;
            const od = new Date(o.dateOrdered);
            return od >= start && od <= end;
          }).length;
        });

        return { labels, data };
      } else if (timeframe === "yearly") {
        // Last 5 years
        const years = Array.from({ length: 5 }).map((_, i) => {
          const d = new Date(now);
          d.setFullYear(now.getFullYear() - (4 - i));
          d.setMonth(0);
          d.setDate(1);
          d.setHours(0, 0, 0, 0);
          return d;
        });

        const labels = years.map((d) => d.getFullYear().toString());

        const data = years.map((start) => {
          const end = new Date(start);
          end.setFullYear(start.getFullYear() + 1);
          end.setDate(0);
          end.setHours(23, 59, 59, 999);

          return fetchOrders.filter((o) => {
            if (!o.dateOrdered) return false;
            const od = new Date(o.dateOrdered);
            return od >= start && od <= end;
          }).length;
        });

        return { labels, data };
      } else {
      // weekly: last 8 weeks
      const weeks = Array.from({ length: 8 }).map((_, i) => {
        const startOfWeek = new Date(now);
        const weekStart = new Date(startOfWeek);
        weekStart.setDate(now.getDate() - (7 * (7 - i)));
        weekStart.setHours(0, 0, 0, 0);
        return weekStart;
      });
      const labels = weeks.map((d) =>
        `Wk ${getWeekNumber(d)} (${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })})`
      );
      const data = weeks.map((start) => {
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return fetchOrders.filter((o) => {
          if (!o.dateOrdered) return false;
          const od = new Date(o.dateOrdered);
          return od >= start && od <= end;
        }).length;
      });
      return { labels, data };
    }
  }, [timeframe, fetchOrders]);

  // ---------------------------------
  // Section (3) Pie + Donut datasets
  // ---------------------------------
  const orderStatusDistribution = useMemo(() => {
    const keys = [
      "Pending",
      "Processing",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
      "Return/Refund",
    ];
    const counts = keys.map((k) =>
      fetchOrderItems.filter((it) => it.orderStatus === k).length
    );
    return { labels: keys, data: counts };
  }, [fetchOrderItems]);

  const inventoryStatusOverview = useMemo(() => {
    const inStock = fetchInventoryStock.filter(
      item => item.totalQuantity > item.lowStockThreshold
    ).length;

    const lowStock = fetchInventoryStock.filter(
      item => item.totalQuantity > 0 && item.totalQuantity <= item.lowStockThreshold
    ).length;

    const outOfStock = fetchInventoryStock.filter(
      item => item.totalQuantity === 0
    ).length;

    return {
      labels: ["In Stock", "Low Stock", "Out of Stock"],
      data: [inStock, lowStock, outOfStock]
    };
  }, [fetchInventoryStock]);


  // ---------------------------------
  // Section (4) Most ordered + Low stock
  // ---------------------------------
  const mostOrderedProducts = useMemo(() => {
    // aggregate by productId
    const counts = {};
    fetchOrderItems.forEach((it) => {
      const id = it.productId;
      counts[id] = (counts[id] || 0) + (it.quantity || 1);
    });
    const arr = Object.entries(counts).map(([productId, qty]) => {
      const prod = products.find((p) => p.ID === Number(productId)) || { productName: "Unknown" };
      return { name: prod.productName || "Unknown", qty };
    });
    arr.sort((a, b) => b.qty - a.qty);
    // top 6
    const top = arr.slice(0, 6);
    return { labels: top.map((t) => t.name), data: top.map((t) => t.qty) };
  }, [fetchOrderItems, products]);

  const lowStockItems = useMemo(() => {
    const arr = fetchInventoryStock
      .filter(item => item.totalQuantity <= item.lowStockThreshold)
      .map(item => {
        const prod = products.find(p => p.ID === item.productId);
        return {
          name: prod?.productName || "Unknown",
          stock: item.totalQuantity
        };
      });

    arr.sort((a, b) => a.stock - b.stock);
    return arr.slice(0, 6);
  }, [fetchInventoryStock, products]);


  // ---------------------------------
  // Section (5) Recent transactions (limited)
  // ---------------------------------
  const recentTransactions = useMemo(() => {
    // Use fetchOrderTransaction to match Transactions.jsx
    const transactions = Array.isArray(fetchOrderTransaction) ? fetchOrderTransaction : [];
    
    const list = transactions
      .map((transaction) => {
        // Get customer name from customerList
        const customer = customerList?.find(c => c.ID === transaction.customerId);
        const customerName = customer?.medicalInstitutionName || 'Unknown Customer';
        
        // Get order ID string from fetchOrders
        const order = fetchOrders?.find(o => o.ID === transaction.orderId);
        const orderIdString = order?.orderId || 'N/A';

        return {
          id: transaction.ID,
          transactionId: transaction.transactionId,
          orderId: orderIdString,
          name: customerName,
          date: transaction.transactionDate,
          amount: parseFloat(transaction.totalAmount || 0),
          paymentMethod: transaction.paymentMethod,
          transactionType: transaction.transactionType,
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return list.slice(0, 6);
  }, [fetchOrderTransaction, customerList, fetchOrders]);

  // -----------------------------
  // Chart config helpers
  // -----------------------------
  const lineData = {
    labels: ordersOverTime.labels,
    datasets: [
      {
        label: "Orders",
        data: ordersOverTime.data,
        tension: 0.25,
        backgroundColor: "rgba(67,160,71,0.12)",
        borderColor: "#43A047",
        pointRadius: 4,
      },
    ],
  };
  const lineOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
  };

  const pieData = {
    labels: orderStatusDistribution.labels,
    datasets: [
      {
        label: "Order Status",
        data: orderStatusDistribution.data,
        backgroundColor: [
          "#F5A623",
          "#17A2A2",
          "#2B7BEF",
          "#2FA14C",
          "#e36666",
          "#9b59b6",
        ],
      },
    ],
  };

  const donutData = {
    labels: inventoryStatusOverview.labels,
    datasets: [
      {
        label: "Inventory",
        data: inventoryStatusOverview.data,
        backgroundColor: ["#2FA14C", "#F5A623", "#e74c3c"],
      },
    ],
  };

  const barMostOrdered = {
    labels: mostOrderedProducts.labels,
    datasets: [
      {
        label: "Qty",
        data: mostOrderedProducts.data,
        backgroundColor: "#656dff",
      },
    ],
  };
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (ctx) => ctx[0].label, // full name in tooltip
        },
      },
    },
    scales: {
      x: {
        ticks: {
          callback: function (value, index) {
            const label = this.getLabelForValue(index);
            return label.length > 10 ? label.slice(0, 10) + "…" : label;
          },
          maxRotation: 0,
          minRotation: 0,
          autoSkip: true,
        },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
      },
    },
  };


  // small util
  function getWeekNumber(d) {
    const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
    return weekNo;
  }

  function getTypeColor(type) {
    const typeColors = {
      'Order Placed': '#43A047',
      'Order Processing': '#1976D2',
      'Out for Delivery': '#FF9800',
      'Order Delivered': '#4CAF50',
      'Order Cancelled': '#F44336',
      'Order Refund Requested': '#9C27B0',
      'Order Refund Approved': '#00BCD4',
      'Order Refund Completed': '#009688',
      'Order Refund Rejected': '#E91E63',
      'Order Cancellation Request': '#FF5722',
      'Order Cancellation Processed': '#795548',
      'Order Cancellation Request Cancelled': '#607D8B',
    };
    return typeColors[type] || '#43A047';
  }

  return (
    <>
      <Navbar TitleName="Overview" />

      <main className="ov-container">
        {/* ===== First row: Orders & Inventory cards ===== */}
        <section className="ov-row ov-row-cards">
          <div className="ov-card ov-card-large" onClick={() => navigate("/orders")}>
            <div className="ov-card-top">
              <div className="ov-card-title">Orders</div>
              <div className="ov-card-sub">Overview</div>
            </div>
            <div className="ov-card-body">
              <div className="ov-kv">
                <div className="ov-kv-label">Active Orders</div>
                <div className="ov-kv-value">{stats.activeOrders}</div>
              </div>
              <div className="ov-kv">
                <div className="ov-kv-label">Cancellations</div>
                <div className="ov-kv-value">{stats.cancellations}</div>
              </div>
              <div className="ov-kv">
                <div className="ov-kv-label">Returns &amp; Refunds</div>
                <div className="ov-kv-value">{stats.returnsRefunds}</div>
              </div>
            </div>
          </div>

          <div className="ov-card ov-card-large" onClick={() => navigate("/inventory")}>
            <div className="ov-card-top">
              <div className="ov-card-title">Inventory</div>
              <div className="ov-card-sub">Overview</div>
            </div>
            <div className="ov-card-body">
              <div className="ov-kv">
                <div className="ov-kv-label">Available Stock</div>
                <div className="ov-kv-value">{stats.availableStock}</div>
              </div>
              <div className="ov-kv">
                <div className="ov-kv-label">Low Stock Alerts</div>
                <div className="ov-kv-value">{stats.lowStockAlerts}</div>
              </div>
              <div className="ov-kv">
                <div className="ov-kv-label">Out of Stock Items</div>
                <div className="ov-kv-value">{stats.outOfStock}</div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Second section: Orders Over Time (line) ===== */}
        <section className="ov-row ov-section-full ov-line-graph">
          <div className="ov-section-head">
            <h3>Orders Over Time</h3>
            <div className="ov-controls">
              <button
                className={`ov-toggle ${timeframe === "daily" ? "active" : ""}`}
                onClick={() => setTimeframe("daily")}
              >
                Daily
              </button>
              <button
                className={`ov-toggle ${timeframe === "weekly" ? "active" : ""}`}
                onClick={() => setTimeframe("weekly")}
              >
                Weekly
              </button>
              <button
                className={`ov-toggle ${timeframe === "monthly" ? "active" : ""}`}
                onClick={() => setTimeframe("monthly")}
              >
                Monthly
              </button>
               <button
                  className={`ov-toggle ${timeframe === "yearly" ? "active" : ""}`}
                  onClick={() => setTimeframe("yearly")}
                >
                  Yearly
                </button>
            </div>
          </div>
          <div className="ov-chart ov-chart-line">
            <Line data={lineData} options={{lineOptions, responsive: true, maintainAspectRatio: false}} />
          </div>
        </section>

        {/* ===== Third section: Pie (orders) + Donut (inventory) ===== */}
        <section className="ov-row ov-row-2up">
          <div className="ov-card ov-chart-card">
            <div className="ov-card-head">
              <h4>Order Status Distribution</h4>
            </div>
            <div className="ov-card-body chart-center">
              <Pie data={pieData} options={{responsive: true, maintainAspectRatio: false}} />
            </div>
          </div>

          <div className="ov-card ov-chart-card">
            <div className="ov-card-head">
              <h4>Inventory Status Overview</h4>
            </div>
            <div className="ov-card-body chart-center">
              <Doughnut data={donutData} options={{responsive: true, maintainAspectRatio: false}}/>
            </div>
          </div>
        </section>

        {/* ===== Fourth section: Most ordered + Low stock ===== */}
        <section className="ov-row ov-row-2up">
          <div className="ov-card ov-chart-card">
            <div className="ov-card-head">
              <h4>Most Ordered Products</h4>
            </div>
            <div className="ov-card-body">
              {mostOrderedProducts.labels.length ? (
                <Bar data={barMostOrdered} options={barOptions} />
              ) : (
                <div className="ov-empty">No order data</div>
              )}
            </div>
          </div>

          <div className="ov-card ov-card-list">
            <div className="ov-card-head">
              <h4>Low Stock Items</h4>
            </div>
            <div className="ov-card-body">
              {lowStockItems.length ? (
                <ul className="low-stock-list">
                  {lowStockItems.map((p, idx) => (
                    <li key={idx}>
                      <span className="ls-name">{p.name}</span>
                      <span className="ls-qty">{p.stock} left</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="ov-empty">No low stock items</div>
              )}
            </div>
          </div>
        </section>

        {/* ===== Fifth section: Recent Transactions (limited) ===== */}
        <section className="ov-row ov-section-full">
          <div className="ov-section-head">
            <h3>Recent Order Transactions</h3>
            <div className="ov-actions">
              <button className="ov-viewall-btn" onClick={() => navigate("/transactions/order")}>
                View All
              </button>
            </div>
          </div>

          <div className="ov-card ov-trans-card">
            <div className="ov-trans-list">
              {recentTransactions.length ? (
                recentTransactions.map((t) => (
                  <div className="trans-row" key={t.id}>
                    <div className="trans-header">
                      <div className="trans-id">
                        <span className="trans-id-label">ID:</span> {t.transactionId}
                      </div>
                      <div className="trans-date">{new Date(t.date).toLocaleString()}</div>
                    </div>
                    <div className="trans-body">
                      <div className="trans-left">
                        <div
                          className="trans-type-badge"
                          style={{ backgroundColor: getTypeColor(t.transactionType) }}
                        >
                          {t.transactionType}
                        </div>
                        <div className="trans-customer">{t.name}</div>
                      </div>
                      <div className="trans-right">
                        <div className="trans-amount">₱{t.amount.toFixed(2)}</div>
                        <div className="trans-method">{t.paymentMethod}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="ov-empty">No transactions yet</div>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Overview;
