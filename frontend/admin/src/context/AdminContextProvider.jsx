import axios from "axios"
import React, { useEffect, useState } from 'react'
import { createContext } from 'react';
import { useNavigate } from "react-router-dom";
import { Bounce, toast } from "react-toastify";
import { TbCurrencyPeso } from "react-icons/tb";
import { io } from "socket.io-client"

export const AdminContext = createContext();
const AdminContextProvider = (props) => {
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

  /*---------------------------FETCH ALL PRODUCT VARIANT COMBINATIONS-----------------------------*/
    const fetchProductVariantCombination = async () => {
        if (token) {
          try {
            const response = await axios.get(backendUrl + "/api/product/product-variant-combination");
            if (response.data.success) {
                setProductVariantCombination(response.data.productVariantCombination);
            } 
          } catch (error) {
              console.log(error);
              toast.error(error.message, { ...toastError });
          }
        }
    };
    useEffect(() => {
        if (token) {
          fetchProductVariantCombination();
        }
    }, [token]);

  /*---------------------------FETCH ALL VARIANT NAME-----------------------------*/
    const fetchProductVariantValues = async () => {
        if (token) {
          try {
            const response = await axios.get(backendUrl + "/api/product/product-variant-values");
            if (response.data.success) {
                setProductVariantValues(response.data.productVariantValues);
            }
          } catch (error) {
              console.log(error);
              toast.error(error.message, { ...toastError });
          }
        }
    };
    useEffect(() => {
    if (token) {
      fetchProductVariantValues();
    }
  }, [token]);

  /*---------------------------FETCH ALL VARIANT NAME-----------------------------*/
    const fetchVariantName = async () => {
        if (token) {
          try {
            const response = await axios.get(backendUrl + "/api/product/variant-name");
            if (response.data.success) {
                setVariantName(response.data.variantName);
            }
          } catch (error) {
              console.log(error);
              toast.error(error.message, { ...toastError });
          }
        }
    };
    useEffect(() => {
    if (token) {
      fetchVariantName();
    }
  }, [token]);

  /*---------------------------FETCH ALL PRODUCTS-----------------------------*/
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
    if (token) {
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
  }
  useEffect(() => {
    if (token) {
      fetchAllProducts();
    }
  }, [token]);

  /*---------------------------FETCH PRODUCT CATEGORY-----------------------------*/
  const fetchProductCategory = async () => {
    if (token) {
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


  
  /*-----------------------TOAST---------------------*/
  const toastSuccess = {
      position: "top-center", autoClose: 3000, hideProgressBar: true, closeOnClick: false, pauseOnHover: false, draggable: true, progress: 0, theme: "light", transition: Bounce
  }
  const toastError = {
      position: "top-center", autoClose: 3000, hideProgressBar: true, closeOnClick: false, pauseOnHover: false, draggable: true, progress: 0, theme: "light", transition: Bounce
  }

  const value = {
    navigate, toastSuccess, toastError, backendUrl, currency, adminLogin, loginIdentifier, setLoginIdentifier, loginToken, adminLoginVerify, isSidebarOpen, setIsSidebarOpen, setToken, token, products, productCategory, addProduct, variantName, productVariantValues, productVariantCombination
  }  
  return (
    <AdminContext.Provider value={value}>
        {props.children}
    </AdminContext.Provider>
  )
}

export default AdminContextProvider
