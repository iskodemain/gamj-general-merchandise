import React, {useContext, useState, useEffect} from 'react'
import { ShopContext } from '../context/ShopContext';
import MainTitle from '../components/MainTitle.jsx';
import { FiMinus } from "react-icons/fi";
import { FiPlus } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import './Cart.css';
import OurPolicy from '../components/OurPolicy.jsx';
import Infos from '../components/Infos.jsx';
import Footer from '../components/Footer.jsx';
import { NavLink } from 'react-router-dom';
import { toast } from "react-toastify";

function Cart() {
  const {products, currency, cartItems, setCartItems, updateQuantity, showCartContent, setShowCartContent, totalProductPrice, getTotalProductPrice, navigate, token, toastError, orderData, setOrderData} = useContext(ShopContext)
  const [cartData, setCartData] = useState([]);

  console.log(totalProductPrice);

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      for (const items in cartItems) {
        for(const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item, 
              quantity: cartItems[items][item],
            })
            setShowCartContent(true);
          }
          else {
            setShowCartContent(false);
          }
        }
      }
      setCartData(tempData);
    }
  }, [cartItems, products])

  useEffect(() => {
    // CALCULATE TOTAL PRICE
    let price = 0;
    cartData.forEach(item => {
        const productData = products.find(product => product._id === item._id);
        price += productData.price * item.quantity;
    });
    getTotalProductPrice(price);
  }, [cartData, products]);


  // MINIMUM BUTTON
  const handleDecrease = (itemId, size, currentQuantity) => {
    if (currentQuantity > 1) {
      updateQuantity(itemId, size, currentQuantity - 1);
    }
  };

  // MAXIMUM BUTTON
  const handleIncrease = (itemId, size, currentQuantity, maxStock) => {
    if (currentQuantity < maxStock) {
      updateQuantity(itemId, size, currentQuantity + 1);
    }
  };

  

  const hadleCheckout = async () => {
    //----------BACKEND-----------
    // if (token) {
    //   navigate('/place-order')
    // }
    // else {
    //   toast.error("You must log in to proceed with the checkout.", {...toastError});
    //   navigate('/login');
    // }

    let newOrders = [];

    for (const productId in cartItems) {
      const sizeQuantityObj = cartItems[productId];

      for (const size in sizeQuantityObj) {
        const quantity = sizeQuantityObj[size];

        // Find the product using its _id
        const product = products.find(p => p._id === productId);
        if (!product) continue;

        const orderItem = {
          order_id: Math.random().toString(36).substring(2, 10), // Random ID
          product_id: product._id,
          product_name: product.name,
          price: product.price,
          size: size,
          quantity: quantity,
          status: 'Pending',
          payment: 'Unpaid',
          payment_method: 'COD',
          order_date: new Date().toISOString(),
          images: product.image, // already an array
          category: product.category
        };
        newOrders.push(orderItem);
      }
    }
    // Add to orderData context
    setOrderData(prev => [...newOrders, ...prev]);
    navigate('/place-order')
  }

  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <div className='pt-14'>
        <div className='text-2xl'>
          <MainTitle mtext1={'YOUR'} mtext2={'CART'}/>
        </div>
        {/* EMPTY CART */}
        {!showCartContent && (
          <div className='empty-cart-message'>
            <p>No items in your cart.</p>
          </div>
        )}
        {/* ACTIVE CART */}
        {showCartContent && (
          <>
            <div>
              {
                cartData.map((item, index) => {
                  const productData = products.find((product) => product._id === item._id);
                  if (!productData?.active) {
                    updateQuantity(item._id, item.size, 0);
                  }
                  return (
                    <div key={index} className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.1fr] sm:grid-cols-[4fr_0.1fr] gap-4 mb-2'>
                      <div className='flex items-start gap-6'>
                          <NavLink className='cursor-pointer' to={`/product/${item._id}`}>
                            <img className='cart-product-img' src={productData.image?.[0] || 'default-image.jpg'} alt={productData?.name || 'Product Image' }/>
                          </NavLink>
                          <div>
                            <p className='text-xs sm:text-base font-medium'>{productData.name}</p>
                            <div className='flex items-center gap-2'>
                              <p className='text-xs sm:text-sm font-light'>Size: {item.size}</p>
                            </div>
                            <div className='qd-container'>
                              <div className="quantity-controls-cart">
                                <button onClick={() => handleDecrease(item._id, item.size, item.quantity)} className="quantity-btn-cart"><FiMinus className='minus-cart'/></button>
                                <input
                                  onChange={(e) => {
                                    const value = Number(e.target.value);
                                    if (isNaN(value) || value <= 0) return;
                                    if (value > productData.stocks) {
                                      updateQuantity(item._id, item.size, productData.stocks);
                                    } else {
                                      updateQuantity(item._id, item.size, value);
                                    }
                                  }}
                                  type="number"
                                  value={item.quantity}
                                  className="quantity-input-cart"
                                  min={1}
                                  max={productData.stocks}
                                />

                                <button onClick={() => handleIncrease(item._id, item.size, item.quantity, productData.stocks)} className="quantity-btn-cart"><FiPlus className='plus-cart'/></button>
                              </div>
                              <RiDeleteBinLine onClick={() => updateQuantity(item._id, item.size, 0)} className='cart-delete'/>
                            </div>
                          </div>
                      </div>
                      <div className='cart-right-functions'>
                        <p className='cart-price'>Price: {currency}{productData.price}</p>
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </>
        )}
        <div className={`${showCartContent ? 'checkout-container' : 'hidden'}`}>
          <p className='checkout-total-price'>Total Price: {currency}{totalProductPrice.toFixed(2)}</p>
          <div className='checkout-buttons'>
            <button onClick={()=> hadleCheckout()} className='cart-button-checkout'>CHECKOUT</button>  
          </div>   
        </div>
      </div>
      <OurPolicy/>
      <Infos/>
      <Footer/>
    </div>
  )
}

export default Cart
