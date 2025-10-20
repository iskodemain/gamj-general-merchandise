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
import UnavailableNote from '../components/Notice/UnavailableNote.jsx';

function Cart() {
  const {products, currency, cartItems, setCartItems, updateQuantity, showCartContent, setShowCartContent, orderSubTotal, getOrderSubTotal, navigate, token, toastError, deleteCartItem, deleteMultipleCartItem, productVariantValues, productVariantCombination, showUnavailableNote, setShowUnavailableNote, verifiedUser, hasDeliveryInfo, setActiveStep, setOrderItems} = useContext(ShopContext)
  const [cartData, setCartData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const allSelected = selectedItems.length === cartData.length && cartData.length > 0;

  useEffect(() => {
    if (!products.length || !cartItems.length) return;

    const updatedCart = cartItems.filter(item => {
      const productData = products.find(p => p.ID === item.productId);
      if (!productData) {
        toast.warning(`"${productData.productName}" is no longer available.`, { ...toastError });
        deleteCartItem(item.ID);
        return false; // Product removed
      }

      // Case 1: product has variants but no combinations
      if (productData.hasVariant && !productData.hasVariantCombination) {
        const exists = productVariantValues.some(
          pv => pv.productId === item.productId && pv.value === item.value
        );
        if (!exists) {
          toast.warning(`"${productData.productName}" (${item.value}) is no longer available.`, { ...toastError });
          deleteCartItem(item.ID); // Delete from DB
          return false; // Remove from frontend
        }
      }

      // Case 2: product has variant combinations
      if (productData.hasVariant && productData.hasVariantCombination) {
        const exists = productVariantCombination.some(
          pvc => pvc.productId === item.productId && pvc.combinations === item.value
        );
        if (!exists) {
          toast.warning(`"${productData.productName}" (${item.value}) combination is no longer available.`, { ...toastError });
          deleteCartItem(item.ID); // Delete from DB
          return false;
        }
      }

      return true;
    });

    if (updatedCart.length !== cartItems.length) {
      setCartItems(updatedCart);
      setShowCartContent(updatedCart.length > 0);
    }
  }, [cartItems, products, productVariantValues, productVariantCombination]);

  useEffect(() => {
    if (!products.length) {
      setShowCartContent(false);
      return;
    }

    const validCart = cartItems.filter(item => {
      const productData = products.find(p => p.ID === item.productId);
      if (!productData) {
        return false; // Product not found
      }
      if (!productData.isActive || productData.isOutOfStock) {
        return false;
      }
      return item.quantity > 0;
    });

    setCartData(validCart);
    setShowCartContent(validCart.length > 0);
  }, [cartItems, products]);

  useEffect(() => {
    let total = 0;

    selectedItems.forEach(cartMainId => {
      const item = cartData.find(i => i.ID === cartMainId);
      if (!item) return;

      const productData = products.find(p => p.ID === item.productId);
      if (!productData) return;

      // Use the same logic as your getItemPrice function
      let itemPrice = productData.price;

      if (productData.hasVariant && productData.hasVariantCombination) {
        const combo = productVariantCombination.find(
          pvc => pvc.productId === item.productId && pvc.combinations === item.value
        );
        if (combo) itemPrice = combo.price;
      } else if (productData.hasVariant && !productData.hasVariantCombination) {
        const variant = productVariantValues.find(
          pv => pv.productId === item.productId && pv.value === item.value
        );
        if (variant) itemPrice = variant.price;
      }

      total += itemPrice * item.quantity;
    });

    getOrderSubTotal(total);
  }, [selectedItems, cartData, products, productVariantValues, productVariantCombination]);


  // TOTAL STOCKS
  const getTotalStockForValue = (productId, value, source) => {
    const match = source.find((src) => {
      const srcValue = src.value || src.combinations || "";
      return src.productId === productId && srcValue === value;
    });
    return match ? match.stock : 0;
  };


  // MINIMUM BUTTON
  const handleDecrease = (productId, value, quantity) => {
    if (quantity > 1) {
      updateQuantity(productId, value, quantity - 1);
    }
  };

  // MAXIMUM BUTTON
  const handleIncrease = (productId, value, quantity, productData) => {
    const maxStock = productData.hasVariant && productData.hasVariantCombination ? getTotalStockForValue(productId, value, productVariantCombination) : productData.hasVariant && !productData.hasVariantCombination ? getTotalStockForValue(productId, value, productVariantValues) : productData.stockQuantity

    if (maxStock && quantity < maxStock) {
      updateQuantity(productId, value, quantity + 1);
    }
  };


  // Select/Deselect all
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartData.map(item => item.ID));
    }
  };

  // Select single item
  const handleSelectItem = (cartIds) => {
    setSelectedItems(prev =>
      prev.includes(cartIds) ? prev.filter(i => i !== cartIds) : [...prev, cartIds]
    );
  };


  // Delete selected items
  const handleDeleteSelected = () => {
    const updatedCartItems = cartItems.filter((item) => !selectedItems.includes(item.ID));
    setCartItems(updatedCartItems);
    setSelectedItems([]);
    setShowCartContent(updatedCartItems.length > 0);
    deleteMultipleCartItem(selectedItems);
  };

  
  const handleDeleteSingle = (cartMainId) => {
    const updatedCartItems = cartItems.filter((item) => !(item.ID === cartMainId));
    setCartItems(updatedCartItems);
    setShowCartContent(updatedCartItems.length > 0);
    deleteCartItem(cartMainId);
  };

  const getItemPrice = (productData, item) => {
    if (productData.hasVariant && productData.hasVariantCombination) {
      const combo = productVariantCombination.find(
        pvc => pvc.productId === item.productId && pvc.combinations === item.value
      );
      return combo ? combo.price : productData.price;
    }
    if (productData.hasVariant && !productData.hasVariantCombination) {
      const variant = productVariantValues.find(
        pv => pv.productId === item.productId && pv.value === item.value
      );
      return variant ? variant.price : productData.price;
    }
    return productData.price;
  };


  const handleCheckout  = async () => {
    if (!token) {
      navigate('/login');
      toast.error("You must log in to proceed with the checkout.", {...toastError});
      return;
    }

    if (verifiedUser === false) {
      setShowUnavailableNote(true);
      return;
    }

    if (!hasDeliveryInfo) {
      setActiveStep(2);
      navigate('/profile');
      toast.error("Add delivery information to proceed with checkout.", {...toastError});
      return;
    }

    // ✅ Build orderItems based on selected items in the cart
    const builtOrderItems = selectedItems.map(cartMainId => {
      const item = cartData.find(i => i.ID === cartMainId);
      if (!item) return null;

      const productData = products.find(p => p.ID === item.productId);
      if (!productData) return null;

      const itemPrice = getItemPrice(productData, item);
      const subTotal = itemPrice * item.quantity;

      // Initialize variant IDs as null (if product doesn't have them)
      let productVariantValueId = null;
      let productVariantCombinationId = null;

      // Assign the correct IDs if variants exist
      if (productData.hasVariant && !productData.hasVariantCombination) {
        const variant = productVariantValues.find(
          pv => pv.productId === item.productId && pv.value === item.value
        );
        if (variant) productVariantValueId = variant.ID;
      }

      if (productData.hasVariant && productData.hasVariantCombination) {
        const combo = productVariantCombination.find(
          pvc => pvc.productId === item.productId && pvc.combinations === item.value
        );
        if (combo) productVariantCombinationId = combo.ID;
      }

      return {
        productId: item.productId,
        productVariantValueId,
        productVariantCombinationId,
        value: item.value || null,
        quantity: item.quantity,
        subTotal: parseFloat(subTotal.toFixed(2))
      };
    })

    // ✅ Save to state (you said orderItems is managed in context)
    setOrderItems(builtOrderItems);

    // Optional: log for verification
    console.log("✅ Order Items Built:", builtOrderItems);

    navigate('/place-order');
  }

  return (
    <div className='main-cart'>
      {showUnavailableNote && <UnavailableNote />}
      <div className='main-semi'>
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
            <div className="cart-header-actions">
              <label className="cart-select-all">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                />All ({cartData.length})
              </label>
            </div>
            <div>
              {
                cartData.map((item, index) => {
                  const productData = products.find((product) => product.ID === item.productId);
                  return (
                    <div key={index} className='cart-container'>
                      <div className='cc-2'>
                        <NavLink className='cursor-pointer' to={`/product/${productData.productId}`}>
                          <img className='cart-product-img' src={productData.images?.[0] || 'default-image.jpg'} alt={productData?.productName || 'Product Image'}/>
                        </NavLink>
                        <div>
                          <p className='cart-name'>{productData.productName}</p>
                          <div className='cc-size'>
                            {productData.hasVariant && 
                              <p> 
                                {item.value || ''}
                              </p>
                            }
                          
                          </div>
                          <div className='qd-container'>
                            <div className="quantity-controls-cart">
                              <button onClick={() => handleDecrease(item.productId, item.value, item.quantity)} className="quantity-btn-cart"><FiMinus className='minus-cart'/></button>
                              <input
                                onChange={(e) => {
                                  const value = Number(e.target.value);
                                  if (isNaN(value) || value <= 0) return;

                                  const maxStock = productData.hasVariant && productData.hasVariantCombination ? getTotalStockForValue(item.productId, item.value, productVariantCombination) : productData.hasVariant && !productData.hasVariantCombination ? getTotalStockForValue(item.productId, item.value, productVariantValues) : productData.stockQuantity;

                                  if (value > maxStock) {
                                    updateQuantity(item.productId, item.value, maxStock);
                                  } else {
                                    updateQuantity(item.productId, item.value, value);
                                  }
                                }}
                                type="number"
                                value={item.quantity}
                                className="quantity-input-cart"
                                min={1}
                                max={productData.hasVariant && productData.hasVariantCombination ? getTotalStockForValue(item.productId, item.value, productVariantCombination) : productData.hasVariant && !productData.hasVariantCombination ? getTotalStockForValue(item.productId, item.value, productVariantValues) : productData.stockQuantity}
                              />
                              <button onClick={() => handleIncrease(item.productId, item.value, item.quantity, productData)} className="quantity-btn-cart"><FiPlus className='plus-cart'/></button>
                            </div>
                            <RiDeleteBinLine onClick={() => handleDeleteSingle(item.ID)} className='cart-delete'/>
                          </div>
                        </div>
                      </div>
                      <div className='cart-right-functions'>
                        <div className="cart-item-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.ID)}
                            onChange={() => handleSelectItem(item.ID)}
                          />
                        </div>
                        <p className='cart-price'>Price: {currency}{getItemPrice(productData, item)}</p>
                      </div>
                    </div>
                  )
                })
              }
            </div>
            {/* Checkout section with DELETE on left, CHECKOUT on right */}
            <div className={`${showCartContent ? 'checkout-container' : 'hidden'}`}>
              {selectedItems.length > 0 && ( // ✅ only show if at least one checkbox selected
                <p className='checkout-total-price'>
                  Total Price: {currency}{orderSubTotal.toFixed(2)}
                </p>
              )}
            <div className='checkout-buttons'>
                <button
                  className="cart-button-delete"
                  onClick={handleDeleteSelected}
                  disabled={selectedItems.length === 0}
                  style={{marginRight: 'auto'}}
                >
                  {selectedItems.length === 1
                  ? 'DELETE(1 ITEM)'
                  :selectedItems.length > 1
                  ? `DELETE(${selectedItems.length} ITEMS)`
                  : 'DELETE'}
                </button>
              <button onClick={()=> handleCheckout ()} className='cart-button-checkout' disabled={selectedItems.length === 0}>CHECKOUT</button>  
            </div>   
            </div>
          </>
        )}
      </div>
      <OurPolicy/>
      <Infos/>
      <Footer/>
    </div>
  )
}

export default Cart
