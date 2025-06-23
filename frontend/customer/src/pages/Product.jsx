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
      const product = products.find((item) => item.productId === productId);
      if (product) {
        setProductData(product); 
        setImage(product.images[0])
        
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
        addToCart(productData.productId, size, quantity)
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
    if (isInWishlist(productData.productId)) {
        removeFromWishlist(productData.productId);
    } else {
        addToWishlist(productData.productId);
    }
  };
  
  return productData ? (
    <div className='product-main'>
      <div className='product-semi'>
        {/* Product Data */}
        <div className='pd-container'>
          {/* Product image */}
          <div className='pi-container'>
            <div className='main-multiple-img'>
              {
                productData.images.map((item, index) => (
                  <img onClick={() => setImage(item)} src={item} key={index} className='child-multiple-img' alt="" />
                ))
              }
            </div>
            <div className='priority-img'>
                <img className='sc-priority-img' src={image} alt="" />
            </div>
          </div>
          {/* Product Info */}
          <div className='flex-1'>
            <div className='nameWish-container'>
              <h1 className='pi-name'>{productData.productName}</h1>
              <button className="wishlist-icon" onClick={toggleWishlist}>         
                {isInWishlist(productData.productId) ? <IoMdHeart /> : <IoMdHeartEmpty className='wishlist-inac'/>}
              </button>
            </div>
            <p className='pi-price'>{currency}{productData.price}</p>
            <p className='pi-description'>{productData.productDescription}</p>
            <div className='ss-main'>
              {
                productData.sizes?.length > 0 && ( 
                <>
                <p className='select-size-text'>Select Size</p>
                <div className='ss-list'>
                  {
                    productData.sizes.map((item, index) => (
                      <button onClick={() => setSize(item)} className={`sizes-none ${item === size ? 'sizes-pick' : ''}`} key={index}>{item}</button>
                    ))
                  }
                  
                </div>
                </>
                )
              }

              <div className='quantity-container'>
                <div className="quantity-semi">
                    <p className='select-size-text'>Select Quantity</p>
                    <p className='available-stk'>Available Stocks: {productData.stockQuantity}</p>
                </div>
                <div className="quantity-controls">
                  <button onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))} className="quantity-btn"><FiMinus className='minus'/></button>
                  <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} className="quantity-input" min={1} max={productData.stockQuantity}/>
                  <button onClick={() => setQuantity((prev) => Math.min(prev + 1, productData.stockQuantity))} className="quantity-btn"><FiPlus className='plus'/></button>
                </div>
              </div>
              <div className='buttons-container'>
                <button onClick={()=>handleAddToCart(productData.stockQuantity, productData.isActive)} className='main-button add-cart'>ADD TO CART</button>
                <button className='main-button buy-now'>BUY NOW</button>
              </div>
              <hr className='line-hr'/>
              <div className='product-info'>
                <p>100% Original product.</p>
                <p>Cash on delivery is available on this product.</p>
                <p>Easy return and exchange policy within 7 days.</p>
              </div>
            </div>
          </div>
        </div>
        {/* PRODUCT DETAILS & STOCKS MONITORING */}
        <div ref={detailsRef} className='detainer'>
            <div className='flex'>
                <b className='p-details'>Product Details</b>
                <p className='p-stocks'>Product Stocks: {productData.stockQuantity}</p>
            </div>
            <div className='p-message'>
              <div className='product-details' dangerouslySetInnerHTML={{ __html: formatDetailsMessage(productData.productDetails)}} />
            </div>
        </div>
      </div>
      {/* RELATED PRODUCTS */}
      <div onClick={handleUpScroll}>
        <RelatedProducts category={productData.categoryId}/>
      </div>
      <OurPolicy/>
      <Infos/>
      <Footer/>
    </div>
    
  ) : <div className=''>...Loading</div>
}

export default Product;

