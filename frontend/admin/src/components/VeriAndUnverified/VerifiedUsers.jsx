import React, { useContext, useState, useMemo } from 'react';
import './VerifiedUsers.css';
import { FaArrowLeft } from "react-icons/fa6";
import { FaSearch } from 'react-icons/fa';
import { IoIosCheckmarkCircle } from "react-icons/io";
import Navbar from '../Navbar.jsx';
import { AdminContext } from '../../context/AdminContextProvider.jsx';
import ViewUserInfo from './ViewUserInfo.jsx';

function VerifiedUsers() {
  const { navigate, customerList, adminList } = useContext(AdminContext);

  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('');   
  const [sortBy, setSortBy] = useState(''); 

  const [viewUser, setViewUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const isTrue = (val) => val === 1 || val === true || val === "1" || val === "true";

  // Build unified verified users only
  const unifiedUsers = useMemo(() => {
    const list = [];

    // ✅ Customers — ONLY verified
    (customerList || []).forEach((c) => {
      if (!isTrue(c.verifiedCustomer)) return;
      const user = {
        ID: c.ID,
        __type: "Customer",
        original: c,
        displayName:
          c.medicalInstitutionName ||
          `${c.repFirstName || ""} ${c.repLastName || ""}`.trim() ||
          c.loginEmail ||
          `Customer-${c.ID}`,
        createAt: c.createAt || c.updateAt || null,
        status: "Verified"
      };
      list.push(user);
    });

    // ✅ Admins and Staff from adminList — ONLY verified
    (adminList || []).forEach((a) => {
      // Exclude Super Admin (adminHead = true)
      if (isTrue(a.adminHead)) return;
      // Only verified users
      if (!isTrue(a.verifiedUser)) return;

      // Determine type based on userType field
      const userType = a.userType === 'Staff' ? 'Staff' : 'Admin';

      const user = {
        ID: a.ID,
        __type: userType,
        original: a,
        displayName: a.userName || a.emailAddress || `${userType}-${a.ID}`,
        createAt: a.createAt || a.updateAt || null,
        status: "Verified"
      };
      list.push(user);
    });

    return list;
  }, [customerList, adminList]);

  // Filter + Search + Sort
  const filteredUsers = useMemo(() => {
    let list = [...unifiedUsers];

    // Filter by Type
    if (filterType) {
      list = list.filter((u) => u.__type === filterType);
    }

    // Search across full data
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((u) => {
        const nameMatch = (u.displayName || "").toLowerCase().includes(q);
        const raw = JSON.stringify(u.original || {}).toLowerCase();
        return nameMatch || raw.includes(q);
      });
    }

    // Sort A–Z / Z–A
    if (sortBy === "az") {
      list.sort((a, b) => {
        const aChar = a.displayName?.[0]?.toLowerCase() || "";
        const bChar = b.displayName?.[0]?.toLowerCase() || "";
        if (aChar < bChar) return -1;
        if (aChar > bChar) return 1;
        return (a.displayName || "").localeCompare(b.displayName || "");
      });
    } else if (sortBy === "za") {
      list.sort((a, b) => {
        const aChar = a.displayName?.[0]?.toLowerCase() || "";
        const bChar = b.displayName?.[0]?.toLowerCase() || "";
        if (aChar < bChar) return 1;
        if (aChar > bChar) return -1;
        return (b.displayName || "").localeCompare(a.displayName || "");
      });
    } else {
      list.sort((a, b) => {
        if (a.createAt && b.createAt) return new Date(b.createAt) - new Date(a.createAt);
        return (b.ID || 0) - (a.ID || 0);
      });
    }

    return list;
  }, [unifiedUsers, filterType, query, sortBy]);

  const handleView = (id, type, status) => {
    setSelectedUser({ ID: id, userType: type, userStatus: status });
    setViewUser(true);
  };

  if (viewUser && selectedUser) {
    return (
      <ViewUserInfo
        ID={selectedUser.ID}
        userType={selectedUser.userType}
        userStatus={selectedUser.userStatus}
        onBack={() => setViewUser(false)}
      />
    );
  }

  return (
    <>
      <Navbar TitleName="Verified Users" />
      <div className="verified-users-container">
        
        <div className="verified-users-back-ctn">
          <button className="verified-users-back-btn" onClick={() => navigate("/user-management")}>
            <FaArrowLeft />
          </button>
          <h3 className="verified-users-text-title">Back</h3>
        </div>

        <div className="verified-users-card">
          
          {/* Controls */}
          <div className="verified-users-controls">
            <div className="verified-users-controls-left">

              {/* Type Filter */}
              <label className="verified-users-select-label">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="Admin">Admin</option>
                  <option value="Staff">Staff</option>
                  <option value="Customer">Customer</option>
                </select>
              </label>

              {/* Sort */}
              <label className="verified-users-select-label">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="">Sort By</option>
                  <option value="az">Name: A → Z</option>
                  <option value="za">Name: Z → A</option>
                </select>
              </label>
            </div>

            <div className="verified-users-controls-right">
              <button onClick={() => navigate('/addnewuser')} className="verified-users-add-btn">Add User</button>

              <div className="verified-users-search">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <FaSearch className="verified-users-search-icon" />
              </div>
            </div>
          </div>

          {/* Users Table */}
          <table className="verified-users-table" cellSpacing="0">
            <thead>
              <tr>
                <th>ID</th>
                <th className="left">Name</th>
                <th className="left">Type</th>
                <th className="left">Status</th>
                <th className="left">Date Created</th>
                <th className="center">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={`${u.__type}-${u.ID}`} className="verified-users-view-user">
                    <td>{u.ID}</td>
                    <td className="left">{u.displayName}</td>
                    <td className="left">{u.__type}</td>
                    <td className="left verified-users-status">
                      Verified <span><IoIosCheckmarkCircle className="verified-users-check-icon" /></span>
                    </td>
                    <td className="left">
                      {u.createAt ? new Date(u.createAt).toLocaleString() : "-"}
                    </td>
                    <td className="center verified-users-actions">
                      <button
                        onClick={() => handleView(u.ID, u.__type, u.status)}
                        className="verified-users-view"
                      >
                        View All
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="center empty">No verified users found.</td>
                </tr>
              )}
            </tbody>
          </table>

        </div>
      </div>
    </>
  );
}

export default VerifiedUsers;