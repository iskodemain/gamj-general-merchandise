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
  const [adminList, setAdminList] = useState([]);
  const [deliveryInfoList, setDeliveryInfoList] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [cities, setCities] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [fetchCancelledOrders, setFetchCancelledOrders] = useState([]);
  const [fetchReturnRefundOrders, setFetchReturnRefundOrders] = useState([]);
  const [adminProfileInfo, setAdminProfileInfo] = useState([]);
  const [settingsData, setSettingsData] = useState([]);
  const [fetchRefundProof, setFetchRefundProof] = useState([]); 
  const [fetchInventoryStock, setFetchInventoryStock] = useState([]); 
  const [fetchInventoryBatch, setFetchInventoryBatch] = useState([]); 
  const [fetchInventoryHistory, setFetchInventoryHistory] = useState([]); 
  const [fetchOrderTransaction, setFetchOrderTransaction] = useState([]); 
  const [fetchNotifications, setFetchNotifications] = useState([]); 
  const [fetchOrderProofPayment, setFetchOrderProofPayment] = useState([]); 

  const [showOrderPaymentProof, setShowOrderPaymentProof] = useState(false);
  const [selectedPaymentProof, setSelectedPaymentProof] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);

  /*---------------------------FETCH ORDER PROOF OF PAYMENT-----------------------------*/
  const handleFetchOrderProofPayment = async () => {
      try {
          const response = await axios.get(backendUrl + "/api/order/list-payment-proof", {
              headers: {
              Authorization: `Bearer ${token}`
              }
          });
          if (response.data.success) {
              setFetchOrderProofPayment(response.data.allPaymentProof)
          } else {
              toast.error(response.data.message, { ...toastError });
          }
      } catch (error) {
          console.log(error);
      }
  }
  useEffect(() => {
      if (token) {
          handleFetchOrderProofPayment();
      }
  }, [token]);

  /*---------------------------DELETE BARANGAYS-----------------------------*/
  const deleteBarangay = async (barangayID) => {
    if (!token) return;
    try {
      const response = await axios.delete(
        backendUrl + "/api/location/barangays/delete",
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { barangayID }    // ✅ Correct way to send body in DELETE
        }
      );

      if (response.data.success) {
        return true;
      } else {
        toast.error(response.data.message, { ...toastError });
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  /*---------------------------UPDATE BARANGAYS-----------------------------*/
  const updateBarangay = async (payload) => {
    if (!token) return;
    try {
      const response = await axios.put(backendUrl + "/api/location/barangays/update", payload, 
        { headers: { Authorization: `Bearer ${token}` } });

      if (response.data.success) {
        return response.data.data;
      } else {
        toast.error(response.data.message, { ...toastError });
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  /*---------------------------ADD BARANGAYS-----------------------------*/
  const addBarangay = async (payload) => {
    if (!token) return;
    try {
      const response = await axios.post(backendUrl + "/api/location/barangays/add", payload, 
        { headers: { Authorization: `Bearer ${token}` } });

      if (response.data.success) {
        return response.data.data;
      } else {
        toast.error(response.data.message, { ...toastError });
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  /*---------------------------FETCH BARANGAYS-----------------------------*/
  const fetchBarangays = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/location/barangays/fetch", {
          headers: {
            Authorization: `Bearer ${token}`
          }
      });
      if (response.data.success) {
        setBarangays(response.data.barangays)
      } else {
        toast.error(response.data.message, { ...toastError });
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
      if (token) {
        fetchBarangays();
      }
  }, [token]);

  /*---------------------------DELETE CITIES-----------------------------*/
  const deleteCity = async (cityID) => {
    if (!token) return;
    try {
      const response = await axios.delete(
        backendUrl + "/api/location/cities/delete",
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { cityID }    // ✅ Correct way to send body in DELETE
        }
      );

      if (response.data.success) {
        return true;
      } else {
        toast.error(response.data.message, { ...toastError });
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  /*---------------------------UPDATE CITIES-----------------------------*/
  const updateCity = async (payload) => {
    if (!token) return;
    try {
      const response = await axios.put(backendUrl + "/api/location/cities/update", payload, 
        { headers: { Authorization: `Bearer ${token}` } });

      if (response.data.success) {
        return response.data.data;
      } else {
        toast.error(response.data.message, { ...toastError });
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  /*---------------------------ADD CITIES-----------------------------*/
  const addCity = async (payload) => {
    if (!token) return;
    try {
      const response = await axios.post(backendUrl + "/api/location/cities/add", payload, 
        { headers: { Authorization: `Bearer ${token}` } });

      if (response.data.success) {
        return response.data.data;
      } else {
        toast.error(response.data.message, { ...toastError });
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  /*---------------------------FETCH CITIES-----------------------------*/
  const fetchCities = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/location/cities/fetch", {
          headers: {
            Authorization: `Bearer ${token}`
          }
      });
      if (response.data.success) {
        setCities(response.data.cities)
      } else {
        toast.error(response.data.message, { ...toastError });
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
      if (token) {
        fetchCities();
      }
  }, [token]);

  /*--------------------------- DELETE PROVINCE -----------------------------*/
  const deleteProvince = async (provinceID) => {
    if (!token) return;
    try {
      const response = await axios.delete(
        backendUrl + "/api/location/provinces/delete",
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { provinceID }    // ✅ Correct way to send body in DELETE
        }
      );

      if (response.data.success) {
        return true;
      } else {
        toast.error(response.data.message, { ...toastError });
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  /*--------------------------- UPDATE PROVINCE -----------------------------*/
  const updateProvince = async (payload) => {
    if (!token) return;
    try {
      const response = await axios.put(backendUrl + "/api/location/provinces/update", payload, 
        { headers: { Authorization: `Bearer ${token}` } });

      if (response.data.success) {
        return response.data.data;
      } else {
        toast.error(response.data.message, { ...toastError });
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  /*--------------------------- ADD PROVINCE -----------------------------*/
  const addProvince = async (payload) => {
    if (!token) return;
    try {
      const response = await axios.post(backendUrl + "/api/location/provinces/add", payload, 
        { headers: { Authorization: `Bearer ${token}` } });

      if (response.data.success) {
        return response.data.data;
      } else {
        toast.error(response.data.message, { ...toastError });
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  /*---------------------------FETCH PROVINCES-----------------------------*/
  const fetchProvinces = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/location/provinces/fetch", {
          headers: {
            Authorization: `Bearer ${token}`
          }
      });
      if (response.data.success) {
        setProvinces(response.data.provinces)
      } else {
        toast.error(response.data.message, { ...toastError });
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
      if (token) {
        fetchProvinces();
      }
  }, [token]);

  /*---------------------------FETCH NOTIFICATION-----------------------------*/
  const handleFetchNotification = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/admin/notification", {
          headers: {
            Authorization: `Bearer ${token}`
          }
      });
      if (response.data.success) {
        setFetchNotifications(response.data.notifications)
      } else {
        toast.error(response.data.message, { ...toastError });
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
      if (token) {
      handleFetchNotification();
      }
  }, [token]);

  /*--------------------------- DELETE PRODUCT -----------------------------*/
  const deleteProduct = async (productID) => {
    if (!token) return;
    try {
      const response = await axios.delete(
        backendUrl + "/api/product/delete",
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { productID }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message, { ...toastSuccess });
        return true;
      } else {
        toast.error(response.data.message, { ...toastError });
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  /*--------------------------- DELETE ALL PRODUCT CATEGORIES -----------------------------*/
  const getOrderTransaction = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/order/list-order-transaction", {
          headers: {
            Authorization: `Bearer ${token}`
          }
      });
      if (response.data.success) {
        setFetchOrderTransaction(response.data.orderTransaction)
      } else {
        toast.error(response.data.message, { ...toastError });
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
      if (token) {
        getOrderTransaction();
      }
  }, [token]);

  /*--------------------------- DELETE ALL PRODUCT CATEGORIES -----------------------------*/
  const deleteAllProductCategories = async () => {
    if (!token) return;
    try {
      const response = await axios.delete(
        backendUrl + "/api/product/category/delete-all",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        return true;
      } else {
        toast.error(response.data.message, { ...toastError });
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };


  /*--------------------------- DELETE PRODUCT CATEGORY -----------------------------*/
  const deleteProductCategory = async (categoryID) => {
    if (!token) return;
    try {
      const response = await axios.delete(
        backendUrl + "/api/product/category/delete",
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { categoryID }    // ✅ Correct way to send body in DELETE
        }
      );

      if (response.data.success) {
        return true;
      } else {
        toast.error(response.data.message, { ...toastError });
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  /*--------------------------- UPDATE PRODUCT CATEGORY -----------------------------*/
  const updateProductCategory = async (payload) => {
    if (!token) return;
    try {
      const response = await axios.put(backendUrl + "/api/product/category/update", payload, 
        { headers: { Authorization: `Bearer ${token}` } });

      if (response.data.success) {
        return response.data.data;
      } else {
        toast.error(response.data.message, { ...toastError });
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  /*--------------------------- ADD PRODUCT CATEGORY -----------------------------*/
  const addProductCategory = async (payload) => {
    if (!token) return;
    try {
      const response = await axios.post(backendUrl + "/api/product/category/add", payload, 
        { headers: { Authorization: `Bearer ${token}` } });

      if (response.data.success) {
        return response.data.data;
      } else {
        toast.error(response.data.message, { ...toastError });
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  
  /*--------------------------- ADD STOCK (SINGLE ENTRY POINT) -----------------------------*/
  const addStock = async (payload) => {
    if (!token) return;

    try {
      const response = await axios.post(
        backendUrl + "/api/inventory/add-stock",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message, { ...toastSuccess });
        return response.data;
      } else {
        toast.error(response.data.message, { ...toastError });
        return null;
      }
    } catch (error) {
      console.log(error);
      toast.error("Error processing stock-in.", { ...toastError });
      return null;
    }
  };

  /*---------------------------FETCH HISTORY BATCH-----------------------------*/
  const handleFetchInventoryHistory = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/inventory/history", {
          headers: {
            Authorization: `Bearer ${token}`
          }
      });
      if (response.data.success) {
        setFetchInventoryHistory(response.data.inventoryHistory)
      } else {
        toast.error(response.data.message, { ...toastError });
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
      if (token) {
      handleFetchInventoryHistory();
      }
  }, [token]);

  /*---------------------------FETCH INVENTORY BATCH-----------------------------*/
  const handleFetchInventoryBatch = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/inventory/batch", {
          headers: {
            Authorization: `Bearer ${token}`
          }
      });
      if (response.data.success) {
        setFetchInventoryBatch(response.data.inventoryBatch)
      } else {
        toast.error(response.data.message, { ...toastError });
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
      if (token) {
      handleFetchInventoryBatch();
      }
  }, [token]);


  /*---------------------------FETCH INVENTORY STOCK-----------------------------*/
  const handleFetchInventoryStock = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/inventory/stock", {
          headers: {
            Authorization: `Bearer ${token}`
          }
      });
      if (response.data.success) {
        setFetchInventoryStock(response.data.inventoryStock)
      } else {
        toast.error(response.data.message, { ...toastError });
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
      if (token) {
      handleFetchInventoryStock();
      }
  }, [token]);


  /*---------------------------DELETE ORDER ITEM-----------------------------*/
  const adminDeleteOrderItem = async (orderItemID) => {
    if (token) {
      try {
        const response = await axios.patch(backendUrl + "/api/order/admin/delete-order-item", {orderItemID}, {
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

  /*---------------------------SUCCESSFULLY PROCESSED REFUND-----------------------------*/
  const cancelSubmitAsCompleted = async (cancelID, newStatus) => {
    if (token) {
      const payload = {cancelID, newStatus};
      try {
        const response = await axios.patch(backendUrl + "/api/order/cancel/submit-as-completed", payload, {
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

  /*---------------------------CANCEL SUBMIT AS REFUND-----------------------------*/
  const cancelSubmitAsRefund = async (payload) => {
    if (token) {
      try {
        const response = await axios.post(backendUrl + "/api/order/cancel/submit-refund-proof", payload, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
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

  /*---------------------------SUBMIT REFUND PROOF-----------------------------*/
  const submitRefundProof = async (payload) => {
    if (token) {
      try {
        const response = await axios.post(backendUrl + "/api/order/submit-refund-proof", payload, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
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

  /*---------------------------REJECTED  REFUND REQUEST-----------------------------*/
  const rejectRefundRequest = async (refundID, newStatus, rejectedReason) => {
    if (token) {
      const payload = {refundID, newStatus, rejectedReason};
      try {
        const response = await axios.patch(backendUrl + "/api/order/reject-refund-request", payload, {
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

  /*---------------------------SUCCESSFULLY PROCESSED REFUND-----------------------------*/
  const successfullyProcessedRefund = async (refundID, newStatus) => {
    if (token) {
      const payload = {refundID, newStatus};
      try {
        const response = await axios.patch(backendUrl + "/api/order/success-refund-process", payload, {
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

  /*---------------------------APPROVED REFUND REQUEST-----------------------------*/
  const approveRefundRequest = async (refundID, newStatus) => {
    if (token) {
      const payload = {refundID, newStatus};
      try {
        const response = await axios.patch(backendUrl + "/api/order/approve-refund-request", payload, {
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

  /*---------------------------PROCESS REFUND REQUEST-----------------------------*/
  const processRefundRequest = async (refundID, newStatus) => {
    if (token) {
      const payload = {refundID, newStatus};
      try {
        const response = await axios.patch(backendUrl + "/api/order/process-refund-request", payload, {
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

  /*---------------------------FETCH REFUND PROOF-----------------------------*/
  const handleFetchSettingsData = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/order/list-refund-proof", {
          headers: {
            Authorization: `Bearer ${token}`
          }
      });
      if (response.data.success) {
        setFetchRefundProof(response.data.refundProof)
      } else {
        toast.error(response.data.message, { ...toastError });
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
      if (token) {
      handleFetchSettingsData();
      }
  }, [token]);

  /*---------------------------CHANGE SETTINGS DATA-----------------------------*/
  const handleChangeSettingsData = async (payload) => {
    if (token) {
      try {
        const response = await axios.put(
          backendUrl + "/api/settings/update",
          payload, 
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.success) {
          toast.success(response.data.message, { ...toastSuccess });
          return true;
        } else {
          toast.error(response.data.message, { ...toastError });
        }
      } catch (error) {
        console.log(error);
      }
    }
  };


  /*---------------------------FETCH ADMIN SETTING DATA-----------------------------*/
  const fetchSettingsData = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/settings");
      if (response.data.success) {
        setSettingsData(response.data.settingData)
      } else {
        toast.error(response.data.message, { ...toastError });
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
      if (token) {
      fetchSettingsData();
      }
  }, [token]);


  /*---------------------------CHANGE ORDER STATUS-----------------------------*/
  const handleChangeOrderStatus = async (payload) => {
    if (token) {
      try {
        const response = await axios.patch(backendUrl + "/api/order/update-status", payload, {
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

  /*---------------------------SAVE EDIT PROFILE-----------------------------*/
  const handleSaveAdminProfile = async (payload) => {
    if (token) {
      try {
        const response = await axios.patch(backendUrl + "/api/admin/profile/update", payload, {
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

  /*---------------------------FETCH ADMIN PROFILE-----------------------------*/
  const fetchAdminProfile = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/admin/profile", {
          headers: {
            Authorization: `Bearer ${token}`
          }
      });
      if (response.data.success) {
        setAdminProfileInfo(response.data.adminUser)
      } else {
        toast.error(response.data.message, { ...toastError });
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
      if (token) {
      fetchAdminProfile();
      }
  }, [token]);

  /*---------------------------CREATE NEW USER-----------------------------*/
  const handleAddUser = async (payload) => {
    if (token) {
      try {
        const response = await axios.post(backendUrl + "/api/users/add", payload, {
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

  /*---------------------------USER CHANGE INFO PROCESS-----------------------------*/
  const handleSaveUserInfo = async (payload) => {
    if (token) {
      try {
        const response = await axios.put(backendUrl + "/api/users/save-user-info", payload, {
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

  /*---------------------------USER DELETE PROCESS-----------------------------*/
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
            setCurrentUser(response.data.adminUserType); 
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
            return true;
        } else {
          toast.error(response.data.message, { ...toastError });
          return false;
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
    navigate, toastSuccess, toastError, backendUrl, currency, adminLogin, loginIdentifier, setLoginIdentifier, loginToken, adminLoginVerify, isSidebarOpen, setIsSidebarOpen, setToken, token, products, productCategory, addProduct, variantName, productVariantValues, productVariantCombination, updateProduct, customerList, fetchOrders, fetchOrderItems, deliveryInfoList, barangays, cities, provinces, fetchCancelledOrders, fetchReturnRefundOrders, adminList, handleApproveUser, handleRejectUser, handleDeletetUser, handleSaveUserInfo, handleAddUser, fetchAdminProfile, adminProfileInfo, handleSaveAdminProfile, handleChangeOrderStatus, settingsData, handleChangeSettingsData, fetchRefundProof, processRefundRequest, approveRefundRequest, successfullyProcessedRefund, rejectRefundRequest, submitRefundProof, cancelSubmitAsRefund, cancelSubmitAsCompleted, adminDeleteOrderItem, fetchInventoryStock, addStock, fetchInventoryBatch, fetchInventoryHistory, addProductCategory, updateProductCategory, deleteProductCategory, deleteAllProductCategories, fetchOrderTransaction, deleteProduct, fetchNotifications, addProvince, deleteProvince, updateProvince, addCity, updateCity, deleteCity, addBarangay, updateBarangay, deleteBarangay, fetchOrderProofPayment, showOrderPaymentProof, setShowOrderPaymentProof, selectedPaymentProof, setSelectedPaymentProof, currentUser, setCurrentUser
  }  
  return (
    <AdminContext.Provider value={value}>
        {props.children}
    </AdminContext.Provider>
  )
}

export default AdminContextProvider
