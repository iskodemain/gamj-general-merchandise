// ViewUserInfo.jsx
import React, { useContext, useMemo, useState } from "react";
import { FaUserLarge, FaRegEye, FaRegEyeSlash, FaArrowLeft } from "react-icons/fa6";
import { AdminContext } from "../../context/AdminContextProvider";
import { IoEyeOutline } from "react-icons/io5";
import "./ViewUserInfo.css";
import Navbar from "../Navbar.jsx";
import Loading from "../Loading.jsx";

function ViewUserInfo({ ID, userType, userStatus, onBack = () => {} }) {
  const { customerList, staffList, adminList, handleApproveUser, handleRejectUser, handleDeletetUser } = useContext(AdminContext);
  const [loading, setLoading] = useState(false);

  // Confirmation modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalMessage, setModalMessage] = useState("");

  // Reject-reason modal state (appears BEFORE confirmation for reject)
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTitle, setRejectTitle] = useState("");
  const [rejectMessage, setRejectMessage] = useState("");
  const [rejectErrors, setRejectErrors] = useState({ title: "", message: "" });

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


  // find user record depending on userType
  const user = useMemo(() => {
    if (userType === "Customer") {
      return customerList.find((c) => c.ID === ID) || null;
    } else if (userType === "Staff") {
      return staffList.find((s) => s.ID === ID) || null;
    } else if (userType === "Admin") {
      return adminList.find((a) => a.ID === ID) || null;
    }
    return null;
  }, [userType, ID, customerList, staffList, adminList]);

  // password visibility
  const [passwordVisible, setPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => setPasswordVisible((v) => !v);

  // proof preview modal
  const [proofOpen, setProofOpen] = useState(false);

  // local form state (for UX) — initialize from user (readonly for unverified/rejected)
  const [form, setForm] = useState(() => {
    if (!user) return {};
    if (userType === "Customer") {
      return {
        medName: user.medicalInstitutionName || "",
        contact: user.contactNumber || "",
        landline: user.landlineNumber || "",
        email: user.emailAddress || "",
        address: user.fullAddress || user.fullAddress || "",
        repFirstName: user.repFirstName || "",
        repLastName: user.repLastName || "",
        repContact: user.repContactNumber || "",
        repEmail: user.repEmailAddress || "",
        repJob: user.repJobPosition || "",
        identifier: user.loginEmail || user.loginPhoneNum,
        password: user.loginPassword
      };
    } else if (userType === "Staff") {
      return {
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.emailAddress || "",
        password: user?.password
      };
    } else {
      // Admin
      return {
        userName: user?.userName || "",
        email: user?.emailAddress || "",
        password: user?.password
      };
    }
  });

  // disabled if Customer is Unverified or Rejected
  const isCustomerLocked = userType === "Customer" && (userStatus === "Unverified" || userStatus === "Rejected");

  const handleNavbarTitle = (userType, userStatus) => {
    if (userType === 'Customer' && userStatus === 'Verified') {
      return 'Verified Customer';
    } else if (userType === 'Customer' && userStatus === 'Unverified') {
      return 'Unverified Customer';
    } else if (userType === 'Customer' && userStatus === 'Rejected') {
      return 'Rejected Customer';
    }

    if (userType === 'Staff' && userStatus === 'Verified') {
      return 'Verified Staff';
    } else if (userType === 'Staff' && userStatus === 'Unverified') {
      return 'Unverified Staff';
    } else if (userType === 'Staff' && userStatus === 'Rejected') {
      return 'Rejected Staff';
    }

    if (userType === 'Admin' && userStatus === 'Verified') {
      return 'Verified Admin';
    } else if (userType === 'Admin' && userStatus === 'Unverified') {
      return 'Unverified Admin';
    } else if (userType === 'Admin' && userStatus === 'Rejected') {
      return 'Rejected Admin';
    }

    return ''; // ← fallback (prevents undefined)
  };

  // button handlers (placeholders / optimistic)
  const handleSave = () => {
  };

  const handleDelete = async() => {
    setLoading(true);
    const approved = await handleDeletetUser(ID, userType);
    if (approved) {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
    setLoading(false);
  };

  const handleApprove = async () => {
    setLoading(true);
    const approved = await handleApproveUser(ID, userType);
    if (approved) {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
    setLoading(false);
  };


  // *************** REJECT FLOW ***************
  const openRejectReasonModal = () => {
    setRejectTitle("");
    setRejectMessage("");
    setRejectErrors({ title: "", message: "" });
    setRejectModalOpen(true);
  };

  const submitRejectReason = () => {
    let errors = { title: "", message: "" };
    let hasError = false;

    if (!rejectTitle.trim()) {
      errors.title = "Title is required.";
      hasError = true;
    }
    if (!rejectMessage.trim()) {
      errors.message = "Message is required.";
      hasError = true;
    }

    if (hasError) {
      setRejectErrors(errors);
      return;
    }

    // Close reject modal → open confirmation modal
    setRejectModalOpen(false);

    openModal(() => handleReject(), "Are you sure you want to reject this user?");
  };

  const handleReject = async () => {
    setLoading(true);

    const rejected = await handleRejectUser(ID, userType, rejectTitle, rejectMessage);

    if (rejected) {
      setTimeout(() => window.location.reload(), 500);
    }

    setLoading(false);
  };
  // ********************************************


  // helper to render proof clickable area (customer only)
  const ProofArea = () => {
    const imgSrc = user?.imageProof || "";
    return (
      <>
        <div className="document-link" role="button" tabIndex={0} onClick={() => imgSrc && setProofOpen(true)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && imgSrc && setProofOpen(true)} aria-label="Open proof image">
          <IoEyeOutline className="document-icon" />
          <span className="document-label">Proof of the document you've uploaded</span>
        </div>

        <div className="document-box">
          <span>{user?.proofType}</span>
        </div>

        {proofOpen && (
          <div className="proof-modal" role="dialog" aria-modal="true" onClick={() => setProofOpen(false)}>
            <div className="proof-modal-inner" onClick={(e) => e.stopPropagation()}>
              <img src={imgSrc} alt="Proof full" />
              <button className="proof-close" onClick={() => setProofOpen(false)}>Close</button>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      {loading && <Loading/>}
      <Navbar TitleName={handleNavbarTitle(userType, userStatus)} />

      {/* ================= REJECT REASON MODAL ================= */}
      {rejectModalOpen && (
        <div className="reject-modal-overlay">
          <div className="reject-modal-box">
            <h2 className="reject-modal-title">Reason for Account Rejection</h2>

            <div className="reject-modal-group">
              <label>Title</label>
              <input
                type="text"
                value={rejectTitle}
                onChange={(e) => setRejectTitle(e.target.value)}
              />
              {rejectErrors.title && (
                <p className="reject-error-text">{rejectErrors.title}</p>
              )}
            </div>

            <div className="reject-modal-group">
              <label>Message</label>
              <textarea
                rows="4"
                value={rejectMessage}
                onChange={(e) => setRejectMessage(e.target.value)}
              ></textarea>
              {rejectErrors.message && (
                <p className="reject-error-text">{rejectErrors.message}</p>
              )}
            </div>

            <div className="reject-modal-buttons">
              <button className="reject-submit" onClick={submitRejectReason}>
                Submit
              </button>
              <button
                className="reject-cancel"
                onClick={() => setRejectModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ======================================================= */}

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

      <div className="view-user-info-container">
        <div className="view-user-back-ctn">
          <button className="view-user-back-btn" onClick={onBack}>
              <FaArrowLeft />
          </button>
          <h3 className="view-user-text-title">Back</h3>
        </div>
        <div className="user-container">
          {/* CUSTOMER */}
          {userType === "Customer" && (
            <div className="verified-customer-view">
              <div className="profile-card">
                <div className="header-section">
                  <div>
                    {
                      userStatus === "Verified" ? (
                        <>
                          <p className="profile-title">Profile information - <span className="verified-color">(Verified)</span></p>
                        </>
                      ) : userStatus === "Unverified" ? (
                        <>
                          <p className="profile-title">
                            Profile information - <span className="unverified-color">(Unverified)</span>
                          </p>
                        </>
                      ) : userStatus === "Rejected" && (
                        <>
                          <p className="profile-title">
                            Profile information - <span className="rejected-color">(Rejected)</span>
                          </p>
                        </>
                      )
                    }
                  </div>

                  <div className="avatar-circle" aria-hidden>
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt={`${user.medicalInstitutionName} profile`} className="avatar-img" />
                    ) : (
                      <FaUserLarge className="avatar-icon" />
                    )}
                  </div>
                </div>

                <section className="info-section">
                  <h3 className="section-title">Medical Institution Information</h3>

                  <div className="form-group">
                    <label>Medical Institution Name</label>
                    <input
                      type="text"
                      value={form.medName}
                      onChange={(e) => setForm((s) => ({ ...s, medName: e.target.value }))}
                      disabled={isCustomerLocked}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Contact Number</label>
                      <div className="input-with-prefix">
                        <input
                          type="text"
                          placeholder="+63 | Contact number"
                          value={form.contact}
                          onChange={(e) => setForm((s) => ({ ...s, contact: e.target.value }))}
                          disabled={isCustomerLocked}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Landline Number (optional)</label>
                      <input
                        type="text"
                        placeholder="02 | Landline number"
                        value={form.landline}
                        onChange={(e) => setForm((s) => ({ ...s, landline: e.target.value }))}
                        disabled={isCustomerLocked}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Official Email Address</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                      disabled={isCustomerLocked}
                    />
                  </div>

                  <div className="form-group">
                    <label>Official Full Address</label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
                      disabled={isCustomerLocked}
                    />
                  </div>

                  <div className="form-group">
                    <ProofArea />
                  </div>
                </section>

                <section className="info-section">
                  <h3 className="section-title">Authorized Representative Details</h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        value={form.repFirstName}
                        onChange={(e) => setForm((s) => ({ ...s, repFirstName: e.target.value }))}
                        disabled={isCustomerLocked}
                      />
                    </div>

                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        value={form.repLastName}
                        onChange={(e) => setForm((s) => ({ ...s, repLastName: e.target.value }))}
                        disabled={isCustomerLocked}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Work Contact Number</label>
                      <input
                        type="text"
                        value={form.repContact}
                        onChange={(e) => setForm((s) => ({ ...s, repContact: e.target.value }))}
                        disabled={isCustomerLocked}
                      />
                    </div>

                    <div className="form-group">
                      <label>Work Email Address</label>
                      <input
                        type="email"
                        value={form.repEmail}
                        onChange={(e) => setForm((s) => ({ ...s, repEmail: e.target.value }))}
                        disabled={isCustomerLocked}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Job Position/Designation</label>
                    <input
                      type="text"
                      value={form.repJob}
                      onChange={(e) => setForm((s) => ({ ...s, repJob: e.target.value }))}
                      disabled={isCustomerLocked}
                    />
                  </div>
                </section>

                <section className="info-section">
                  <h3 className="section-title">User Account</h3>

                  <div className="form-group">
                    <label>Email or Phone</label>
                    <input type="email" value={form.identifier} onChange={(e) => setForm((s) => ({ ...s, identifier: e.target.value }))} disabled={isCustomerLocked} />
                  </div>

                  <div className="form-group">
                    <label>Change Your Password</label>
                    <div className="password-input">
                      <input type={passwordVisible ? "text" : "password"} value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} disabled={isCustomerLocked} />
                      <button className="toggle-password" onClick={togglePasswordVisibility} >
                        {passwordVisible ? <FaRegEye /> : <FaRegEyeSlash /> }
                      </button>
                    </div>
                  </div>
                </section>

                <div className="vui-action-buttons">
                  {userStatus === "Unverified" ? (
                    <>
                      <button className="btn-save1" onClick={() => openModal(handleApprove, "Are you sure you want to approve this user?")}>Approve User</button>
                      <button className="btn-reject" onClick={openRejectReasonModal}>Reject User</button>
                    </>
                  ) : userStatus === "Rejected" ? (
                    <button className="btn-delete" onClick={() => openModal(handleDelete, "Are you sure you want to delete this account permanently?")}>Delete</button>
                  ) : (
                    <>
                      <button className="btn-save1" onClick={() => openModal(handleSave, "Are you sure you want to save all changes?")}>Save Changes</button>
                      <button className="btn-delete" onClick={() => openModal(handleDelete, "Are you sure you want to delete this account permanently?")}>Delete Account</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STAFF */}
          {userType === "Staff" && (
            <div className="verified-staff-view">
              <div className="profile-card">
                <div className="header-section">
                  <h2 className="profile-title">Profile Information</h2>
                  <div className="avatar-circle"><FaUserLarge className="avatar-icon" /></div>
                </div>

                <section className="info-section">
                  <h3 className="section-title">Staff Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input type="text" value={form.firstName} onChange={(e) => setForm((s) => ({ ...s, firstName: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input type="text" value={form.lastName} onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))} />
                    </div>
                  </div>
                </section>

                <section className="info-section">
                  <h3 className="section-title">User Account</h3>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
                  </div>

                  <div className="form-group">
                    <label>Change Your Password</label>
                    <div className="password-input">
                      <input type={passwordVisible ? "text" : "password"} value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} />
                      <button className="toggle-password" onClick={togglePasswordVisibility} aria-label={passwordVisible ? "Hide password" : "Show password"}>
                        {passwordVisible ? <FaRegEyeSlash /> : <FaRegEye />}
                      </button>
                    </div>
                  </div>
                </section>

                <div className="vui-action-buttons">
                  <button className="btn-save1" onClick={() => openModal(handleSave, "Are you sure you want to save all changes?")}>Save Changes</button>
                  <button className="btn-delete" onClick={() => openModal(handleDelete, "Are you sure you want to delete this account permanently?")}>Delete Account</button>
                </div>
              </div>
            </div>
          )}

          {/* ADMIN */}
          {userType === "Admin" && (
            <div className="verified-staff-view">
              <div className="profile-card">
                <div className="header-section">
                  <h2 className="profile-title">Profile Information</h2>
                  <div className="avatar-circle"><FaUserLarge className="avatar-icon" /></div>
                </div>

                <section className="info-section">
                  <h3 className="section-title">Admin Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>User Name</label>
                      <input type="text" value={form.userName} onChange={(e) => setForm((s) => ({ ...s, userName: e.target.value }))} />
                    </div>
                  </div>
                </section>

                <section className="info-section">
                  <h3 className="section-title">User Account</h3>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
                  </div>

                  <div className="form-group">
                    <label>Change Your Password</label>
                    <div className="password-input">
                      <input type={passwordVisible ? "text" : "password"} value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} />
                      <button className="toggle-password" onClick={togglePasswordVisibility} aria-label={passwordVisible ? "Hide password" : "Show password"}>
                        {passwordVisible ? <FaRegEyeSlash /> : <FaRegEye />}
                      </button>
                    </div>
                  </div>
                </section>

                <div className="vui-action-buttons">
                  <button className="btn-save1" onClick={() => openModal(handleSave, "Are you sure you want to save all changes?")}>Save Changes</button>
                  <button className="btn-delete" onClick={() => openModal(handleDelete, "Are you sure you want to delete this account permanently?")}>Delete Account</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ViewUserInfo;
