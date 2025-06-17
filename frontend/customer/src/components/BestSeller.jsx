import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title.jsx';
import './BestSeller.css'
import { NavLink } from 'react-router-dom';
import ProductItem from './ProductItem.jsx';


function BestSeller() {
    const {products} = useContext(ShopContext);
    const [bestSellingProducts, setBestSellingProducts] = useState([]);
    const bestseller = products.filter((value) => {
        return value.isBestSeller === true;
    })  
    useEffect(() => {
        setBestSellingProducts(bestseller)
    }, [products])
    
  return (
    <div id="best-seller" className='bs-container'>
        <div className='bs-margin'>
            <div className='bs-maintext'>
                <Title text1={'BEST'} text2={'SELLERS'}/>
                <p className='bs-subtitle'>These top-rated products are designed to support patient care and enhance medical efficiency.</p>
                <NavLink to="/shop"><p className='shop-button'>SHOP</p></NavLink>
            </div>
            {/* RENDERING PRODUCTS */}
            <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 gap-y-6'>
                {
                    bestSellingProducts.slice(0, 4).map((item, index) => (
                        <ProductItem key={index} id={item.productId} image={item.images} name ={item.productName} price={item.price} active={item.isActive} bestseller={item.isBestSeller}/>
                    ))
                }
            </div>
            <div className='seemore-container'>
                <p className='seemore-text'>See More</p>
            </div>
            
        </div>
    </div>
    
  )
}

export default BestSeller
