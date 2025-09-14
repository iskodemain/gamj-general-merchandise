import { createContext, useEffect, useState } from "react";
// import { products } from "../assets/assets.js";
import axios from "axios"
import { TbCurrencyPeso } from "react-icons/tb";
import './ShopContext.css'
import { Bounce, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
export const ShopContext = createContext();
const ShopContextProvider = (props) => {
    const currency = <TbCurrencyPeso className="peso-sign"/>; 
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    
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
    const [productCategory, setProductCategory] = useState([]);
    const [activeStep, setActiveStep] = useState(1); 
    const [hasDeliveryInfo, setHasDeliveryInfo] = useState(false);
    const [nbProfileImage, setNbProfileImage] = useState(null);
    const navigate = useNavigate();

    /*-----------------------CHECKOUT PROCESS-------------------------*/
    const [subtotal, getSubtotal] = useState(0);
    const [totalPrice, getTotalPrice] = useState(0);
    const [shippingFee, getShippingFee] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('Cash On Delivery');
    const [productIds, setProductIds] = useState([]);
    const [values, setValues] = useState([]);
    const [quantities, setQuantities] = useState([]);



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
            } else {
                toast.error(response.data.message, {...toastError});
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
            } else {
                toast.error(response.data.message, {...toastError});
            }
            
        } catch (error) {
            console.log(error);
            toast.error(error.message, {...toastError});
        }
    }
    useEffect(() => {
        fetchAllProducts();
    }, []);

    /*---------------------------FETCH ALL PRODUCT VARIANT VALUES-----------------------------*/
    const fetchProductVariantValues = async () => {
        try {
            const response = await axios.get(backendUrl + "/api/product/product-variant-values");
            if (response.data.success) {
                setProductVariantValues(response.data.productVariantValues);
            } else {
                toast.error(response.data.message, { ...toastError });
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
            } else {
                toast.error(response.data.message, { ...toastError });
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
            } else {
            toast.error(response.data.message, { ...toastError });
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
            } else {
                toast.error(response.data.message, {...toastError});
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

    const removeFromWishlist = async (productId) => {
        // let wishlistData = structuredClone(wishlistItems);
        // delete wishlistData[productId];
        // setWishListItems(wishlistData);
        // const newWishlist = wishlistItems.filter(id => id !== productId);
        // setWishListItems(newWishlist);

        setWishListItems(wishlistItems.filter(item => item.productId !== productId));
        
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
            } else {
                // console.error(response.data.message, {...toastError});
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

        try {
            let payload = {
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

    };

    const updateQuantity = async (productId, value, quantity) => {
        let cartData = cartItems.map((item) => {
            if (item.productId === productId && JSON.stringify(item.value) === JSON.stringify(value)) {
                return { ...item, quantity };
            }
            return item;
        }).filter(item => item.quantity > 0);

        setCartItems(cartData);

        try {
            let payload = {
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

    const deleteCartItem = async (cartMainId) => {
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

    const deleteMultipleCartItem = async (cartIds) => {
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

    /*----------------------------VALUE ACCESS-----------------------------*/
    const value = {
        products, setProducts, productVariantValues, setProductVariantValues, variantName, setVariantName, currency, search, setSearch, showSearch, setShowSearch, cartItems, addToCart, getCartCount, updateQuantity, showCartContent, setShowCartContent, setCartItems, subtotal, getSubtotal, navigate, totalPrice, getTotalPrice, toastSuccess, toastError, wishlistItems, setWishListItems, addToWishlist, removeFromWishlist, isInWishlist, backendUrl, token, setToken, getWishlistCount, showWishlistContent, signUpStep, setSignUpStep, signUpData, setSignUpData, loginToken, setLoginToken, loginIdentifier, setLoginIdentifier, fpIdentifier, setFpIdentifier, resetPasswordToken, setResetPasswordToken, provinces, filteredCities, filteredBarangays, selectedProvince, setSelectedProvince, selectedCity, setSelectedCity, selectedBarangay, setSelectedBarangay, productCategory, setProductCategory, deleteCartItem, deleteMultipleCartItem, verifiedUser, setVerifiedUser, showImportantNote, setShowImportantNote, showUnavailableNote, setShowUnavailableNote, activeStep, setActiveStep, hasDeliveryInfo, setHasDeliveryInfo, poMedicalInstitutionName, setPoMedicalInstitutionName, poEmailAddress, setPoEmailAddress, poDetailedAddress, setPoDetailedAddress, poZipCode, setPoZipCode, poContactNumber, setPoContactNumber, paymentMethod, setPaymentMethod, shippingFee, getShippingFee, nbProfileImage, setNbProfileImage, handleFetchDeliveryInfo, fetchVerifiedCustomer
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;