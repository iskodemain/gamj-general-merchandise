// import React, {useContext, useState, useEffect} from 'react'
// import { ShopContext } from '../context/ShopContext';
// import MainTitle from '../components/MainTitle.jsx';
// import { FiMinus } from "react-icons/fi";
// import { FiPlus } from "react-icons/fi";
// import { RiDeleteBinLine } from "react-icons/ri";
// import './Cart.css';
// import OurPolicy from '../components/OurPolicy.jsx';
// import Infos from '../components/Infos.jsx';
// import Footer from '../components/Footer.jsx';
// import { NavLink } from 'react-router-dom';
// import { toast } from "react-toastify";

// function Cart() {
//   const {products, currency, cartItems, setCartItems, updateQuantity, showCartContent, setShowCartContent, totalProductPrice, getTotalProductPrice, navigate, token, toastError, orderData, setOrderData} = useContext(ShopContext)
//   const [cartData, setCartData] = useState([]);
//   const [selectedItems, setSelectedItems] = useState([]);
//   const allSelected = selectedItems.length === cartData.length && cartData.length > 0;

//   useEffect(() => {
//     if (products.length > 0) {
//       const tempData = [];
//       let hasItems = false;
//       for (const items in cartItems) {
//         for(const item in cartItems[items]) {
//           if (cartItems[items][item] > 0) {
//             tempData.push({
//               productId: items,
//               size: item, 
//               quantity: cartItems[items][item],
//             });
//             hasItems = true;  
//           }
//         }
//       }
//       setCartData(tempData);
//       setShowCartContent(hasItems);
//     } else {
//       setShowCartContent(false);
//     }
//   }, [cartItems, products])

//   useEffect(() => {
//     // CALCULATE TOTAL PRICE
//     let price = 0;
//     cartData.forEach(item => {
//         const productData = products.find(product => product.productId === item.productId);
//         price += productData.price * item.quantity;
//     });
//     getTotalProductPrice(price);
//   }, [cartData, products]);


//   // MINIMUM BUTTON
//   const handleDecrease = (itemId, size, currentQuantity) => {
//     if (currentQuantity > 1) {
//       updateQuantity(itemId, size, currentQuantity - 1);
//     }
//   };

//   // MAXIMUM BUTTON
//   const handleIncrease = (itemId, size, currentQuantity, maxStock) => {
//     if (currentQuantity < maxStock) {
//       updateQuantity(itemId, size, currentQuantity + 1);
//     }
//   };

//   // Select/Deselect all
//   const handleSelectAll = () => {
//     if (allSelected) {
//       setSelectedItems([]);
//     } else {
//       setSelectedItems(cartData.map((item, idx) => idx));
//     }
//   };

//   // Select single item
//   const handleSelectItem = (idx) => {
//     setSelectedItems(prev =>
//       prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
//     );
//   };

//   // Delete selected items
// const handleDeleteSelected = () => {
//   // Clone cartItems to avoid direct mutation
//   const updatedCartItems = { ...cartItems };

//   // Only delete checked items
//   selectedItems.forEach(idx => {
//     const item = cartData[idx];
//     if (updatedCartItems[item.productId] && updatedCartItems[item.productId][item.size] !== undefined) {
//       // Remove the size entry
//       delete updatedCartItems[item.productId][item.size];
//       // If no sizes left for this product, remove the product entry
//       if (Object.keys(updatedCartItems[item.productId]).length === 0) {
//         delete updatedCartItems[item.productId];
//       }
//     }
//   });

//   setCartItems(updatedCartItems);
//   setSelectedItems([]);
//   const isEmpty = 
//     Object.keys(updatedCartItems).length === 0 &&
//     Object.values(updatedCartItems).every(
//       sizes => Object.keys(sizes).length === 0
//   );
//   if (isEmpty) setShowCartContent(false);

// };

// // Helper for deleting a single item and hiding cart if empty
// const handleDeleteSingle = (productId, size) => {
//   updateQuantity(productId, size, 0);

//   // Wait for cartItems to update, then check if empty
//   setTimeout(() => {
//     const updatedCartItems = { ...cartItems };
//     if (
//       Object.keys(updatedCartItems).length === 0 ||
//       Object.values(updatedCartItems).every(
//         sizes => Object.keys(sizes).length === 0
//       )
//     ) {
//       setShowCartContent(false);
//     }
//   }, 0);
// };

//   const hadleCheckout = async () => {
//     if (!token) {
//       navigate('/login');
//       toast.error("You must log in to proceed with the checkout.", {...toastError});
//       return;
//     }

//     let newOrders = [];

//     for (const productId in cartItems) {
//       const sizeQuantityObj = cartItems[productId];

//       for (const size in sizeQuantityObj) {
//         const quantity = sizeQuantityObj[size];

//         // Find the product using its _id
//         const product = products.find(p => p.productId === productId);
//         if (!product) continue;

//         const orderItem = {
//           order_id: Math.random().toString(36).substring(2, 10), // Random ID
//           product_id: product.productId,
//           product_name: product.productName,
//           price: product.price,
//           size: size,
//           quantity: quantity,
//           status: 'Pending',
//           payment: 'Unpaid',
//           payment_method: 'COD',
//           order_date: new Date().toISOString(),
//           images: product.images, // already an array
//           category: product.categoryId
//         };
//         newOrders.push(orderItem);
//       }
//     }
//     // Add to orderData context
//     setOrderData(prev => [...newOrders, ...prev]);
//     navigate('/place-order')
//   }

//   return (
//     <div className='main-cart'>
//       <div className='main-semi'>
//         <div className='text-2xl'>
//           <MainTitle mtext1={'YOUR'} mtext2={'CART'}/>
//         </div>
//         {/* EMPTY CART */}
//         {!showCartContent && (
//           <div className='empty-cart-message'>
//             <p>No items in your cart.</p>
//           </div>
//         )}
//         {/* ACTIVE CART */}
//         {showCartContent && (
//           <>
//             <div className="cart-header-actions">
//               <label className="cart-select-all">
//                 <input
//                   type="checkbox"
//                   checked={allSelected}
//                   onChange={handleSelectAll}
//                 />All ({cartData.length})
//               </label>
//             </div>
//             <div>
//               {
//                 cartData.map((item, index) => {
//                   const productData = products.find((product) => product.productId === item.productId);
//                   if (!productData?.isActive) {
//                     updateQuantity(item.productId, item.size, 0);
//                   }
//                   return (
//                     <div key={index} className='cart-container'>
//                       <div className='cc-2'>
//                         <NavLink className='cursor-pointer' to={`/product/${item.productId}`}>
//                           <img className='cart-product-img' src={productData.images?.[0] || 'default-image.jpg'} alt={productData?.productName || 'Product Image'}/>
//                         </NavLink>
//                         <div>
//                           <p className='cart-name'>{productData.productName}</p>
//                           <div className='cc-size'>
//                             {item.size.length > 0 && (
//                               <p className="cart-size">Size: {item.size}</p>
//                             )}
//                           </div>
//                           <div className='qd-container'>
//                             <div className="quantity-controls-cart">
//                               <button onClick={() => handleDecrease(item.productId, item.size, item.quantity)} className="quantity-btn-cart"><FiMinus className='minus-cart'/></button>
//                               <input
//                                 onChange={(e) => {
//                                   const value = Number(e.target.value);
//                                   if (isNaN(value) || value <= 0) return;
//                                   if (value > productData.stockQuantity) {
//                                     updateQuantity(item.productId, item.size, productData.stockQuantity);
//                                   } else {
//                                     updateQuantity(item.productId, item.size, value);
//                                   }
//                                 }}
//                                 type="number"
//                                 value={item.quantity}
//                                 className="quantity-input-cart"
//                                 min={1}
//                                 max={productData.stockQuantity}
//                               />

//                               <button onClick={() => handleIncrease(item.productId, item.size, item.quantity, productData.stockQuantity)} className="quantity-btn-cart"><FiPlus className='plus-cart'/></button>
//                             </div>
//                             <RiDeleteBinLine onClick={() => handleDeleteSingle(item.productId, item.size)} className='cart-delete'/>
//                           </div>
//                         </div>
//                       </div>
//                       <div className='cart-right-functions'>
//                         <div className="cart-item-checkbox">
//                           <input
//                             type="checkbox"
//                             checked={selectedItems.includes(index)}
//                             onChange={() => handleSelectItem(index)}
//                           />
//                         </div>
//                         <p className='cart-price'>Price: {currency}{productData.price}</p>
//                       </div>
//                     </div>
//                   )
//                 })
//               }
//             </div>
//             {/* Checkout section with DELETE on left, CHECKOUT on right */}
//             <div className={`${showCartContent ? 'checkout-container' : 'hidden'}`}>
//               <p className='checkout-total-price'>Total Price: {currency}{totalProductPrice.toFixed(2)}</p>
//             <div className='checkout-buttons'>
//                 <button
//                   className="cart-button-delete"
//                   onClick={handleDeleteSelected}
//                   disabled={selectedItems.length === 0}
//                   style={{marginRight: 'auto'}}
//                 >
//                   {selectedItems.length === 1
//                   ? 'DELETE(1 ITEM)'
//                   :selectedItems.length > 1
//                   ? `DELETE(${selectedItems.length} ITEMS)`
//                   : 'DELETE'}
//                 </button>
//               <button onClick={()=> hadleCheckout()} className='cart-button-checkout'>CHECKOUT</button>  
//             </div>   
//             </div>
//           </>
//         )}
//       </div>
//       <OurPolicy/>
//       <Infos/>
//       <Footer/>
//     </div>
//   )
// }

// export default Cart
