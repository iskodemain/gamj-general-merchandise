import axios from "axios"
import React, { useEffect, useState } from 'react'
import { createContext } from 'react';
import { useNavigate } from "react-router-dom";
import { Bounce, toast } from "react-toastify";
import { TbCurrencyPeso } from "react-icons/tb";
import { io } from "socket.io-client"

export const AdminContext = createContext();
const AdminContextProvider = (props) => {
  /*-----------------------TOAST---------------------*/
  const toastSuccess = {
    position: "top-center", autoClose: 3000, hideProgressBar: true, closeOnClick: false, pauseOnHover: false, draggable: true, progress: 0, theme: "light", transition: Bounce
  }
  const toastError = {
    position: "top-center", autoClose: 3000, hideProgressBar: true, closeOnClick: false, pauseOnHover: false, draggable: true, progress: 0, theme: "light", transition: Bounce
  }

  const currency = <TbCurrencyPeso className="peso-sign"/>; 
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const socket = io(backendUrl);

  const [token, setToken] = useState(() => localStorage.getItem('adminAuthToken') || '');
  const [loginToken, setLoginToken] = useState(() => localStorage.getItem('adminLoginToken') || '');
  const [loginIdentifier, setLoginIdentifier] = useState(() => sessionStorage.getItem('adminLoginIdentifier') || '');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [productCategory, setProductCategory] = useState([]);
  const [variantName, setVariantName] = useState([]);
  const [productVariantValues, setProductVariantValues] = useState([]);
  const [productVariantCombination, setProductVariantCombination] = useState([]);
  const [fetchOrders, setFetchOrders] = useState([]);
  const [fetchOrderItems, setFetchOrderItems] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [adminList, setAdminList] = useState([]);
  const [deliveryInfoList, setDeliveryInfoList] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [cities, setCities] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [fetchCancelledOrders, setFetchCancelledOrders] = useState([]);
  const [fetchReturnRefundOrders, setFetchReturnRefundOrders] = useState([]);


  /*---------------------------USER REJECT PROCESS-----------------------------*/
  const handleDeletetUser = async (userID, userType) => {
    if (token) {
      const formData = {userID, userType};
      try {
        const response = await axios.post(backendUrl + "/api/users/delete", formData, {
            headers: {
              Authorization: `Bearer ${token}`
            }
        });
        if (response.data.success) {
            toast.success(response.data.message, { ...toastSuccess });
            return true
        } else {
          toast.error(response.data.message, { ...toastError });
        }
      } catch (error) {
          console.log(error);
      }
    }
  }

  /*---------------------------USER REJECT PROCESS-----------------------------*/
  const handleRejectUser = async (userID, userType, rejectTitle, rejectMessage) => {
    if (token) {
      const formData = {userID, userType, rejectTitle, rejectMessage};
      try {
        const response = await axios.patch(backendUrl + "/api/users/reject", formData, {
            headers: {
              Authorization: `Bearer ${token}`
            }
        });
        if (response.data.success) {
            toast.success(response.data.message, { ...toastSuccess });
            return true
        } else {
          toast.error(response.data.message, { ...toastError });
        }
      } catch (error) {
          console.log(error);
      }
    }
  }

  /*---------------------------USER APPROVED PROCESS-----------------------------*/
  const handleApproveUser = async (userID, userType) => {
    if (token) {
      const formData = {userID, userType};
      try {
        const response = await axios.patch(backendUrl + "/api/users/approval", formData, {
            headers: {
              Authorization: `Bearer ${token}`
            }
        });
        if (response.data.success) {
            toast.success(response.data.message, { ...toastSuccess });
            return true
        } else {
          toast.error(response.data.message, { ...toastError });
        }
      } catch (error) {
          console.log(error);
      }
    }
  }

  /*--------------------------FETCH RETURN AND REFUND ORDERS----------------------------*/
    const handleFetchReturnRefundOrders = async() => {
        try {
            const response = await axios.get(backendUrl + "/api/order/list-return-refund", {
                headers: {
                Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setFetchReturnRefundOrders(response.data.returnRefundOrders);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message, {...toastError});
        }
    }
    useEffect(() => {
        if (token) {
        handleFetchReturnRefundOrders();
        }
    }, [token]);

  /*--------------------------FETCH CANCELLED ORDERS----------------------------*/
    const handleFetchCancelledOrders = async() => {
        try {
            const response = await axios.get(backendUrl + "/api/order/list-cancel-order", {
                headers: {
                Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setFetchCancelledOrders(response.data.orderCancel);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message, {...toastError});
        }
    }
    useEffect(() => {
        if (token) {
        handleFetchCancelledOrders();
        }
    }, [token]);

  /*--------------------------FETCH LOCATIONS----------------------------*/
    const handleFetchLocations = async() => {
        try {
            const response = await axios.get(backendUrl + "/api/users/locations", {
                headers: {
                Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setBarangays(response.data.barangays);
                setCities(response.data.cities);
                setProvinces(response.data.provinces);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message, {...toastError});
        }
    }
    useEffect(() => {
        if (token) {
        handleFetchLocations();
        }
    }, [token]);

  /*--------------------------FETCH DELIVERY INFORMATION----------------------------*/
  const handleFetchDeliveryInfo = async() => {
      try {
          const response = await axios.get(backendUrl + "/api/users/delivery-info", {
              headers: {
              Authorization: `Bearer ${token}`
              }
          });
          if (response.data.success) {
              setDeliveryInfoList(response.data.deliveryInfoList);
          }
      } catch (error) {
          console.log(error);
          toast.error(error.message, {...toastError});
      }
  }
  useEffect(() => {
      if (token) {
      handleFetchDeliveryInfo();
      }
  }, [token]);


  /*--------------------------FETCH ADMIN----------------------------*/
  const handleFetchAllAdmin = async() => {
    try {
        const response = await axios.get(backendUrl + "/api/users/admin", {
            headers: {
            Authorization: `Bearer ${token}`
            }
        });
        if (response.data.success) {
            setAdminList(response.data.adminList);
        }
    } catch (error) {
        console.log(error);
        toast.error(error.message, {...toastError});
    }
  }
  useEffect(() => {
      if (token) {
      handleFetchAllAdmin();
      }
  }, [token]);
  

  /*--------------------------FETCH STAFF----------------------------*/
  const handleFetchAllStaff = async() => {
    try {
        const response = await axios.get(backendUrl + "/api/users/staff", {
            headers: {
            Authorization: `Bearer ${token}`
            }
        });
        if (response.data.success) {
            setStaffList(response.data.staffList);
        }
    } catch (error) {
        console.log(error);
        toast.error(error.message, {...toastError});
    }
  }
  useEffect(() => {
      if (token) {
      handleFetchAllStaff();
      }
  }, [token]);

  /*--------------------------FETCH CUSTOMERS----------------------------*/
    const handleFetchAllCustomer = async() => {
        try {
            const response = await axios.get(backendUrl + "/api/users/customer", {
                headers: {
                Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setCustomerList(response.data.customerList);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message, {...toastError});
        }
    }
    useEffect(() => {
        if (token) {
        handleFetchAllCustomer();
        }
    }, [token]);

  /*--------------------------FETCH ORDERS----------------------------*/
    const handleFetchOrders = async() => {
        try {
            const response = await axios.get(backendUrl + "/api/order/list", {
                headers: {
                Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setFetchOrders(response.data.orders);
                setFetchOrderItems(response.data.orderItems);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message, {...toastError});
        }
    }
    useEffect(() => {
        if (token) {
        handleFetchOrders();
        }
    }, [token]);

  /*---------------------------FETCH ALL PRODUCT VARIANT COMBINATION-----------------------------*/
    const fetchProductVariantCombination = async () => {
      try {
        const response = await axios.get(backendUrl + "/api/product/product-variant-combination");
        if (response.data.success) {
            setProductVariantCombination(response.data.productVariantCombination);
        } 
      } catch (error) {
          console.log(error);
          toast.error(error.message, { ...toastError });
      }

    };
    useEffect(() => {
        if (token) {
          fetchProductVariantCombination();
        }
    }, [token]);

  /*---------------------------FETCH ALL PRODUCT VARIANT VALUES-----------------------------*/
    const fetchProductVariantValues = async () => {
        try {
          const response = await axios.get(backendUrl + "/api/product/product-variant-values");
          if (response.data.success) {
              setProductVariantValues(response.data.productVariantValues);
          }
        } catch (error) {
            console.log(error);
            toast.error(error.message, { ...toastError });
        }
    };
    useEffect(() => {
    if (token) {
      fetchProductVariantValues();
    }
  }, [token]);


  /*---------------------------FETCH ALL VARIANT NAME-----------------------------*/
    const fetchVariantName = async () => {
      try {
        const response = await axios.get(backendUrl + "/api/product/variant-name");
        if (response.data.success) {
            setVariantName(response.data.variantName);
        }
      } catch (error) {
          console.log(error);
          toast.error(error.message, { ...toastError });
      }
    };
    useEffect(() => {
    if (token) {
      fetchVariantName();
    }
  }, [token]);

  /*---------------------------UPDATE PRODUCTS-----------------------------*/
  const updateProduct = async (formData) => {
    if (token) {
      try {
        const response = await axios.put(backendUrl + "/api/product/update", formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
        });;
        if (response.data.success) {
            toast.success(response.data.message, { ...toastSuccess });
        } else {
          toast.error(response.data.message, { ...toastError });
        }
      } catch (error) {
          console.log(error);
      }
    }
  }

  /*---------------------------ADD PRODUCTS-----------------------------*/
  const addProduct = async (formData) => {
    if (token) {
      try {
        const response = await axios.post(backendUrl + "/api/product/add", formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
        });;
        if (response.data.success) {
            toast.success(response.data.message, { ...toastSuccess });
        } else {
          toast.error(response.data.message, { ...toastError });
        }
      } catch (error) {
          console.log(error);
      }
    }
  }


  /*---------------------------FETCH ALL PRODUCTS-----------------------------*/
  const fetchAllProducts = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list", {
          headers: {
          Authorization: `Bearer ${token}`
          }
      });;
      if (response.data.success) {
          setProducts(response.data.products);
      } 
    } catch (error) {
        console.log(error);
    }
  }
  useEffect(() => {
    if (token) {
      fetchAllProducts();
    }
  }, [token]);

  /*---------------------------FETCH PRODUCT CATEGORY-----------------------------*/
  const fetchProductCategory = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/category", {
          headers: {
          Authorization: `Bearer ${token}`
          }
      });;
      if (response.data.success) {
          setProductCategory(response.data.productCategory);
      } 
    } catch (error) {
        console.log(error);
    }
  }
  useEffect(() => {
    if (token) {
      fetchProductCategory();
    }
  }, [token]);


  /*--------------------------ADMIN LOGIN---------------------------*/
  const adminLogin = async (identifier, password) => {
    try {
        const payload = {identifier, password};
        const response = await axios.post(backendUrl + "/api/admin/login", payload);

        if (response.data.success) {
          setLoginToken(response.data.loginToken);
          localStorage.setItem('adminLoginToken', response.data.loginToken);
          setLoginIdentifier(identifier);
          sessionStorage.setItem('adminLoginIdentifier', identifier)
          toast.success(response.data.message, { ...toastSuccess });
          navigate("/verify");
          return true;

        } else {
            toast.error(response.data.message, { ...toastError });
        }
    } catch (error) {
        console.log(error);
        toast.error(error.message, { ...toastError });
    }
  };

  /*--------------------------ADMIN LOGIN VERIFY---------------------------*/
  const adminLoginVerify = async (loginToken, code) => {
    try {
        const payload = {loginToken, code};
        const response = await axios.post(backendUrl + "/api/admin/login/verify", payload);

        if (response.data.success) {
          setLoginToken('');
          localStorage.removeItem('adminLoginToken');
          setLoginIdentifier('');
          sessionStorage.removeItem('adminLoginIdentifier');
          localStorage.setItem("adminAuthToken", response.data.token);
          setToken(response.data.token);
          toast.success(response.data.message, { ...toastSuccess });
          navigate("/overview");
          return true

        } else {
            toast.error(response.data.message, { ...toastError });
        }
    } catch (error) {
        console.log(error);
        toast.error(error.message, { ...toastError });
    }
  };

  // 🚨 AUTO LOGOUT INTERCEPTOR FOR DELETED ADMINS
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          const data = error.response.data;

          if (data.forceLogout) {
            toast.error("Your account has been removed.", { ...toastError });
            navigate("/login");

            localStorage.removeItem("adminAuthToken");
            localStorage.removeItem("adminLoginToken");
            sessionStorage.clear();

            setToken("");
            setLoginToken("");
            setLoginIdentifier("");

            return Promise.reject(error);
          }

          if (data.message === "Unauthorized: Token missing or malformed.") {
            toast.error("Please log in again.", { ...toastError });
            navigate("/login");

            localStorage.removeItem("adminAuthToken");
            localStorage.removeItem("adminLoginToken");
            sessionStorage.clear();

            setToken("");
            setLoginToken("");
            setLoginIdentifier("");

            return Promise.reject(error);
          }

          if (data.message === "Invalid or expired token. Please log in again.") {
            toast.error("Session expired. Please log in again.", { ...toastError });
            navigate("/login");

            localStorage.removeItem("adminAuthToken");
            localStorage.removeItem("adminLoginToken");
            sessionStorage.clear();

            setToken("");
            setLoginToken("");
            setLoginIdentifier("");

            return Promise.reject(error);
          }

        }

        return Promise.reject(error);
      }
    );

    // Cleanup interceptor when component unmounts
    return () => axios.interceptors.response.eject(interceptor);
  }, []);


  const value = {
    navigate, toastSuccess, toastError, backendUrl, currency, adminLogin, loginIdentifier, setLoginIdentifier, loginToken, adminLoginVerify, isSidebarOpen, setIsSidebarOpen, setToken, token, products, productCategory, addProduct, variantName, productVariantValues, productVariantCombination, updateProduct, customerList, fetchOrders, fetchOrderItems, deliveryInfoList, barangays, cities, provinces, fetchCancelledOrders, fetchReturnRefundOrders, adminList, staffList, handleApproveUser, handleRejectUser, handleDeletetUser
  }  
  return (
    <AdminContext.Provider value={value}>
        {props.children}
    </AdminContext.Provider>
  )
}

export default AdminContextProvider
