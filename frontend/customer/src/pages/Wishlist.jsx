import React, {useContext}from 'react'
import './Wishlist.css'
import { ShopContext } from '../context/ShopContext';
import { NavLink } from 'react-router-dom';
import { RiDeleteBinLine } from "react-icons/ri";


function Wishlist() {
  const { products, wishlistItems, removeFromWishlist, currency } = useContext(ShopContext);
  const wishlistProducts = products.filter((product) => wishlistItems[product._id]);
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <div className='pt-14'>
        <div className='text-2xl'>
          <div className='inline-flex gap-3 items-center mb-3'> 
          <p className='firstWishText'>WISH<span className='secondWishText'>LIST</span></p>
          <p className='w-8 sm:w-10 h-[1px] sm:h-[3px] line-color'></p>
          </div>
        </div>
        {wishlistProducts.length > 0 ? (
          wishlistProducts.map((productData) => (
            <div key={productData._id} className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.1fr] sm:grid-cols-[4fr_0.1fr] gap-4 mb-2 items-center'>
                {productData.active ? (
                  <div className='flex items-center gap-6'>
                  <NavLink className='cursor-pointer' to={`/product/${productData._id}`}>
                    <img className='cart-product-img' src={productData.image[0]} alt="" />
                  </NavLink>
                  <div>
                    <p className='text-xs sm:text-base font-medium'>{productData.product_name}</p>
                    <div className='flex items-center gap-2'>
                      <p className='text-xs sm:text-sm font-light'>Price: {currency}{productData.price}</p>
                    </div>
                      </div>
                  </div>
                ) : (
                  <div className='flex items-center gap-6 inactive-product'>
                  <NavLink className='cursor-pointer' to={`/product/${productData._id}`}>
                    <img className='cart-product-img' src={productData.image[0]} alt="" />
                  </NavLink>
                  <div>
                    <p className='text-xs sm:text-base font-medium'>{productData.product_name}</p>
                    <div className='flex items-center gap-2'>
                      <p className='text-xs sm:text-sm font-light'>Price: {currency}{productData.price}</p>
                    </div>
                      </div>
                  </div>
                )}
              <RiDeleteBinLine onClick={() => removeFromWishlist(productData._id)} className='cart-delete'/>
            </div>
          ))
        ) : (<p className='empty-wishlist-message'>No items in your wishlist.</p>)}
      </div>
    </div>
  )
}

export default Wishlist
