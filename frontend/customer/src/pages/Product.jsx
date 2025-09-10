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
import UnavailableNote from '../components/Notice/UnavailableNote';

import Loading from '../components/Loading';
const Product = () => {
  const { productId } = useParams();
  const { products, productVariantValues, variantName, currency, addToCart, toastError, navigate, addToWishlist, removeFromWishlist, isInWishlist, cartItems, showUnavailableNote, setShowUnavailableNote, verifiedUser} = useContext(ShopContext);
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState('');
  const [quantity, setQuantity] = useState(1);

  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);

  const handleUpScroll = () => {
    window.scrollTo(0, 0);
  }

  // Find the product with the matching productId
  const fetchProductData = async () => {
    try {
      //const productId = Number(productId);  Convert productId to a number
      const product = products.find((item) => String(item.productId) === String(productId));
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
    if (products && products.length > 0) {
      fetchProductData();
    }
  }, [productId, products]);


  const variantGroups = {};
  if (productData) {
    productVariantValues
      .filter((pv) => pv.productId === productData.ID)
      .forEach((pv) => {
        const nameObj = variantName.find((n) => n.ID === pv.variantNameId);
        if (!nameObj) return;

        if (!variantGroups[nameObj.name]) variantGroups[nameObj.name] = [];

        variantGroups[nameObj.name].push({
          ID: pv.ID,
          value: pv.value,
          price: pv.price,
          stock: pv.stock,
          expirationDate: pv.expirationDate,
        });
      });
  }

  useEffect(() => {
    console.log('Variant Groups:', variantGroups);
  }, [variantGroups]);


  const handleVariantSelect = (variantType, ID) => {
    // Find the clicked variant object
    const selectedOption = variantGroups[variantType].find(opt => opt.ID === ID);
    if (!selectedOption) return;

    let newSelected;

    if (Array.isArray(selectedVariants)) {
      // Remove old variant of the same type, keep others
      const otherValues = Object.keys(variantGroups).flatMap(vName =>
        vName === variantType ? [] : selectedVariants.filter(val =>
          variantGroups[vName]?.some(opt => opt.value === val)
        )
      );

      // Store the VALUE instead of the ID
      newSelected = [...otherValues, selectedOption.value];
    } else {
      newSelected = [selectedOption.value];
    }

    setSelectedVariants(newSelected);

    const totalVariantTypes = Object.keys(variantGroups).length;

    if (newSelected.length === totalVariantTypes) {
      // Get all selected variant objects based on values
      const selectedVariantValues = newSelected.map(val =>
        productVariantValues.find(opt => opt.value === val)
      );

      // Price = sum all selected variant prices
      const finalPrice = selectedVariantValues.reduce((sum, v) => sum + Number(v?.price || 0), 0);

      // Stock = sum all selected variant stocks
      const finalStock = selectedVariantValues.reduce((sum, v) => sum + Number(v?.stock || 0), 0);

      setPrice(finalPrice);
      setStock(finalStock);
    } else {
      setPrice(Number(productData.price));
      setStock(Number(productData.stockQuantity));
    }
  };

  // Check if all required variants are selected
  const allVariantsSelected = Object.keys(selectedVariants).length === Object.keys(variantGroups).length;

  const isActionDisabled = productData
  ? (productData.hasVariant
      ? (!allVariantsSelected || stock <= 0)
      : productData.stockQuantity <= 0)
  : true;


  // ADD TO CART
  const handleAddToCart = (productStocks, activeProduct) => {
    // Block if product has variants but none selected
    if (productData.hasVariant && !allVariantsSelected) {
      toast.error("Please select all product options before adding to cart.", { ...toastError });
      return;
    }

    if (activeProduct) {
      const existingCartItem = cartItems.find(item => {
        const itemValue = Array.isArray(item.value) ? item.value : JSON.parse(item.value || "[]");

        const sortedItemValue = [...itemValue].sort();
        const sortedSelected = [...selectedVariants].sort();

        return item.productId === productData.ID && JSON.stringify(sortedItemValue) === JSON.stringify(sortedSelected);
      });

      const existingQuantity = existingCartItem ? existingCartItem.quantity : 0;
      const totalQuantity = existingQuantity + quantity;
      
      if (quantity > productStocks) {
        toast.error("You've reached the maximum quantity available for this product.", { ...toastError });
      } 

      else if (totalQuantity > productStocks) {
        toast.error("Insufficient stock quantity. You already have some in your cart.", { ...toastError });
      }

      else {
        addToCart(productData.ID, selectedVariants, quantity);
      }
    } else {
      toast.error("This product is unavailable.", { ...toastError });
    }
  };

  // BUY NOW
  const handleBuyNow = (productStocks, activeProduct) => {
    
    if (verifiedUser === false) {
      setShowUnavailableNote(true);
      return;
    }

    if (productData.hasVariant && !allVariantsSelected) {
      toast.error("Please select all product options before adding to cart.", { ...toastError });
      return;
    }

    if (activeProduct) {
      if (quantity > productStocks) {
        toast.error("You've reached the maximum quantity available for this product.", { ...toastError });
      } else {
        addToCart(productData.ID, selectedVariants, quantity);
      }

    } else {
      toast.error("This product is unavailable.", { ...toastError });
    }

  }


  // PRODUCT DETAILS (AUTO FORMAT)
  const formatDetailsMessage = (message) => {
    return message.replace(/\n/g, '<br />');
  };

  // WISHLIST
  const toggleWishlist = () => {
    if (isInWishlist(productData.ID)) {
      removeFromWishlist(productData.ID);
    } else {
      addToWishlist(productData.ID);
    }
  };

  if (!products || products.length === 0) {
    return <Loading />;
  }

  if (!productData) {
    return <Loading />;
  }

  

  return productData ? (
    <div className='product-main'>
      {showUnavailableNote && <UnavailableNote />}
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
                {isInWishlist(productData.ID) ? <IoMdHeart /> : <IoMdHeartEmpty className='wishlist-inac'/>}
              </button>
            </div>
            <p className='pi-price'>
              {currency} {price > 0 ? price.toFixed(2) : Number(productData.price).toFixed(2)}
            </p>
            <p className='pi-description'>{productData.productDescription}</p>
            <div className='ss-main'>
              {Object.keys(variantGroups).map((vName) => (
                <div key={vName}>
                  <p className='select-size-text'>Select {vName}</p>
                  <div className='ss-list'>
                    {variantGroups[vName].map((opt) => (
                      <button
                        onClick={() => handleVariantSelect(vName, opt.ID)}
                        className={`sizes-none ${selectedVariants.includes(opt.value) ? 'sizes-pick' : ''}`}
                        key={opt.ID}
                      >
                        {opt.value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className='quantity-container'>
                <div className="quantity-semi">
                    <p className='select-size-text'>Select Quantity</p>
                    <p className='available-stk'>
                      Available Stocks: {stock > 0 ? stock : productData.stockQuantity}
                    </p>
                </div>
                <div className="quantity-controls">
                  <button onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))} className="quantity-btn"><FiMinus className='minus'/></button>
                  <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} className="quantity-input" min={1} max={stock > 0 ? stock : productData.stockQuantity}/>
                  <button onClick={() => setQuantity((prev) => Math.min(prev + 1, stock > 0 ? stock : productData.stockQuantity))} className="quantity-btn"><FiPlus className='plus'/></button>
                </div>
              </div>
              <div className='buttons-container'>
                <button onClick={() => handleAddToCart(stock > 0 ? stock : productData.stockQuantity, productData.isActive)} className='main-button add-cart' disabled={isActionDisabled}>ADD TO CART</button>
                <button className='main-button buy-now' onClick={() => handleBuyNow(stock > 0 ? stock : productData.stockQuantity, productData.isActive)} disabled={isActionDisabled}>BUY NOW</button>
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
        <div className='detainer'>
            <div className='flex'>
                <b className='p-details'>Product Details</b>
                <p className='p-stocks'>Product Stocks: {productData.stockQuantity}</p>
            </div>
            <div className='p-message'>
             <div className='product-details' 
                dangerouslySetInnerHTML={{ __html: formatDetailsMessage(productData.productDetails || "")}}
             />
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

