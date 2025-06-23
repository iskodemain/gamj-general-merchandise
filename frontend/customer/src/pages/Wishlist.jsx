import React, {useContext}from 'react'
import './Wishlist.css'
import { ShopContext } from '../context/ShopContext';
import { NavLink } from 'react-router-dom';
import { RiDeleteBinLine } from "react-icons/ri";


function Wishlist() {
  const { products, wishlistItems, removeFromWishlist, currency } = useContext(ShopContext);
  const wishlistProducts = products.filter((product) => wishlistItems[product.productId]);
  return (
    <div className='wishlist-main'>
      <div className='wishlist-semi'>
        <div className='wishlist-title'>
          <div className='wishlist-title-mn'> 
          <p className='firstMainText'>WISH<span className='secondMainText'>LIST</span></p>
          <p className='w-8 sm:w-10 h-[1px] sm:h-[3px] line-color'></p>
          </div>
        </div>
        {wishlistProducts.length > 0 ? (
          wishlistProducts.map((productData) => (
            <div key={productData.productId} className='wishlist-item'>
                {productData.isActive ? (
                  <div className='active-product'>
                  <NavLink className='cursor-pointer' to={`/product/${productData.productId}`}>
                    <img className='wish-product-img' src={productData.images[0]} alt="" />
                  </NavLink>
                  <div>
                    <p className='wishlist-pn'>{productData.productName}</p>
                    <div className='wishlist-price'>
                      <p className='wl-text'>Price: {currency}{productData.price}</p>
                    </div>
                      </div>
                  </div>
                ) : (
                  <div className='inactive-product'>
                  <NavLink className='cursor-pointer' to={`/product/${productData.productId}`}>
                    <img className='wish-product-img' src={productData.images[0]} alt="" />
                  </NavLink>
                  <div>
                    <p className='wishlist-pn'>{productData.productName}</p>
                    <div className='wishlist-price'>
                      <p className='wl-text'>Price: {currency}{productData.price}</p>
                    </div>
                      </div>
                  </div>
                )}
              <RiDeleteBinLine onClick={() => removeFromWishlist(productData.productId)} className='cart-delete'/>
            </div>
          ))
        ) : (<p className='empty-wishlist-message'>No items in your wishlist.</p>)}
      </div>
    </div>
  )
}

export default Wishlist
