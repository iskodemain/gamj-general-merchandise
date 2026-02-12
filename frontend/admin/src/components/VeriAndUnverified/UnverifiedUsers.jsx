import React, { useContext, useState, useMemo } from 'react';
import './UnverifiedUsers.css';
import { FaArrowLeft } from "react-icons/fa6";
import { FaSearch } from 'react-icons/fa';
import { MdOutlineRemoveCircle } from "react-icons/md";
import ViewUserInfo from './ViewUserInfo.jsx';
import Navbar from '../Navbar.jsx';
import { AdminContext } from '../../context/AdminContextProvider.jsx';

function UnverifiedUsers() {
  const { navigate, customerList, adminList } = useContext(AdminContext);

  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState('');

  const [viewUser, setViewUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const unifiedUsers = useMemo(() => {
    const list = [];

    // ✅ Customers - Only unverified and not rejected
    (customerList || []).forEach((c) => {
      if (Number(c.verifiedCustomer) !== 0) return;
      if (Number(c.rejectedCustomer) !== 0) return;
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
        status: "Unverified"
      };
      list.push(user);
    });

    // ✅ Admins and Staff from adminList - Only unverified
    (adminList || []).forEach((a) => {
      // Skip Super Admin (adminHead = true)
      if (Number(a.adminHead) === 1) return;
      // Only unverified users
      if (Number(a.verifiedUser) !== 0) return;

      // Determine type based on userType field
      const userType = a.userType === 'Staff' ? 'Staff' : 'Admin';

      const user = {
        ID: a.ID,
        __type: userType,
        original: a,
        displayName: a.userName || a.emailAddress || `${userType}-${a.ID}`,
        createAt: a.createAt || a.updateAt || null,
        status: "Unverified"
      };
      list.push(user);
    });

    return list;
  }, [customerList, adminList]);

  const filteredUsers = useMemo(() => {
    let list = [...unifiedUsers];

    if (filterType) {
      list = list.filter((u) => u.__type === filterType);
    }

    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((u) => {
        const nameMatch = (u.displayName || "").toLowerCase().includes(q);
        const raw = JSON.stringify(u.original || {}).toLowerCase();
        return nameMatch || raw.includes(q);
      });
    }

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
      <Navbar TitleName="Unverified Users" />
      <div className="unverified-users-container">
        
        <div className="unverified-users-back-ctn">
          <button className="unverified-users-back-btn" onClick={() => navigate("/user-management")}>
            <FaArrowLeft />
          </button>
          <h3 className="unverified-users-text-title">Back</h3>
        </div>

        <div className="unverified-users-card">
          
          <div className="unverified-users-controls">
            <div className="unverified-users-controls-left">

              <label className="unverified-users-select-label">
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

              <label className="unverified-users-select-label">
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

            <div className="unverified-users-controls-right">
              <button onClick={() => navigate('/addnewuser')} className="unverified-users-add-btn">Add User</button>

              <div className="unverified-users-search">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <FaSearch className="unverified-users-search-icon" />
              </div>
            </div>
          </div>

          <table className="unverified-users-table" cellSpacing="0">
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
                  <tr key={`${u.__type}-${u.ID}`} className="unverified-users-view-user">
                    <td>{u.ID}</td>
                    <td className="left">{u.displayName}</td>
                    <td className="left">{u.__type}</td>
                    <td className="left unverified-users-status">
                      Unverified <span><MdOutlineRemoveCircle className="unverified-users-line-icon" /></span>
                    </td>
                    <td className="left">
                      {u.createAt ? new Date(u.createAt).toLocaleString() : "-"}
                    </td>
                    <td className="center unverified-users-actions">
                      <button
                        onClick={() => handleView(u.ID, u.__type, u.status)}
                        className="unverified-users-view"
                      >
                        View All
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="center empty">No unverified users found.</td>
                </tr>
              )}
            </tbody>
          </table>

        </div>
      </div>
    </>
  );
}

export default UnverifiedUsers;