import React, { useContext, useState, useMemo } from 'react';
import './RejectedUsers.css';
import { FaArrowLeft, FaTrashCan } from "react-icons/fa6";
import { IoIosCloseCircle  } from "react-icons/io";
import { FaSearch } from 'react-icons/fa';
import Navbar from '../Navbar.jsx';
import { AdminContext } from '../../context/AdminContextProvider.jsx';
import ViewUserInfo from './ViewUserInfo.jsx';

function RejectedUsers() {
  const { navigate, customerList } = useContext(AdminContext);

  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState(''); 
  const [sortBy, setSortBy] = useState('');

  const [viewUser, setViewUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const isTrue = (val) => val === 1 || val === true || val === "1" || val === "true";

  // Build only rejected customers
  const unifiedUsers = useMemo(() => {
    const list = [];

    (customerList || []).forEach((c) => {
      if (!isTrue(c.rejectedCustomer)) return;

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
        status: "Rejected"
      };

      list.push(user);
    });

    return list;
  }, [customerList]);

  // Search + Filter + Sort
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
      list.sort((a, b) => a.displayName.localeCompare(b.displayName));
    } else if (sortBy === "za") {
      list.sort((a, b) => b.displayName.localeCompare(a.displayName));
    } else {
      list.sort((a, b) => {
        if (a.createAt && b.createAt) return new Date(b.createAt) - new Date(a.createAt);
        return (b.ID || 0) - (a.ID || 0);
      });
    }

    return list;
  }, [unifiedUsers, filterType, query, sortBy]);

  const handleDelete = (id, type) => {
    const ok = window.confirm(`Delete ${type} ID ${id}? This action cannot be undone.`);
    if (!ok) return;

    alert(`Delete called for ${type} ID ${id}`);
  };

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
      <Navbar TitleName="Rejected Users" />
      <div className="rejected-users-container">
        
        <div className="rejected-users-back-ctn">
          <button className="rejected-users-back-btn" onClick={() => navigate("/user-management")}>
            <FaArrowLeft />
          </button>
          <h3 className="rejected-users-text-title">Back</h3>
        </div>

        <div className="rejected-users-card">

          {/* Controls */}
          <div className="rejected-users-controls">
            <div className="rejected-users-controls-left">

              {/* Type Filter */}
              <label className="rejected-users-select-label">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="Customer">Customer</option>
                </select>
              </label>

              {/* Sort */}
              <label className="rejected-users-select-label">
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

            <div className="rejected-users-controls-right">
              <button onClick={() => navigate('/users/add')} className="rejected-users-add-btn">Add User</button>

              <div className="rejected-users-search">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <FaSearch className="rejected-users-search-icon" />
              </div>
            </div>
          </div>

          {/* Users Table */}
          <table className="rejected-users-table" cellSpacing="0">
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
                  <tr key={`${u.__type}-${u.ID}`} className="rejected-users-view-user">
                    <td>{u.ID}</td>
                    <td className="left">{u.displayName}</td>
                    <td className="left">{u.__type}</td>
                    <td className="left rejected-users-status">
                      Verified <span><IoIosCloseCircle className="rejected-users-x-icon" /></span>
                    </td>
                    <td className="left">
                      {u.createAt ? new Date(u.createAt).toLocaleString() : "-"}
                    </td>
                    <td className="center rejected-users-actions">
                      <button onClick={() => handleView(u.ID, u.__type, u.status)} className='rejected-users-view'>
                        View All
                      </button>

                      <button
                        className="rejected-users-trash"
                        onClick={() => handleDelete(u.ID, u.__type)}
                        title="Delete user"
                      >
                        <FaTrashCan />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="center empty">No rejected users found.</td>
                </tr>
              )}
            </tbody>
          </table>

        </div>
      </div>
    </>
  );
}

export default RejectedUsers;