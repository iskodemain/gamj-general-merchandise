import React, { useState, useContext } from "react";
import { FaUserLarge, FaRegEye, FaRegEyeSlash, FaArrowLeft } from "react-icons/fa6";
import "./AddNewUser.css";
import Navbar from "./Navbar.jsx";
import Loading from "./Loading.jsx";
import { toast } from "react-toastify";
import { AdminContext } from "../context/AdminContextProvider.jsx";

function AddNewUser() {
  const { handleAddUser, toastError } = useContext(AdminContext);

  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("");

  const [passwordVisible, setPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => setPasswordVisible((v) => !v);

  const defaultForm = {
    medName: "",
    contact: "",
    landline: "",
    email: "",
    address: "",
    repFirstName: "",
    repLastName: "",
    repContact: "",
    repEmail: "",
    repJob: "",
    userName: "",
    identifier: "",
    password: ""
    };

  const [form, setForm] = useState(defaultForm);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone) => /^9\d{9}$/.test(phone);

  const handleContactNumber = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 10) value = value.slice(0, 10);
    if (value && value[0] !== "9") return;
    setForm({ ...form, contact: value });
  };

  const handleRepContactNumber = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 10) value = value.slice(0, 10);
    if (value && value[0] !== "9") return;
    setForm({ ...form, repContact: value });
  };

  const handleLandlineNumber = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 8) value = value.slice(0, 8);
    setForm({ ...form, landline: value });
  };

  const handleSubmit = async () => {
    if (!userType) {
      toast.error("Please select a user type.", toastError);
      return;
    }

    setLoading(true);

    let payload = { userType };

    if (userType === "Customer") {
      if (!form.medName.trim())
        return toastErrorField("Medical institution name is required.");
      if (!form.contact.trim())
        return toastErrorField("Institution contact number is required.");
      if (!isValidPhone(form.contact))
        return toastErrorField("Invalid institution contact number.");
      if (form.landline && form.landline.length !== 8)
        return toastErrorField("Landline number must be 8 digits.");
      if (!form.email.trim())
        return toastErrorField("Institution email address is required.");
      if (!isValidEmail(form.email))
        return toastErrorField("Invalid institution email address.");
      if (!form.address.trim())
        return toastErrorField("Full address is required.");
      if (!form.repFirstName.trim())
        return toastErrorField("Representative first name is required.");
      if (!form.repLastName.trim())
        return toastErrorField("Representative last name is required.");
      if (!form.repContact.trim())
        return toastErrorField("Representative contact is required.");
      if (!isValidPhone(form.repContact))
        return toastErrorField("Invalid representative contact number.");
      if (!form.repEmail.trim())
        return toastErrorField("Representative email is required.");
      if (!isValidEmail(form.repEmail))
        return toastErrorField("Invalid representative email address.");
      if (!form.repJob.trim())
        return toastErrorField("Representative job position is required.");
      if (!form.identifier.trim())
        return toastErrorField("Account email/phone is required.");
      if (!form.password.trim())
        return toastErrorField("Account password is required.");

      payload = {
        ...payload,
        medicalInstitutionName: form.medName.trim(),
        contactNumber: form.contact.trim(),
        landlineNumber: form.landline.trim(),
        emailAddress: form.email.trim(),
        fullAddress: form.address.trim(),
        repFirstName: form.repFirstName.trim(),
        repLastName: form.repLastName.trim(),
        repContactNumber: form.repContact.trim(),
        repEmailAddress: form.repEmail.trim(),
        repJobPosition: form.repJob.trim(),
        identifier: form.identifier.trim(),
        password: form.password.trim()
      };
    }
    else if (userType === "Staff") {
      if (!form.userName.trim())
        return toastErrorField("Username is required.");
      if (!form.identifier.trim())
        return toastErrorField("Account email/phone is required.");
      if (!form.password.trim())
        return toastErrorField("Account password is required.");

      payload = {
        ...payload,
        userName: form.userName.trim(),
        identifier: form.identifier.trim(),
        password: form.password.trim()
      };
    }
    else if (userType === "Admin") {
      if (!form.userName.trim())
        return toastErrorField("Username is required.");
      if (!form.identifier.trim())
        return toastErrorField("Account email/phone is required.");
      if (!form.password.trim())
        return toastErrorField("Account password is required.");

      payload = {
        ...payload,
        userName: form.userName.trim(),
        identifier: form.identifier.trim(),
        password: form.password.trim()
      };
    }

    const created = await handleAddUser(payload);
    setLoading(false);

    if (created) {
        setTimeout(() => {
            window.location.href = "/allusers";  
        }, 500);
    }
  };

  const toastErrorField = (msg) => {
    toast.error(msg, toastError);
    setLoading(false);
    return false;
  };

  const renderCustomerFields = () => (
    <>
      <div className="add-user-customer-view">
        <div className="add-user-profile-card">
          <div className="add-user-header-section">
            <p className="add-user-profile-title">Customer Information</p>
          </div>

          <section className="add-user-info-section">
            <h3 className="add-user-section-title">Medical Institution Information</h3>

            <div className="add-user-form-group">
              <label>Medical Institution Name</label>
              <input
                type="text"
                placeholder="Medical Institution Name"
                value={form.medName}
                onChange={(e) => setForm({ ...form, medName: e.target.value })}
                required
              />
            </div>

            <div className="add-user-form-row">
              <div className="add-user-form-group">
                <label>Contact Number</label>
                <input
                  type="text"
                  placeholder="+63 | Contact number"
                  value={form.contact}
                  onChange={handleContactNumber}
                  required
                />
              </div>

              <div className="add-user-form-group">
                <label>Landline (optional)</label>
                <input
                  type="text"
                  placeholder="02 | Landline number"
                  value={form.landline}
                  onChange={handleLandlineNumber}
                />
              </div>
            </div>

            <div className="add-user-form-group">
              <label>Official Email Address</label>
              <input
                type="email"
                placeholder="Official Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="add-user-form-group">
              <label>Official Full Address</label>
              <input
                type="text"
                placeholder="Full Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
              />
            </div>
          </section>

          <section className="add-user-info-section">
            <h3 className="add-user-section-title">Authorized Representative</h3>

            <div className="add-user-form-row">
              <div className="add-user-form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={form.repFirstName}
                  onChange={(e) =>
                    setForm({ ...form, repFirstName: e.target.value })
                  }
                />
              </div>

              <div className="add-user-form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={form.repLastName}
                  onChange={(e) =>
                    setForm({ ...form, repLastName: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="add-user-form-row">
              <div className="add-user-form-group">
                <label>Work Contact Number</label>
                <input
                  type="text"
                  placeholder="+63 | Contact number"
                  value={form.repContact}
                  onChange={handleRepContactNumber}
                />
              </div>

              <div className="add-user-form-group">
                <label>Work Email Address</label>
                <input
                  type="email"
                  value={form.repEmail}
                  onChange={(e) =>
                    setForm({ ...form, repEmail: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="add-user-form-group">
              <label>Job Position</label>
              <input
                type="text"
                placeholder="Job Position"
                value={form.repJob}
                onChange={(e) => setForm({ ...form, repJob: e.target.value })}
              />
            </div>
          </section>

          <section className="add-user-info-section">
            <h3 className="add-user-section-title">User Account</h3>

            <div className="add-user-form-group">
              <label>Email or Phone Number</label>
              <input
                type="text"
                value={form.identifier}
                onChange={(e) =>
                  setForm({ ...form, identifier: e.target.value })
                }
              />
            </div>

            <div className="add-user-form-group">
              <label>Create New Password</label>
              <div className="add-user-password-input">
                <input
                  type={passwordVisible ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <button className="add-user-toggle-password" onClick={togglePasswordVisibility}>
                  {passwordVisible ? <FaRegEye /> : <FaRegEyeSlash />}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );

  const renderStaffFields = () => (
    <div className="add-user-staff-view">
      <div className="add-user-profile-card">
        <div className="add-user-header-section">
          <h2 className="add-user-profile-title">Staff Information</h2>
        </div>

        <section className="add-user-info-section">
          <h3 className="add-user-section-title">Staff Details</h3>
          <div className="add-user-form-group">
            <label>User Name</label>
            <input
              type="text"
              value={form.userName}
              onChange={(e) =>
                setForm({ ...form, userName: e.target.value })
              }
            />
          </div>
        </section>

        <section className="add-user-info-section">
          <h3 className="add-user-section-title">User Account</h3>

          <div className="add-user-form-group">
            <label>Email or Phone Number</label>
            <input
              type="text"
              value={form.identifier}
              onChange={(e) =>
                setForm({ ...form, identifier: e.target.value })
              }
            />
          </div>

          <div className="add-user-form-group">
            <label>Create New Password</label>
            <div className="add-user-password-input">
              <input
                type={passwordVisible ? "text" : "password"}
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
              <button className="add-user-toggle-password" onClick={togglePasswordVisibility}>
                {passwordVisible ? <FaRegEye /> : <FaRegEyeSlash />}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  const renderAdminFields = () => (
    <div className="add-user-admin-view">
      <div className="add-user-profile-card">
        <div className="add-user-header-section">
          <h2 className="add-user-profile-title">Admin Information</h2>
        </div>

        <section className="add-user-info-section">
          <h3 className="add-user-section-title">Admin Details</h3>
          <div className="add-user-form-group">
            <label>Username</label>
            <input
              type="text"
              value={form.userName}
              onChange={(e) => setForm({ ...form, userName: e.target.value })}
            />
          </div>
        </section>

        <section className="add-user-info-section">
          <h3 className="add-user-section-title">User Account</h3>

          <div className="add-user-form-group">
            <label>Email or Phone Number</label>
            <input
              type="text"
              value={form.identifier}
              onChange={(e) =>
                setForm({ ...form, identifier: e.target.value })
              }
            />
          </div>

          <div className="add-user-form-group">
            <label>Create New Password</label>
            <div className="add-user-password-input">
              <input
                type={passwordVisible ? "text" : "password"}
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
              <button className="add-user-toggle-password" onClick={togglePasswordVisibility}>
                {passwordVisible ? <FaRegEye /> : <FaRegEyeSlash />}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  return (
    <>
      {loading && <Loading />}

      <Navbar TitleName="Add New User" />

      <div className="add-user-container">
        <div className="add-user-back-ctn">
          <button className="add-user-back-btn" onClick={() => window.history.back()}>
            <FaArrowLeft />
          </button>
          <h3 className="add-user-text-title">Back</h3>
        </div>

        <div className="add-user-content">
          <div className="add-user-profile-card" style={{ marginBottom: "1.5rem" }}>
            <section className="add-user-info-section">
              <h3 className="add-user-section-title">Select User Role</h3>
              <div className="add-user-form-group">
                <label>User Type</label>
                <select
                  value={userType}
                  onChange={(e) => {
                    setUserType(e.target.value);
                    setForm(defaultForm);
                  }}
                >
                  <option value="">-- Select Role --</option>
                  <option value="Admin">Admin</option>
                  <option value="Staff">Staff</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>
            </section>
          </div>

          {userType === "Customer" && renderCustomerFields()}
          {userType === "Staff" && renderStaffFields()}
          {userType === "Admin" && renderAdminFields()}

          {userType && (
            <div className="add-user-action-buttons">
              <button className="add-user-btn-save" onClick={handleSubmit}>
                Add New User
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AddNewUser;