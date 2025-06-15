import React, { useContext, useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, NavLink } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import OurPolicy from '../components/OurPolicy';
import Infos from '../components/Infos';
import Footer from '../components/Footer';
import './Product.css'
import { FiMinus } from "react-icons/fi";
import { FiPlus } from "react-icons/fi";
import RelatedProducts from '../components/RelatedProducts';
import { IoMdHeartEmpty } from "react-icons/io";
import { IoMdHeart } from "react-icons/io";
import { toast } from "react-toastify";
const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart, toastError, navigate, addToWishlist, removeFromWishlist, isInWishlist} = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const detailsRef = useRef(null);
  const [isWishlistActive, setIsWishlistActive] = useState(false);
  
  const handleUpScroll = () => {
    window.scrollTo(0, 0);
  }

  const scrollToDetails = () => {
    detailsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Find the product with the matching productId
  const fetchProductData = async () => {
    try {
      //const productId = Number(productId);  Convert productId to a number
      const product = products.find((item) => item._id === productId);
      if (product) {
        setProductData(product); 
        setImage(product.image[0])
        
      } else {
        console.error('Product not found!');
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
    }
  }
  useEffect(() => {
    fetchProductData(); 
  }, [productId, products]);


  // QUANTITY LOGIC FOR ADD TO CART
  const handleAddToCart = (productStocks, activeProduct) => {
    if (activeProduct) {
      if (quantity > productStocks) {
        toast.error("You've reached the maximum quantity available for this product.", {...toastError});
        scrollToDetails();
      } else {
        addToCart(productData._id, size, quantity)
      }
    }
    else {
      toast.error("This product is unavaliable", {...toastError});
    }
    
  };

  // PRODUCT DETAILS (AUTO FORMAT)
  const formatDetailsMessage = (message) => {
    return message.replace(/\n/g, '<br />');
  };

  // WISHLIST
  const toggleWishlist = () => {
    if (isInWishlist(productData._id)) {
        removeFromWishlist(productData._id);
    } else {
        addToWishlist(productData._id);
    }
  };
  
  return productData ? (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <div className='pt-10 transition-opacity ease-in duration-500 opacity-100'>
        {/* Product Data */}
        <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
          {/* Product image */}
          <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
            <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full main-multiple-img'>
              {
                productData.image.map((item, index) => (
                  <img onClick={() => setImage(item)} src={item} key={index} className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer child-multiple-img' alt="" />
                ))
              }
            </div>
            <div className='w-full sm:w-[80%] priority-img'>
                <img className='w-full h-auto' src={image} alt="" />
            </div>
          </div>
          {/* Product Info */}
          <div className='flex-1'>
            <div className='nameWish-container'>
              <h1 className='text-2xl mt-2 pi-name'>{productData.name}</h1>
              <button className="wishlist-icon" onClick={toggleWishlist}>         
                {isInWishlist(productData._id) ? <IoMdHeart /> : <IoMdHeartEmpty className='wishlist-inac'/>}
              </button>
            </div>
            <p className='mt-5 text-3xl font-medium pi-price'>{currency}{productData.price}</p>
            <p className='mt-5 md:w-4/5 pi-description'>{productData.description}</p>
            <div className='flex flex-col gap-4 my-8 hahaha'>
              <p className='select-size-text'>Select Size</p>
              <div className='flex gap-2'>
                {
                  productData.sizes.map((item, index) => (
                    <button onClick={() => setSize(item)} className={`sizes-none ${item === size ? 'sizes-pick' : ''}`} key={index}>{item}</button>
                  ))
                }
              </div>
              <div className='quantity-container'>
                <p className='select-size-text'>Select Quantity</p>
                <div className="quantity-controls">
                  <button onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))} className="quantity-btn"><FiMinus className='minus'/></button>
                  <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} className="quantity-input" min={1} max={productData.stocks}/>
                  <button onClick={() => setQuantity((prev) => Math.min(prev + 1, productData.stocks))} className="quantity-btn"><FiPlus className='plus'/></button>
                </div>
              </div>
              <div className='buttons-container'>
                <button onClick={()=>handleAddToCart(productData.stocks, productData.active)} className='main-button add-cart'>ADD TO CART</button>
              </div>
              <hr className='mt-6 sm:w-4/5'/>
              <div className='text-sm text-gray-500 mt-3 flex flex-col gap-1'>
                <p>100% Original product.</p>
                <p>Cash on delivery is available on this product.</p>
                <p>We do not provide a return or refund policy.</p>
              </div>
            </div>
          </div>
        </div>
        {/* PRODUCT DETAILS & STOCKS MONITORING */}
        <div ref={detailsRef} className='mt-20 detainer'>
            <div className='flex'>
                <b className='text-sm p-details'>Product Details</b>
                <p className='text-sm p-stocks'>Product Stocks: {productData.stocks}</p>
            </div>
            <div className='flex flex-col gap-4 border px-6 p-message'>
              <div className='product-details' dangerouslySetInnerHTML={{ __html: formatDetailsMessage(productData.details)}} />
            </div>
        </div>
      </div>
      {/* RELATED PRODUCTS */}
      <div onClick={handleUpScroll}>
        <RelatedProducts category={productData.category}/>
      </div>
      <OurPolicy/>
      <Infos/>
      <Footer/>
    </div>
    
  ) : <div className=''>...Loading</div>
}

export default Product;

