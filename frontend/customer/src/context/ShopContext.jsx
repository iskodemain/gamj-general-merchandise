import { createContext, useEffect, useState } from "react";
// import { products } from "../assets/assets.js";
import axios from "axios"
import { TbCurrencyPeso } from "react-icons/tb";
import './ShopContext.css'
import { Bounce, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

export const ShopContext = createContext();
const ShopContextProvider = (props) => {
    const currency = <TbCurrencyPeso className="peso-sign"/>; 
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const socket = io(backendUrl);
    
    /*--------------------------USE STATE--------------------------*/
    const [token, setToken] = useState(() => localStorage.getItem('authToken') || '');
    const [loginToken, setLoginToken] = useState(() => localStorage.getItem('loginToken') || '');
    const [resetPasswordToken, setResetPasswordToken] = useState(() => localStorage.getItem('resetPasswordToken') || '');
    const [loginIdentifier, setLoginIdentifier] = useState(() => sessionStorage.getItem('loginIdentifier') || '');
    const [fpIdentifier, setFpIdentifier] = useState(() => sessionStorage.getItem('fpIdentifier') || '');
    const [verifiedUser, setVerifiedUser] = useState(null);
    const [showImportantNote, setShowImportantNote] = useState(false);
    const [showUnavailableNote, setShowUnavailableNote] = useState(false);
    const [search, setSearch] = useState('')
    const [showSearch, setShowSearch] = useState(false)
    const [cartItems, setCartItems] = useState([]);
    const [wishlistItems, setWishListItems] = useState([]);
    const [showWishlistContent, setShowWishlistContent] = useState(false);
    const [showCartContent, setShowCartContent] = useState(false);
    const [products, setProducts] = useState([]);
    const [productVariantValues, setProductVariantValues] = useState([]);
    const [variantName, setVariantName] = useState([]);
    const [productVariantCombination, setProductVariantCombination] = useState([]);
    const [productCategory, setProductCategory] = useState([]);
    const [activeStep, setActiveStep] = useState(1); 
    const [hasDeliveryInfo, setHasDeliveryInfo] = useState(false);
    const [nbProfileImage, setNbProfileImage] = useState(null);
    const navigate = useNavigate();
    const [orderItemId, setOrderItemId] = useState(null); // For cancel and refund order modals
    const [cartItemsToDelete, setCartItemsToDelete] = useState([]);

    /*----------------------FETCH NOTIFICATION PAGE-----------------------*/
    const [fetchNotifications, setFetchNotifications] = useState([]);
    const handleFetchNotification = async() => {
        try {
            const response = await axios.get(backendUrl + "/api/notification/", {
                headers: {
                Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setFetchNotifications(response.data.notifications);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message, {...toastError});
        }
    }
    useEffect(() => {
        if (token) {
            handleFetchNotification();
        }
    }, [token]);


    /*----------------------READ NOTIFICATION-----------------------*/
    const readNotification = async() => {
        try {
            await axios.patch(backendUrl + "/api/notification/read", {}, {
                headers: { Authorization: `Bearer ${token}`},
            });
        } catch (error) {
            console.log(error);
            toast.error(error.message, {...toastError});
        }
    }


    /*----------------------DELETE NOTIFICATION-----------------------*/
    const deleteNotification = async(notificationID) => {
        try {
            const response = await axios.delete(backendUrl + "/api/notification/delete", {
                headers: { Authorization: `Bearer ${token}`},
                data: { notificationID }
            });
            if (response.data.success) {
                toast.success(response.data.message, { ...toastSuccess });
            } else {
                toast.error(response.data.message, { ...toastError });
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message, {...toastError});
        }
    }


    /*--------------------RETURN/REFUND ORDER PROCESS---------------------*/
    const [showRejectedRefund, setShowRejectedRefund] = useState(false); 
    const [viewRefundReceipt, setViewRefundReceipt] = useState(false); // CANCEL & RETURN/REFUND ORDERS
    const [refundOrder, setRefundOrder] = useState(false);
    const [reasonForRefund, setReasonForRefund] = useState('');
    const [refundComments, setRefundComments] = useState('');
    const [imageProof1, setImageProof1] = useState(null);
    const [imageProof2, setImageProof2] = useState(null);
    const [refundResolution, setRefundResolution] = useState('');
    const [otherReason, setOtherReason] = useState('');
    const [refundMethod, setRefundMethod] = useState('');
    const [refundPaypalEmail, setRefundPaypalEmail] = useState('');
    const [refundStatus, setRefundStatus] = useState('Pending');

    /*---------------------CANCEL ORDER REFUND REQUEST-----------------------*/
    const cancelOrderRefundRequest = async (orderRefundId, orderItemId) => {
        if (token) {
            try {
                const payload = {orderRefundId, orderItemId};
                const response = await axios.patch(backendUrl + "/api/order/cancel-refund-request", payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    toast.success(response.data.message, { ...toastSuccess });

                } else {
                    toast.error(response.data.message, { ...toastError });
                }
            } catch (error) {
                console.log(error);
                toast.error(error.message, { ...toastError });
            }
        }
    };


    /*--------------------------FETCH ORDER REFUND----------------------------*/
    const [fetchOrderRefund, setFetchOrderRefund] = useState([]);
    const handleFetchOrderRefund = async() => {
        try {
            const response = await axios.get(backendUrl + "/api/order/order-refund", {
                headers: {
                Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setFetchOrderRefund(response.data.orderRefund);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message, {...toastError});
        }
    }
    useEffect(() => {
        if (token) {
            handleFetchOrderRefund();
        }
    }, [token]);

    /*--------------------------ADD ORDER REFUND----------------------------*/
    const addOrderRefund = async (orderItemId, reasonForRefund, refundComments, imageProof1, imageProof2, refundResolution, otherReason, refundMethod, refundPaypalEmail, refundStatus) => {
        if (token) {
            try {
                const formData = new FormData();
                formData.append('orderItemId', orderItemId);
                formData.append('reasonForRefund', reasonForRefund);
                formData.append('refundComments', refundComments || '');
                formData.append('refundResolution', refundResolution);
                formData.append('otherReason', otherReason || '');
                formData.append('refundMethod', refundMethod || '');
                formData.append('refundPaypalEmail', refundPaypalEmail || '');
                formData.append('refundStatus', refundStatus || '');
                if (imageProof1 instanceof File) {
                    formData.append("imageProof1", imageProof1);
                }
                if (imageProof2 instanceof File) {
                    formData.append("imageProof2", imageProof2);
                }

                const response = await axios.post(backendUrl + "/api/order/order-refund/add", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
                });
                if (response.data.success) {
                    toast.success(response.data.message, {...toastSuccess});
                } else {
                    toast.error(response.data.message, {...toastError});
                }
            } catch (error) {
                console.log(error);
                toast.error(error.message, { ...toastError });
            }
        }
    };

    /*-----------------------CANCEL ORDER PROCESS-------------------------*/
    const [cancelOrder, setCancelOrder] = useState(false);
    const [paymentUsed, setPaymentUsed] = useState('');
    
    const [reasonForCancellation, setReasonForCancellation] = useState('');
    const [cancelComments, setCancelComments] = useState('');
    const [cancelPaypalEmail, setCancelPaypalEmail] = useState(''); 
    const [cancellationStatus, setCancellationStatus] = useState('Processing'); 
    const [cancelledBy, setCancelledBy] = useState('Customer');

    /*--------------------------FETCH REFUND PROOF----------------------------*/
    const [fetchRefundProof, setFetchRefundProof] = useState([]);
    const handleFetchRefundProof = async() => {
        try {
            const response = await axios.get(backendUrl + "/api/order/refund-proof", {
                headers: {
                Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setFetchRefundProof(response.data.refundProof);
            }
        } catch (error) {
        console.log(error);
        toast.error(error.message, {...toastError});
        }
    }
    useEffect(() => {
        if (token) {
            handleFetchRefundProof();
        }
    }, [token]);
    

    /*--------------------------MARK REFUND RECEIVED----------------------------*/
    const markRefundReceived = async (orderCancelId, orderRefundId) => {
        if (token) {
            try {
                const payload = {orderCancelId, orderRefundId};
                const response = await axios.put(backendUrl + "/api/order/mark-refund-received", payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    toast.success(response.data.message, { ...toastSuccess });

                } else {
                    toast.error(response.data.message, { ...toastError });
                }
            } catch (error) {
                console.log(error);
                toast.error(error.message, { ...toastError });
            }
        }
    };

    /*--------------------------CANCEL ORDER REQUEST----------------------------*/
    const cancelOrderRequest = async (orderItemId, orderCancelId) => {
        if (token) {
            try {
                const payload = {
                    orderItemId,
                    orderCancelId
                }
                const response = await axios.put(backendUrl + "/api/order/cancel-order-request", payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    toast.success(response.data.message, { ...toastSuccess });

                } else {
                    toast.error(response.data.message, { ...toastError });
                }
            } catch (error) {
                console.log(error);
                toast.error(error.message, { ...toastError });
            }
        }
    };

    /*--------------------------REMOVE ORDERS----------------------------*/
    const removeOrder = async (orderItemId) => {
        if (token) {
            try {
                const response = await axios.put(backendUrl + "/api/order/remove-order", { orderItemId }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    toast.success(response.data.message, { ...toastSuccess });

                } else {
                    toast.error(response.data.message, { ...toastError });
                }
            } catch (error) {
                console.log(error);
                toast.error(error.message, { ...toastError });
            }
        }
    };

    
    /*--------------------------ADD ORDER----------------------------*/
    const addCancelOrder = async (orderItemId, reasonForCancellation, cancelComments, cancelPaypalEmail, cancellationStatus, cancelledBy) => {
        if (token) {
            try {
                const payload = {
                    orderItemId,
                    reasonForCancellation, 
                    cancelComments, 
                    cancelPaypalEmail, 
                    cancellationStatus,
                    cancelledBy
                }
                const response = await axios.post(backendUrl + "/api/order/cancel-order/add", payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    toast.success(response.data.message, { ...toastSuccess });
                    setCancelOrder(false);

                } else {
                    toast.error(response.data.message, { ...toastError });
                }
            } catch (error) {
                console.log(error);
                toast.error(error.message, { ...toastError });
            }
        }
    };

    /*-----------------------CHECKOUT PROCESS-------------------------*/

    const [paymentMethod, setPaymentMethod] = useState('Cash On Delivery');
    const [orderItems, setOrderItems] = useState([]);

    const [orderSubTotal, getOrderSubTotal] = useState(0);
    
    const [shippingFee, getShippingFee] = useState(0);
    const [totalPrice, getTotalPrice] = useState(0);

    /*--------------------------FETCH ORDERS----------------------------*/
    const [fetchOrders, setFetchOrders] = useState([]);
    const [fetchOrderItems, setFetchOrderItems] = useState([]);
    const handleFetchOrders = async() => {
        try {
            const response = await axios.get(backendUrl + "/api/order/", {
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

    /*--------------------------FETCH CANCELLED ORDERS----------------------------*/
    const [fetchCancelledOrders, setFetchCancelledOrders] = useState([]);
    const handleFetchCancelledOrders = async() => {
        try {
            const response = await axios.get(backendUrl + "/api/order/cancel-order", {
                headers: {
                Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                // SET MO NALANG DITO YUNG MGA NEED NA DATA
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


    /*--------------------------ADD ORDER----------------------------*/
    const addOrder = async (paymentMethod, orderItems, cartItemsToDelete) => {
        if (token) {
            try {
                const response = await axios.post(backendUrl + "/api/order/add", {
                    paymentMethod,
                    orderItems,
                    cartItemsToDelete
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    toast.success(response.data.message, { ...toastSuccess });
                    setOrderItems([]);
                    getOrderSubTotal(0);
                    getTotalPrice(0);
                    return true;
                } else {
                    toast.error(response.data.message, { ...toastError });
                    return false;
                }
            } catch (error) {
                console.log(error);
                toast.error(error.message, { ...toastError });
                return false;
            }
        }
    };

    /*-----------------------FETCH DELIVERY INFO-------------------------*/
    const [poMedicalInstitutionName, setPoMedicalInstitutionName] = useState('');
    const [poEmailAddress, setPoEmailAddress] = useState('');
    const [poDetailedAddress, setPoDetailedAddress] = useState('');
    const [poZipCode, setPoZipCode] = useState('');
    const [poContactNumber, setPoContactNumber] = useState('');

    const handleFetchDeliveryInfo = async() => {
        try {
            const response = await axios.get(backendUrl + "/api/customer/profile/delivery-info", {
                headers: {
                Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setPoMedicalInstitutionName(response.data.user.medicalInstitutionName)
                setPoEmailAddress(response.data.user.emailAddress);
                setPoDetailedAddress(response.data.user.detailedAddress);
                setPoZipCode(response.data.user.zipCode);
                setPoContactNumber(response.data.user.contactNumber);

                // Use context states instead of local ones
                setSelectedProvince(response.data.user.provinceId);
                setSelectedCity(response.data.user.cityId);
                setSelectedBarangay(response.data.user.barangayId); 

                setHasDeliveryInfo(true);
            }
            else {
                setHasDeliveryInfo(false);
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


    /*-----------------------FETCH VERIFIED CUSTOMER-------------------------*/
    const fetchVerifiedCustomer = async() => {
        try {
            const response = await axios.get(backendUrl + "/api/customer/verified-customer", {
            headers: {
                Authorization: `Bearer ${token}`
            }
            });
            if (response.data.success) {
                setNbProfileImage(response.data.user.profileImage);
                setVerifiedUser(response.data.user.verifiedCustomer);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message, {...toastError});
        }
    }
    useEffect(() => {
        if (token) {
            fetchVerifiedCustomer();
        }
    }, [token]);

    /*---------------------------SIGN UP PROCESS-----------------------------*/
    const [signUpStep, setSignUpStep] = useState(1);
    const [signUpData, setSignUpData] = useState({
        // Step 1: Institution
        medicalInstitutionName: '',
        contactNumber: '',
        landlineNumber: '',
        emailAddress: '',
        fullAddress: '',
        proofType: '',
        imageProof: null,

        // Step 2: Representative
        repFirstName: '',
        repLastName: '',
        repContactNumber: '',
        repEmailAddress: '',
        repJobPosition: '',

        // Step 3: Account
        loginPhoneNum: '',
        loginEmail: '',
        loginPassword: '',

        // Step 4: Email Verification
        registerKey: '',
    });

    /*---------------------------FETCH PRODUCT CATEGORY-----------------------------*/
    const fetchProductCategory = async () => {
        try {
            const response = await axios.get(backendUrl + "/api/product/category");
            if (response.data.success) {
                setProductCategory(response.data.productCategory);
            } 
        } catch (error) {
            console.log(error);
            toast.error(error.message, {...toastError});
        }
    }
    useEffect(() => {
        fetchProductCategory();
    }, []);

    /*---------------------------FETCH ALL PRODUCTS-----------------------------*/
    const fetchAllProducts = async () => {
        try {
            const response = await axios.get(backendUrl + "/api/product/list");
            if (response.data.success) {
                setProducts(response.data.products);
            } 
        } catch (error) {
            console.log(error);
            toast.error(error.message, {...toastError});
        }
    }
    useEffect(() => {
        fetchAllProducts();
    }, []);

    /*---------------------------FETCH ALL PRODUCT VARIANT COMBINATIONS-----------------------------*/
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
        fetchProductVariantCombination();
    }, []);

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
        fetchProductVariantValues();
    }, []);

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
        fetchVariantName();
    }, []);

    /*---------------------------DATA LOCATIONS-----------------------------*/
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [barangays, setBarangays] = useState([]);

    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedBarangay, setSelectedBarangay] = useState("");

    const [filteredCities, setFilteredCities] = useState([]);
    const [filteredBarangays, setFilteredBarangays] = useState([]);

    const handleFetchLocation = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/customer/location`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            });

            if (response.data.success) {
                setProvinces(response.data.provinces || []);
                setCities(response.data.cities || []);
                setBarangays(response.data.barangays || []);
            } 
        } catch (error) {
            console.log(error);
            toast.error(error.message, { ...toastError });
        }
    };

    useEffect(() => {
        if (!selectedProvince) {
            setFilteredCities([]);
            setSelectedCity("");
            setFilteredBarangays([]);
            setSelectedBarangay("");
            return;
        }

        if (!cities || cities.length === 0) {
            return;
        }

        const newCities = cities.filter(city => city.provinceId === Number(selectedProvince));
        setFilteredCities(newCities);

        if (selectedCity && !newCities.some(c => c.ID === Number(selectedCity))) {
            setSelectedCity("");
            setFilteredBarangays([]);
            setSelectedBarangay("");
        }
    }, [selectedProvince, cities, selectedCity]);

    useEffect(() => {
        if (!selectedCity) {
            setFilteredBarangays([]);
            setSelectedBarangay("");
            return;
        }

        if (!barangays || barangays.length === 0) {
            return;
        }

        const newBarangays = barangays.filter(
            brgy =>
            brgy.cityId === Number(selectedCity) &&
            brgy.provinceId === Number(selectedProvince)
        );
        setFilteredBarangays(newBarangays);

        if (selectedBarangay && !newBarangays.some(b => b.ID === Number(selectedBarangay))) {
            setSelectedBarangay("");
        }
    }, [selectedCity, selectedProvince, barangays, selectedBarangay]);

    useEffect(() => {
    if (token) {
        handleFetchLocation();
    }
    }, [token]);
    /*-----------------------------------------TOAST--------------------------------------*/
    const toastSuccess = { 
        position: "top-center", autoClose: 3000, hideProgressBar: true, closeOnClick: false, pauseOnHover: false, draggable: true, progress: 0, theme: "light", transition: Bounce
    }
    const toastError = {
        position: "top-center", autoClose: 3000, hideProgressBar: true, closeOnClick: false, pauseOnHover: false, draggable: true, progress: 0, theme: "light", transition: Bounce
    }

    /*-------------------------------WISHLIST------------------------------*/
    const getUserWishlist = async () => {
        try {
            const response = await axios.get(backendUrl + "/api/wishlist/", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setWishListItems(response.data.wishlistItems);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message, {...toastError});
        } 
    }
    useEffect(() => {
        if (token) {
            getUserWishlist();
        }
    }, [token]);


    const addToWishlist = async (productId) => {
        // let wishlistData = structuredClone(wishlistItems);
        // wishlistData[productId] = true;
        // setWishListItems(wishlistData);
        // if (!wishlistItems.includes(productId)) {
        //     const newWishlist = [...wishlistItems, productId];
        //     setWishListItems(newWishlist);
        // }
        if (!wishlistItems.some(item => item.productId === productId)) {
            setWishListItems([...wishlistItems, { productId }]);
        }

        if (token) {
            try {
                const response = await axios.post(backendUrl + "/api/wishlist/add", { productId }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    toast.success(response.data.message, {...toastSuccess});
                } else {
                    toast.error(response.data.message, {...toastError});
                }
            } catch (error) {
                console.log(error);
                toast.error(error.message, {...toastError});
            } 
        }
    }

    const removeFromWishlist = async (productId) => {
        // let wishlistData = structuredClone(wishlistItems);
        // delete wishlistData[productId];
        // setWishListItems(wishlistData);
        // const newWishlist = wishlistItems.filter(id => id !== productId);
        // setWishListItems(newWishlist);

        setWishListItems(wishlistItems.filter(item => item.productId !== productId));
        
        if (token) {
            try {
                const response = await axios.delete(backendUrl + "/api/wishlist/delete", {
                    headers: { Authorization: `Bearer ${token}` },
                    data: { productId }
                });
                if (response.data.success) {
                    toast.success(response.data.message, {...toastSuccess});
                } else {
                    toast.error(response.data.message, {...toastError});
                }
            } catch (error) {
                console.log(error);
                toast.error(error.message, {...toastError});
            } 
        }
    };

    // const isInWishlist = (itemId) => {
    //     return wishlistItems[itemId] !== undefined;
    // };

    // const isInWishlist = (itemId) => {
    //     return wishlistItems.includes(itemId);
    // };

    const isInWishlist = (itemId) => {
        return wishlistItems.some(item => item.productId === itemId);
    };


    /*-------------------------------CART------------------------------*/
    const getUserCart = async () => {
        try {
            const response = await axios.get(backendUrl + "/api/cart", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setCartItems(response.data.cartItems);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message, {...toastError});
        } 
    }
    useEffect(() => {
        if (token) {
            getUserCart();
        }
    }, [token]);


    const addToCart = async (productId, value, quantity) => {
        if (token) {
            try {
                const payload = {
                    productId,
                    value,
                    quantity
                }
                const response = await axios.post(backendUrl + "/api/cart/add", payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    await getUserCart();
                    toast.success(response.data.message, {...toastSuccess});
                } else {
                    toast.error(response.data.message, {...toastError});
                }
            } catch (error) {
                console.log(error);
                toast.error(error.message, {...toastError});
            } 
        }

    };

    // UPDATE CART ITEM
    const updateQuantity = async (productId, value, quantity) => {
        if (token) {
            let cartData = cartItems.map((item) => {
                if (item.productId === productId && item.value === value) {
                    return { ...item, quantity };
                }
                return item;
            }).filter(item => item.quantity > 0);

            setCartItems(cartData);

            try {
                const payload = {
                    productId,
                    value,
                    quantity
                }
                const response = await axios.put(backendUrl + "/api/cart/update", payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    // toast.success(response.data.message, {...toastSuccess});
                } else {
                    toast.error(response.data.message, {...toastError});
                }
            } catch (error) {
                console.log(error);
                toast.error(error.message, {...toastError});
            } 
        }
    }

    const deleteCartItem = async (cartMainId) => {
        if (token) {
            setCartItems(prevCart => prevCart.filter(item => item.ID !== cartMainId));

            try {
                const response = await axios.delete(backendUrl + "/api/cart/delete", {
                    headers: { Authorization: `Bearer ${token}` },
                    data: { cartMainId }
                });
                if (response.data.success) {
                    toast.success(response.data.message, {...toastSuccess});
                } else {
                    toast.error(response.data.message, {...toastError});
                }
            } catch (error) {
                console.log(error);
                toast.error(error.message, {...toastError});
            } 
        }
    }

    const deleteMultipleCartItem = async (cartIds) => {
        if (token) {
            try {
                const response = await axios.delete(backendUrl + "/api/cart/delete-multiple", {
                    headers: { Authorization: `Bearer ${token}` },
                    data: { cartIds }
                });
                if (response.data.success) {
                    toast.success(response.data.message, {...toastSuccess});
                } else {
                    toast.error(response.data.message, {...toastError});
                }
            } catch (error) {
                console.log(error);
                toast.error(error.message, {...toastError});
        } 
        }
    }
    
    const getCartCount = () => {
        if (!Array.isArray(cartItems)) return 0;
        let totalCount = 0;
        for (const item of cartItems) {   
            totalCount += 1;
        }
        if (totalCount === 0) {
            setShowCartContent(false);    
        }
        return totalCount;
    };

    const getWishlistCount = () => {
        let totalCount = 0;
        for (const items in wishlistItems) {
            totalCount += 1;
        }
        if (totalCount === 0) {
            setShowWishlistContent(false);
        }
        return totalCount;
    };



    /*------------------------------------DEBUGGING--------------------------------------*/


    // useEffect(() => {
    //     console.log('Cart Items:', cartItems);
    //     console.log('Wishlist Items:', wishlistItems);
    //     console.log('Products:', products);

    //     // typeof gives "object" for arrays too
    //     console.log('Cart Items type:', typeof cartItems); 
    //     console.log('Wishlist Items type:', typeof wishlistItems);
    //     console.log('Products type:', typeof products);

    //     // Array.isArray() tells if it is an array
    //     console.log('Is Cart Items an array?', Array.isArray(cartItems)); // true if array
    //     console.log('Is Wishlist Items an array?', Array.isArray(wishlistItems));
    //     console.log('Is Products an array?', Array.isArray(products));

    //     // Count items depending on whether it's array or object
    //     const getItemCount = (data) => {
    //         if (Array.isArray(data)) return data.length;
    //         if (data && typeof data === 'object') return Object.keys(data).length;
    //         return 0;
    //     }

    //     console.log('Cart count:', getItemCount(cartItems));
    //     console.log('Wishlist count:', getItemCount(wishlistItems));
    //     console.log('Products count:', getItemCount(products));
    // }, [cartItems, wishlistItems, products]);

    
    
    /*------------------------------------TOKEN--------------------------------------*/

    // CUSTOMER TOKEN
    useEffect(() => {
        if (token) {
            localStorage.setItem('authToken', token);
            setWishListItems(wishlistItems)
            console.log(token);
        } else {
            localStorage.removeItem('authToken');
        }
    }, [token]);

    // LOGIN SESSION TOKEN
    useEffect(() => {
        if (loginToken) {
            localStorage.setItem('loginToken', loginToken);
            sessionStorage.setItem('loginIdentifier', loginIdentifier);
        } else {
            localStorage.removeItem('loginToken');
            sessionStorage.removeItem('loginIdentifier');
        }
    }, [loginToken]);

    // FORGOT PASSWORD SESSION TOKEN
    useEffect(() => {
        if (fpIdentifier) {
            sessionStorage.getItem('fpIdentifier');
        }
        else {
            sessionStorage.removeItem('fpIdentifier');
        }
        
    }, [fpIdentifier]);

    useEffect(() => {
        if (resetPasswordToken) {
            localStorage.setItem('resetPasswordToken', resetPasswordToken);
        } else {
            localStorage.removeItem('resetPasswordToken');
        }
    }, [resetPasswordToken]);



    // (SOCKET IO) - Add Order
    useEffect(() => {
        // When a new order is placed (for Admin/Staff dashboards)
        socket.on("newOrder", (data) => {
            console.log("📦 New Order Received:", data);
            setFetchOrders((prev) => [data.order, ...prev]);
            setFetchOrderItems((prev) => [...data.orderItems, ...prev]);
        });

        // For customer notifications only
        socket.on("newNotification_Customer", (notif) => {
            console.log("🔔 Customer Notification:", notif);
            setFetchNotifications((prev) => [notif, ...prev]);
        });

        socket.on("cartUpdated", (data) => {
            setCartItems(prev => 
                prev.map(item => {
                    // Only remove items that match the deleted IDs **and** customerId
                    if (item.customerId === data.customerId && data.deletedIds.includes(item.ID)) {
                        return null; // filter out later
                    }
                    return item;
                }).filter(Boolean)
            );
        });


        return () => {
            socket.off("newOrder");
            socket.off("newNotification_Customer");
            socket.off("cartUpdated");
        };
    }, []);

    // (SOCKET IO) - ADD CANCEL ORDER
    useEffect(() => {
        socket.on("addCancelOrder", (data) => {
            setFetchCancelledOrders((prev) => {
                const existingIndex = prev.findIndex(
                    (cancel) => cancel.orderItemId === data.orderItemId
                );

                const newCancel = {
                    ID: data.orderCancelId,
                    orderItemId: data.orderItemId,
                    customerId: data.customerId,
                    reasonForCancellation: data.reasonForCancellation,
                    cancelComments: data.cancelComments || '',
                    cancelPaypalEmail: data.cancelPaypalEmail || '',
                    cancellationStatus: data.cancellationStatus,
                    cancelledBy: data.cancelledBy,
                };

                if (existingIndex !== -1) {
                    // ✅ Update existing cancel record
                    const updated = [...prev];
                    updated[existingIndex] = newCancel;
                    return updated;
                } else {
                    // ✅ Add new cancel record
                    return [...prev, newCancel];
                }
            });

            // ✅ Update order item status
            setFetchOrderItems((prev) =>
                prev.map((item) =>
                    item.ID === data.orderItemId
                    ? { ...item, orderStatus: data.newStatus }
                    : item
                )
            );
        });

        return () => {
            socket.off("addCancelOrder");
        };
    }, []);

    // (SOCKET IO) - REMOVE ORDER
    useEffect(() => {
        socket.on("orderItemRemoved", (data) => {

            // update local state in real time:
            setFetchOrderItems(prev =>
                prev.filter(item => item.ID !== data.orderItemId)
            );
        });

        // cleanup when component unmounts
        return () => {
            socket.off("orderItemRemoved");
        };
    }, []);

    // (SOCKET IO) - CANCEL ORDER REQUEST
    useEffect(() => {
        socket.on("orderCancelledUpdate", (data) => {

            // ✅ Remove the canceled order from state immediately
            setFetchCancelledOrders((prev) =>
                prev.filter((cancel) => cancel.ID !== data.orderCancelId)
            );

            setFetchOrderItems(prev =>
                prev.map(item =>
                    item.ID === data.orderItemId
                    ? { ...item, orderStatus: data.newStatus }
                    : item
                )
            );
        });

        return () => {
            socket.off("orderCancelledUpdate");
        };
    }, []);

    // (SOCKET IO) - MARK REFUND RECEIVED
    useEffect(() => {
        socket.on("refundMarkedAsCompleted", (data) => {
            if (data.orderCancelId) {
                setFetchCancelledOrders((prev) =>
                    prev.map((cancel) =>
                    cancel.ID === data.orderCancelId
                        ? { ...cancel, cancellationStatus: data.cancellationStatus }
                        : cancel
                    )
                );
            }

            if (data.orderRefundId) {
                setFetchOrderRefund((prev) =>
                    prev.map((refund) =>
                    refund.ID === data.orderRefundId
                        ? { ...refund, refundStatus: data.refundStatus }
                        : refund
                    )
                );
            }
        });

        return () => {
            socket.off("refundMarkedAsCompleted");
        };
    }, []);

    // (SOCKET IO) - ADD ORDER REFUND
    useEffect(() => {
        socket.on("addOrderRefund", (data) => {
            // ✅ 1. Update fetchOrderRefund (add or update)
            setFetchOrderRefund((prev) => {
                const existingIndex = prev.findIndex(
                    (refund) => refund.orderItemId === data.orderItemId
                );

                const newRefund = {
                    ID: data.refundId,
                    orderItemId: data.orderItemId,
                    customerId: data.customerId,  
                    reasonForRefund: data.reasonForRefund,  
                    refundComments: data.refundComments || null, 
                    imageProof1: data.imageProof1,  
                    imageProof2: data.imageProof2, 
                    refundResolution: data.refundResolution,  
                    otherReason: data.otherReason || null,  
                    refundMethod: data.refundMethod || null,  
                    refundPaypalEmail: data.refundPaypalEmail || null,  
                    refundStatus: data.refundStatus,
                    dateRequest: data.dateRequest,  
                };

                if (existingIndex !== -1) {
                    const updated = [...prev];
                    updated[existingIndex] = newRefund;
                    return updated;
                } else {
                    return [...prev, newRefund];
                }
            });

            // ✅ 2. Update order item list to show “Return/Refund” status in real time
            setFetchOrderItems((prev) =>
                prev.map((item) =>
                    item.ID === data.orderItemId
                        ? { ...item, orderStatus: data.orderStatus }
                        : item
                )
            );
        });

        return () => {
            socket.off("addOrderRefund");
        };
    }, []);

    // (SOCKET IO) - CANCEL ORDER REFUND
    useEffect(() => {
        socket.on("cancelOrderRefundRequest", (data) => {
            // ✅ Remove the canceled order from state immediately
            setFetchOrderRefund((prev) =>
                prev.filter((refund) => refund.ID !== data.orderRefundId)
            );

            setFetchOrderItems(prev =>
                prev.map(item =>
                    item.ID === data.orderItemId
                    ? { ...item, orderStatus: data.orderStatus }
                    : item
                )
            );
        });

        return () => {
            socket.off("cancelOrderRefundRequest");
        };
    }, []);

    // ✅ SOCKET.IO - NOTIFICATION DELETION
    useEffect(() => {
        socket.on("notificationDeleted", (data) => {
            setFetchNotifications((prev) =>
                prev.filter((notif) => notif.ID !== data.notificationID)
            );
        });

        // Cleanup when unmount
        return () => {
            socket.off("notificationDeleted");
        };
    }, []);


    // ✅ SOCKET.IO - READ NOTIFICATION
    useEffect(() => {
        socket.on("notificationRead", (data) => {
            setFetchNotifications((prev) =>
                prev.map((notif) => ({
                    ...notif,
                    isRead: data.isRead,
                }))
            );
        });

        // Cleanup when unmount
        return () => {
            socket.off("notificationRead");
        };
    }, []);

    





    /*----------------------------VALUE ACCESS-----------------------------*/
    const value = {
        products, setProducts, productVariantValues, setProductVariantValues, variantName, setVariantName, currency, search, setSearch, showSearch, setShowSearch, cartItems, addToCart, getCartCount, updateQuantity, showCartContent, setShowCartContent, setCartItems, orderSubTotal, getOrderSubTotal, navigate, totalPrice, getTotalPrice, toastSuccess, toastError, wishlistItems, setWishListItems, addToWishlist, removeFromWishlist, isInWishlist, backendUrl, token, setToken, getWishlistCount, showWishlistContent, signUpStep, setSignUpStep, signUpData, setSignUpData, loginToken, setLoginToken, loginIdentifier, setLoginIdentifier, fpIdentifier, setFpIdentifier, resetPasswordToken, setResetPasswordToken, provinces, filteredCities, filteredBarangays, selectedProvince, setSelectedProvince, selectedCity, setSelectedCity, selectedBarangay, setSelectedBarangay, productCategory, setProductCategory, deleteCartItem, deleteMultipleCartItem, verifiedUser, setVerifiedUser, showImportantNote, setShowImportantNote, showUnavailableNote, setShowUnavailableNote, activeStep, setActiveStep, hasDeliveryInfo, setHasDeliveryInfo, poMedicalInstitutionName, setPoMedicalInstitutionName, poEmailAddress, setPoEmailAddress, poDetailedAddress, setPoDetailedAddress, poZipCode, setPoZipCode, poContactNumber, setPoContactNumber, paymentMethod, setPaymentMethod, shippingFee, getShippingFee, nbProfileImage, setNbProfileImage, handleFetchDeliveryInfo, fetchVerifiedCustomer, productVariantCombination, setProductVariantCombination, orderItems, setOrderItems, addOrder, fetchOrders, fetchOrderItems, paymentUsed, setPaymentUsed, orderItemId, setOrderItemId, reasonForCancellation, setReasonForCancellation, cancelComments, setCancelComments, cancelPaypalEmail, setCancelPaypalEmail,cancelledBy, setCancelledBy, cancelOrder, setCancelOrder, addCancelOrder, cancellationStatus, setCancellationStatus, fetchCancelledOrders, removeOrder, cancelOrderRequest, markRefundReceived, viewRefundReceipt, setViewRefundReceipt, fetchRefundProof, refundOrder, setRefundOrder, reasonForRefund, setReasonForRefund, refundComments, setRefundComments,imageProof1, setImageProof1, imageProof2, setImageProof2, refundResolution, setRefundResolution,refundMethod, setRefundMethod, refundPaypalEmail, setRefundPaypalEmail, refundStatus, setRefundStatus, otherReason, setOtherReason, addOrderRefund, fetchOrderRefund, setFetchOrderRefund, cancelOrderRefundRequest, showRejectedRefund, setShowRejectedRefund, fetchNotifications, setFetchNotifications, cartItemsToDelete, setCartItemsToDelete, deleteNotification, readNotification
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;