import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title.jsx'
import ProductItem from './ProductItem.jsx'
import './RelatedProducts.css'

function RelatedProducts({category}) {
    const {products} = useContext(ShopContext);
    const [related, setRelated] = useState([]);

    useEffect(() => {
        if (products.length > 0) {
            let productCopy = products.slice();
            productCopy = productCopy.filter((item) => (category === item.categoryId))
            setRelated(productCopy.slice(0, 4));
        }
    }, [products])
  return (
    <div className='rp-main'>
        <div className='rp-text'>
            <Title text1={"RELATED"} text2={"PRODUCTS"}/>
        </div>
        <div className='rp-list'>
            {
                related.map((item, index) => (
                    <ProductItem key={index} id={item.productId} image={item.images} name={item.productName} price={item.price} active={item.isActive} bestseller={item.isBestSeller}/>
                ))
            }
        </div>
    </div>

  )
}

export default RelatedProducts
