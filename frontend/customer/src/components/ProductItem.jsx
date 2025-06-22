import React, { useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { NavLink } from 'react-router-dom'
import './ProductItem.css'
// ICONS
import { IoMdHeartEmpty } from "react-icons/io";
import { IoMdHeart } from "react-icons/io";
import { GiBowTieRibbon } from "react-icons/gi";
const ProductItem = ({id, image, name, price, active, bestseller}) => {
    const {currency, addToWishlist, removeFromWishlist, isInWishlist} = useContext(ShopContext)
    const toggleWishlist = () => {
        if (isInWishlist(id)) {
            removeFromWishlist(id);
            
        } else {
            addToWishlist(id);
        }
    };
  return (
    <div className='main-product-container'>
        <button className={`wishlist-icon1 ${isInWishlist(id) ? 'hidden' : ''}`} 
        onClick={toggleWishlist}><IoMdHeartEmpty /></button>
        <button className={`wishlist-icon2 ${isInWishlist(id) ? '' : 'hidden'}`} onClick={toggleWishlist}><IoMdHeart /></button>
        {
            bestseller && <div className='bestseller-prod'><GiBowTieRibbon /></div>
        }
        {active ? (
                <NavLink className='cursor-pointer' to={`/product/${id}`}>
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
