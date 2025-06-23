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
    const backendUrl = import.meta.env.VITE_BACKEND_URL_2

    /*--------------------------------------USESTATE--------------------------------------*/
    const [search, setSearch] = useState('')
    const [showSearch, setShowSearch] = useState(false)
    const [cartItems, setCartItems] = useState({});
    const [wishlistItems, setWishListItems] = useState({});
    const [showWishlistContent, setShowWishlistContent] = useState(false);
    const [showCartContent, setShowCartContent] = useState(false);
    const [totalProductPrice, getTotalProductPrice] = useState(0);
    const [overallPrice, getOverAllPrice] = useState(0);
    // const [products, setProducts] = useState([])
    const [token, setToken] = useState('');
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState([]);
    const [emailVerification, setEmailVerification] = useState(''); // GETTER OF SESSION
    const [code, setCode] = useState(''); // GETTER OF SESSION
    const [isLoading, setIsLoading] = useState(true);
    const [emailAccountCreate, setEmailAccountCreate] = useState('');

    /*--------------------------------FORGOT PASSWORD SESSION------------------------------*/
    useEffect(() => {
        const storedEmail = sessionStorage.getItem('emailVerification');
        const storedCode = sessionStorage.getItem('code');
        if (storedEmail) {
            setEmailVerification(storedEmail); 
        }
        if (storedCode) {
            setCode(storedCode); 
        }
        setIsLoading(false);
    }, []);



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
        let totalCount = 0;
        for (const items in cartItems) {
            for (const size in cartItems[items]) {
                totalCount += 1;
            }
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

    useEffect(()=> {
        
    }, [])
    useEffect(()=> {
        // if (!token && localStorage.getItem('token')) {
        //     setToken(localStorage.getItem('token'));
        //     getUserWishlist(localStorage.getItem('token'));
        //     getUserCart(localStorage.getItem('token'));
        // }
    }, [])

    /*------------------------------------VALUE ACCESS--------------------------------------*/
    const value = {
        products, currency, delivery_fee, search, setSearch, showSearch, setShowSearch, cartItems, addToCart, getCartCount, updateQuantity, showCartContent, setShowCartContent, setCartItems, totalProductPrice, getTotalProductPrice, navigate, overallPrice, getOverAllPrice, toastSuccess, toastError, wishlistItems, setWishListItems, addToWishlist, removeFromWishlist, isInWishlist, backendUrl, token, setToken, orderData, setOrderData, emailVerification, setEmailVerification, code, setCode, isLoading, setIsLoading, emailAccountCreate, setEmailAccountCreate, getWishlistCount, showWishlistContent
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;