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
        return value.bestseller === true;
    })  
    useEffect(() => {
        setBestSellingProducts(bestseller)
    }, [products])
    
  return (
    <div id="best-seller" className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
        <div className='my-10'>
            <div className='text-center py-8 text-3xl '>
                <Title text1={'BEST'} text2={'SELLERS'}/>
                <p className='mb-8 w-3/4 m-auto sm:text-sm md:text-base text-gray-600 title-text leading-snug'>A collection of customer favorites that perfectly blend comfort, style, and quality. These popular picks are designed to make you look and feel your best.</p>
                <NavLink to="/shop"><p className='shop-button mb-8'>SHOP</p></NavLink>
            </div>
            {/* RENDERING PRODUCTS */}
            <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 gap-y-6'>
                {
                    bestSellingProducts.map((item, index) => (
                        <ProductItem key={index} id={item._id} image={item.image} name ={item.name} price={item.price} active={item.active} bestseller={item.bestseller}/>
                    ))
                }
            </div>
        </div>
    </div>
    
  )
}

export default BestSeller
