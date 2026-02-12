import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets.js";
import Navbar from "../components/Navbar.jsx";
import "./Orders.css";
import { AdminContext } from "../context/AdminContextProvider.jsx";
import { FaArrowLeft } from "react-icons/fa6";

function Orders() {
  const { navigate, customerList, adminList } = useContext(AdminContext);

  const [verifiedUsers, setVerifiedUsers] = useState(0);
  const [unverifiedUsers, setUnverifiedUsers] = useState(0);
  const [rejectedUsers, setRejectedUsers] = useState(0);
  const [allUsers, setAllUsers] = useState(0);

  useEffect(() => {
    if (!customerList || !adminList) return;

    let verified = 0;
    let unverified = 0;
    let rejected = 0;
    let totalUsers = 0;

    /* ---------------------------
       PROCESS CUSTOMERS
    ----------------------------*/
    customerList.forEach((cust) => {
      totalUsers += 1;

      if (cust.rejectedCustomer === 1 || cust.rejectedCustomer === true) {
        rejected += 1;
        return;
      }

      if (cust.verifiedCustomer === 1 || cust.verifiedCustomer === true) {
        verified += 1;
      } else {
        unverified += 1;
      }
    });

    /* ---------------------------
       PROCESS ADMINS & STAFF
       (EXCLUDE adminHead === true)
    ----------------------------*/
    adminList.forEach((admin) => {
      // Skip Super Admin
      if (admin.adminHead === 1 || admin.adminHead === true) return;

      totalUsers += 1;

      if (admin.verifiedUser === 1 || admin.verifiedUser === true) {
        verified += 1;
      } else {
        unverified += 1;
      }
    });

    /* ---------------------------
       UPDATE STATE
    ----------------------------*/
    setAllUsers(totalUsers);
    setVerifiedUsers(verified);
    setUnverifiedUsers(unverified);
    setRejectedUsers(rejected);

  }, [customerList, adminList]);

  return (
    <>
      <Navbar TitleName="User Management" />

      <main className="ordersView-container">

        {/* ===== ORDERS SECTION ===== */}
        <section className="ordersView-section">
          <div className="ordersView-header">
            <button className="ordersView-back-btn" onClick={() => navigate("/overview")}>
              <FaArrowLeft />
            </button>
            <h3 className="ordersView-header-title">Back</h3>
          </div>
          <div className="ordersView-grid">
            <OverviewCard
              icon={assets.all_users_icon}
              title="All Users"
              number={allUsers}
              onClick={() => navigate("/allusers")}
            />
            <OverviewCard
              icon={assets.verified_user_icon}
              title="Verified Users"
              number={verifiedUsers}
              onClick={() => navigate("/verifiedusers")}
            />
            <OverviewCard
              icon={assets.unverified_user_icon}
              title="Unverified Users"
              number={unverifiedUsers}
              onClick={() => navigate("/unverifiedusers")}
            />
            <OverviewCard
              icon={assets.rejected_user_icon}
              title="Rejected Users"
              number={rejectedUsers}
              onClick={() => navigate("/rejectedusers")}
            />
            <OverviewCard
              icon={assets.add_user_icon}
              title="Add New User"
              number={"+"}
              onClick={() => navigate('/addnewuser')}
            />
          </div>
        </section>
      </main>
    </>
  );
}

function OverviewCard({ icon, color, title, number, date, onClick }) {
  return (
    <div className="ordersView-card" onClick={onClick}>
      <div className="ordersView-card-top">
        {icon ? (
          <img src={icon} alt={title} className="ordersView-card-icon" />
        ) : (
          <span className={`ordersView-dot ${color}`} />
        )}
        <span className="ordersView-card-title">{title}</span>
      </div>

      <div className="ordersView-divider" />

      <div className="ordersView-card-container">
        <span className="ordersView-card-number">{number}</span>
        <span className="ordersView-card-date">{date}</span>
      </div>
    </div>
  );
}

export default Orders;