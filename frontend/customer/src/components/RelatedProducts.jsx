import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title.jsx'
import ProductItem from './ProductItem.jsx'

function RelatedProducts({category}) {
    const {products} = useContext(ShopContext);
    const [related, setRelated] = useState([]);

    useEffect(() => {
        if (products.length > 0) {
            let productCopy = products.slice();
            productCopy = productCopy.filter((item) => (category === item.category_name))
            setRelated(productCopy.slice(0, 4));
        }
    }, [products])
  return (
    <div className='my-24'>
        <div className='text-center text-3xl py-2'>
            <Title text1={"RELATED"} text2={"PRODUCTS"}/>
        </div>
        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 gap-y-6'>
            {
                related.map((item, index) => (
                    <ProductItem key={index} id={item.product_id} image={item.images} name={item.product_name} price={item.price} active={item.is_active} bestseller={item.is_bestseller}/>
                ))
            }
        </div>
    </div>

  )
}

export default RelatedProducts
