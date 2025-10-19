import React, { useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { NavLink } from 'react-router-dom'
import './ProductItem.css'
// ICONS
import { IoMdHeartEmpty } from "react-icons/io";
import { IoMdHeart } from "react-icons/io";
import { GiBowTieRibbon } from "react-icons/gi";
const ProductItem = ({ID, productId, image, name, price, active, bestseller, outOfStock}) => {
    const {currency, addToWishlist, removeFromWishlist, isInWishlist} = useContext(ShopContext)
    const toggleWishlist = () => {
        if (isInWishlist(ID)) {
            removeFromWishlist(ID);
            
        } else {
            addToWishlist(ID);
        }
    };
  return (
    active && <div className='main-product-container'>
        <button className={`wishlist-icon1 ${isInWishlist(ID) ? 'hidden' : ''}`} 
        onClick={toggleWishlist}><IoMdHeartEmpty /></button>
        <button className={`wishlist-icon2 ${isInWishlist(ID) ? '' : 'hidden'}`} onClick={toggleWishlist}><IoMdHeart /></button>
        {
            bestseller && <div className='bestseller-prod'><GiBowTieRibbon /></div>
        }
        {!outOfStock ? (
                <NavLink className='cursor-pointer' to={`/product/${productId}`}>
                    <div className={`overflow-hidden product-container`}>
                        <img className='hover:scale-110 transition ease-in-out product-image' src={image[0]} draggable="false" alt={name} />
                    </div>
                </NavLink>
            ) : (
                <div className={`overflow-hidden product-container inactive`}>
                    <p className='ofs'>Out of stock</p>
                    <img className='hover:scale-110 transition ease-in-out product-image'src={image[0]} draggable="false" alt={name} />
                </div>
            )}
        <p className='pd-name'>{name}</p>
        <p className='ph-price'>{currency}{price}</p>
    </div>
  )
}

export default ProductItem
