import React, { useContext, useState, useMemo } from 'react';
import './AllUsers.css';
import { FaTrashCan } from "react-icons/fa6";
import { MdOutlineRemoveCircle } from "react-icons/md";
import { IoIosCloseCircle, IoIosCheckmarkCircle  } from "react-icons/io";
import { FaArrowLeft } from "react-icons/fa6";
import { FaSearch } from 'react-icons/fa';
import Navbar from './Navbar.jsx';
import { AdminContext } from '../context/AdminContextProvider.jsx';
import ViewUserInfo from "./VeriAndUnverified/ViewUserInfo.jsx"
import Loading from './Loading.jsx';

function AllUsers() {
  const { navigate, customerList, adminList, staffList, handleDeletetUser } = useContext(AdminContext);

  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('');   
  const [filterStatus, setFilterStatus] = useState(''); 
  const [sortBy, setSortBy] = useState(''); 

  const [viewUser, setViewUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalMessage, setModalMessage] = useState("");

  const openModal = (action, message) => {
    setModalAction(() => action);
    setModalMessage(message);
    setModalOpen(true);
  };

  const confirmAction = async () => {
    if (modalAction) await modalAction();
    setModalOpen(false);
  };

  const cancelAction = () => {
    setModalOpen(false);
  };


  // Defensive helpers for truthy/falsey values that may be 1/0 or true/false or strings
  const isTrue = (val) => val === 1 || val === true || val === '1' || val === 'true';
  const isFalse = (val) => val === 0 || val === false || val === '0' || val === 'false';

  // Helper: determine a normalized status for a unified user
  const getUserStatus = (u) => {
    if (u.__type === 'Customer') {
      // Rejected takes precedence
      if (isTrue(u.rejectedCustomer)) return 'Rejected';
      if (isTrue(u.verifiedCustomer)) return 'Verified';
      if (isFalse(u.verifiedCustomer)) return 'Unverified';
      // fallback: if missing/unknown treat as Unverified
      return 'Unverified';
    }

    if (u.__type === 'Staff') {
      if (isTrue(u.verifiedStaff)) return 'Verified';
      return 'Unverified';
    }

    if (u.__type === 'Admin') {
      // Exclude adminHead before calling this, but handle defensively
      if (isTrue(u.adminHead)) return 'Excluded';
      if (isTrue(u.verifiedAdmin)) return 'Verified';
      if (isFalse(u.verifiedAdmin)) return 'Unverified';
      return 'Unverified';
    }

    return 'Unverified';
  };

  // Build unified user list with consistent fields:
  // { ID, __type: 'admin'|'staff'|'customer', displayName, status, createAt, original }
  const unifiedUsers = useMemo(() => {
    const list = [];

    // Customers
    (customerList || []).forEach((c) => {
      const user = {
        ID: c.ID,
        __type: 'Customer',
        original: c,
        displayName:
          c.medicalInstitutionName ||
          `${c.repFirstName || ''} ${c.repLastName || ''}`.trim() ||
          c.loginEmail ||
          `Customer-${c.ID}`,
        createAt: c.createAt || c.updateAt || null,
        verifiedCustomer: c.verifiedCustomer,
        rejectedCustomer: c.rejectedCustomer,
      };
      user.status = getUserStatus(user);
      list.push(user);
    });

    // Staff
    (staffList || []).forEach((s) => {
      const user = {
        ID: s.ID,
        __type: 'Staff',
        original: s,
        displayName:
          `${s.firstName || ''} ${s.lastName || ''}`.trim() ||
          s.emailAddress ||
          `Staff-${s.ID}`,
        createAt: s.createAt || s.updateAt || null,
        verifiedStaff: s.verifiedStaff,
      };
      user.status = getUserStatus(user);
      list.push(user);
    });

    // Admins — exclude adminHead === true
    (adminList || []).forEach((a) => {
      if (isTrue(a.adminHead)) return; // skip admin head entirely
      const user = {
        ID: a.ID,
        __type: 'Admin',
        original: a,
        displayName: a.userName || a.emailAddress || `Admin-${a.ID}`,
        createAt: a.createAt || a.updateAt || null,
        verifiedAdmin: a.verifiedAdmin,
        adminHead: a.adminHead,
      };
      user.status = getUserStatus(user);
      if (user.status !== 'Excluded') list.push(user);
    });

    return list;
  }, [customerList, staffList, adminList]);

  // Filter + Search + Sort
  const filteredUsers = useMemo(() => {
    let list = [...unifiedUsers];

    // Filter by Type
    if (filterType) {
      list = list.filter(u => u.__type === filterType);
    }

    // Filter by Status
    if (filterStatus) {
      list = list.filter(u => u.status === filterStatus);
    }

    // Search across all fields (stringify original object for broad search)
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(u => {
        const nameMatch = (u.displayName || '').toLowerCase().includes(q);
        // stringify relevant fields for broad search (defensive)
        const raw = JSON.stringify(u.original || {}).toLowerCase();
        return nameMatch || raw.includes(q);
      });
    }

    // Sort by first letter of displayName (A-Z / Z-A). Fallbacks included.
    if (sortBy === 'az') {
      list.sort((a, b) => {
        const aChar = (a.displayName && a.displayName[0]) ? a.displayName[0].toLowerCase() : '';
        const bChar = (b.displayName && b.displayName[0]) ? b.displayName[0].toLowerCase() : '';
        if (aChar < bChar) return -1;
        if (aChar > bChar) return 1;
        return (a.displayName || '').localeCompare(b.displayName || '');
      });
    } else if (sortBy === 'za') {
      list.sort((a, b) => {
        const aChar = (a.displayName && a.displayName[0]) ? a.displayName[0].toLowerCase() : '';
        const bChar = (b.displayName && b.displayName[0]) ? b.displayName[0].toLowerCase() : '';
        if (aChar < bChar) return 1;
        if (aChar > bChar) return -1;
        return (b.displayName || '').localeCompare(a.displayName || '');
      });
    } else {
      // default sort: most recently created first if createAt exists, otherwise by ID desc
      list.sort((a, b) => {
        if (a.createAt && b.createAt) return new Date(b.createAt) - new Date(a.createAt);
        return (b.ID || 0) - (a.ID || 0);
      });
    }

    return list;
  }, [unifiedUsers, filterType, filterStatus, query, sortBy]);

  // Handlers
  const handleDelete = (id, type) => {
    openModal(
      async () => {
        setLoading(true);

        const approved = await handleDeletetUser(id, type);
        
        if (approved) {
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }

        setLoading(false);

      },
      `Are you sure you want to permanently delete this ${type}?`
    );
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
      <Navbar TitleName="All Users" />
      {loading && <Loading/>}
      {/* Confirmation Modal */}
      {modalOpen && (
        <div className="conf-modal-overlay">
          <div className="conf-modal-box">
            <p className="conf-modal-message">{modalMessage}</p>

            <div className="conf-modal-buttons">
              <button className="conf-btn-confirm" onClick={confirmAction}>Yes</button>
              <button className="conf-btn-cancel" onClick={cancelAction}>No</button>
            </div>
          </div>
        </div>
      )}
      <div className="display-all-users-container">
          <div className="display-all-back-ctn">
            <button className="display-all-back-btn" onClick={() => navigate("/user-management")}>
                <FaArrowLeft />
            </button>
            <h3 className="display-all-text-title">Back</h3>
          </div>
        <div className="display-all-users-card">
        
          {/* Controls */}
          <div className="display-all-users-controls">
            <div className="display-all-users-controls-left">
              {/* Type Filter */}
              <label className="display-all-users-select-label">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="customer">Customer</option>
                </select>
              </label>

              {/* Status Filter */}
              <label className="display-all-users-select-label">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="Verified">Verified</option>
                  <option value="Unverified">Unverified</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </label>

              {/* Sort */}
              <label className="display-all-users-select-label">
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

            <div className="display-all-users-controls-right">
              <button onClick={() => navigate('/addnewuser')} className="display-all-users-add-btn">Add User</button>

              <div className="display-all-users-search">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <FaSearch className="display-all-users-search-icon" />
              </div>
            </div>
          </div>

          {/* Users Table */}
          <table className="display-all-users-table" cellSpacing="0">
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
                  <tr key={`${u.__type}-${u.ID}`} className='display-all-users-view-user'>
                    <td>{u.ID}</td>
                    <td className="left">{u.displayName}</td>
                    <td className="left">{u.__type}</td>
                    <td className="left display-all-users-status">
                      {u.status === "Verified" && 
                        <>Verified <span><IoIosCheckmarkCircle className='display-all-users-check-icon display-all-users-icon-status'/></span></>
                      }
                      {u.status === "Unverified" && 
                        <>Unverified <span><MdOutlineRemoveCircle className='display-all-users-line-icon display-all-users-icon-status'/></span></>
                      }
                      {u.status === "Rejected" && 
                        <>Rejected <span><IoIosCloseCircle className='display-all-users-x-icon display-all-users-icon-status'/></span></>
                      }
                    </td>
                    <td className="left">
                      {u.createAt ? new Date(u.createAt).toLocaleString() : '-'}
                    </td>
                    <td className="center display-all-users-actions">
                      <button onClick={() => handleView(u.ID, u.__type, u.status)} className='display-all-users-view'>View All</button>
                      {u.status === 'Rejected' && (
                        <button
                          className="display-all-users-trash"
                          onClick={() => handleDelete(u.ID, u.__type)}
                          title="Delete user"
                        >
                          <FaTrashCan />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="center empty">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default AllUsers;