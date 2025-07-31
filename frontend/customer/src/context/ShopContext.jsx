import { createContext, useEffect, useState } from "react";
import { products } from "../assets/assets.js";
import axios from "axios"
import { TbCurrencyPeso } from "react-icons/tb";
import './ShopContext.css'
import { Bounce, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
export const ShopContext = createContext();
const ShopContextProvider = (props) => {
    const currency = <TbCurrencyPeso className="peso-sign"/>; 
    const delivery_fee = 38;
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    
    /*--------------------------USE STATE--------------------------*/
    const [token, setToken] = useState(() => localStorage.getItem('authToken') || '');
    const [loginToken, setLoginToken] = useState(() => localStorage.getItem('loginToken') || '');
    const [resetPasswordToken, setResetPasswordToken] = useState(() => localStorage.getItem('resetPasswordToken') || '');
    const [loginIdentifier, setLoginIdentifier] = useState(() => sessionStorage.getItem('loginIdentifier') || '');
    const [fpIdentifier, setFpIdentifier] = useState(() => sessionStorage.getItem('fpIdentifier') || '');
    const [search, setSearch] = useState('')
    const [showSearch, setShowSearch] = useState(false)
    const [cartItems, setCartItems] = useState({});
    const [wishlistItems, setWishListItems] = useState({});
    const [showWishlistContent, setShowWishlistContent] = useState(false);
    const [showCartContent, setShowCartContent] = useState(false);
    const [totalProductPrice, getTotalProductPrice] = useState(0);
    const [overallPrice, getOverAllPrice] = useState(0);
    // const [products, setProducts] = useState([])
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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

    /*-----------------------------------------TOAST--------------------------------------*/
    const toastSuccess = { 
        position: "top-center", autoClose: 3000, hideProgressBar: true, closeOnClick: false, pauseOnHover: false, draggable: true, progress: 0, theme: "light", transition: Bounce
    }
    const toastError = {
        position: "top-center", autoClose: 3000, hideProgressBar: true, closeOnClick: false, pauseOnHover: false, draggable: true, progress: 0, theme: "light", transition: Bounce
    }

    /*-------------------------------WISHLIST------------------------------*/
    const addToWishlist = async (itemId) => {
        let wishlistData = structuredClone(wishlistItems);
        wishlistData[itemId] = true;
        setWishListItems(wishlistData);
        // if (token) {
        //     try {
        //         await axios.post(backendUrl + '/api/wishlist/add', {itemId}, {headers: {token}})
        //     } catch (error) {
        //         console.log(error);
        //         toast.error(error.message, {...toastError});
        //     }
        // }
    }

    const removeFromWishlist = async (itemId) => {
        let wishlistData = structuredClone(wishlistItems);
        delete wishlistData[itemId];
        setWishListItems(wishlistData);
        // if (token) {
        //     try {
        //         await axios.post(backendUrl + '/api/wishlist/remove', {itemId}, {headers: {token}})
        //     } catch (error) {
        //         console.log(error);
        //         toast.error(error.message, {...toastError});
        //     }
        // }
    };

    const isInWishlist = (itemId) => {
        return wishlistItems[itemId] !== undefined;
    };


    /*-------------------------------CART------------------------------*/
    const addToCart = async (itemId, size, quantity) => {

        const product = products.find(p => p.productId === itemId);
        
        if (product.sizes && product.sizes.length > 0 && !size) {
            toast.error('No size selected for this product.', { ...toastError });
            return;
        }


        let cartData = structuredClone(cartItems);
        
        // Check if the item already exists in the cart
        if (cartData[itemId] && cartData[itemId][size]) {
            cartData[itemId][size] += quantity;
        } else {
            if (!cartData[itemId]) {
                cartData[itemId] = {};
            }
            cartData[itemId][size] = quantity;
        }
        setCartItems(cartData);
        toast.success('Added to cart successfully!', {...toastSuccess});

        // if (token) {
        //     try {
        //         await axios.post(backendUrl + '/api/cart/add', {itemId, size, quantity}, {headers: {token}})
        //     } catch (error) {
        //         console.log(error);
        //         toast.error(error.message, {...toastError});
        //     }
        // }

    };
    
    const getCartCount = () => {
        let count = 0;
        for (const productId in cartItems) {
            for (const size in cartItems[productId]) {
                const qty = cartItems[productId][size];
                if (qty > 0) {
                    count += 1; // Count each unique productId+size pair
                }
            }
         }
        return count;
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

    

    const updateQuantity = async (itemId, size, quantity) => {
        let cartData = structuredClone(cartItems);
        if (quantity === 0) {
            delete cartData[itemId][size];
            if (Object.keys(cartData[itemId]).length === 0) {
                delete cartData[itemId];
            }
        }
        else {
            cartData[itemId][size] = quantity;
        }
        setCartItems(cartData);

        // if (token) {
        //     try {
        //         await axios.post(backendUrl + '/api/cart/update', {itemId, size, quantity}, {headers: {token}})
        //     } catch (error) {
        //         console.log(error);
        //         toast.error(error.message, {...toastError});
        //     }
        // }
    }
    
    /*------------------------------------BACKEND URL--------------------------------------*/
    

    const getUserCart = async (token) => {
        try {
            const response = await axios.post(backendUrl + '/api/cart/get', {}, {headers: {token}})
            if (response.data.success) {
                setCartItems(response.data.cartData)
            }

        } catch (error) {
            console.log(error);
            toast.error(error.message, {...toastError});
        }
    }

    const getUserWishlist = async (token) => {
        try {
            const response = await axios.post(backendUrl + '/api/wishlist/get', {}, {headers: {token}})
            if (response.data.success) {
                setWishListItems(response.data.wishlistData)
            }

        } catch (error) {
            console.log(error);
            toast.error(error.message, {...toastError});
        }
    }

    // useEffect(()=> {
    //     if (!token && localStorage.getItem('authToken')) {
    //         setToken(localStorage.getItem('authToken'));
    //         getUserWishlist(localStorage.getItem('authToken'));
    //         getUserCart(localStorage.getItem('authToken'));
    //     }
    // }, [])

    // CUSTOMER TOKEN
    useEffect(() => {
        if (token) {
            localStorage.setItem('authToken', token);
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
        products, currency, delivery_fee, search, setSearch, showSearch, setShowSearch, cartItems, addToCart, getCartCount, updateQuantity, showCartContent, setShowCartContent, setCartItems, totalProductPrice, getTotalProductPrice, navigate, overallPrice, getOverAllPrice, toastSuccess, toastError, wishlistItems, setWishListItems, addToWishlist, removeFromWishlist, isInWishlist, backendUrl, token, setToken, orderData, setOrderData, isLoading, setIsLoading, getWishlistCount, showWishlistContent, signUpStep, setSignUpStep, signUpData, setSignUpData, loginToken, setLoginToken, loginIdentifier, setLoginIdentifier, fpIdentifier, setFpIdentifier, resetPasswordToken, setResetPasswordToken
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;