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
  const { products, productVariantValues, variantName, currency, addToCart, toastError, navigate, addToWishlist, removeFromWishlist, isInWishlist, cartItems, showUnavailableNote, setShowUnavailableNote, verifiedUser, productVariantCombination, token} = useContext(ShopContext);
  const [selectedVariants, setSelectedVariants] = useState('');
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [itemNotAvailable, setItemNotAvailable] = useState(false);
  const [unavailableProduct, setUnavailableProduct] = useState(false);

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
        setImage(product.images[0]);

        // ✅ Always start with product base price & stock quantity
        const basePrice = Number(product.price);
        const baseStock = Number(product.stockQuantity);

        setPrice(basePrice);
        setStock(baseStock);
        setItemNotAvailable(baseStock <= 0);
        
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

  const handleVariantSelect = (variantType, ID) => {
    const selectedOption = variantGroups[variantType].find(opt => opt.ID === ID);
    if (!selectedOption) return;

    let newSelected = [];

    if (typeof selectedVariants === "string" && selectedVariants.trim() !== "") {
      newSelected = selectedVariants.split(", ").map(v => v.trim());
    }

    // Remove the previous selection of the same type
    Object.keys(variantGroups).forEach(vName => {
      if (vName === variantType) {
        newSelected = newSelected.filter(
          val => !variantGroups[vName].some(opt => opt.value === val)
        );
      }
    });

    // Add the newly selected variant value
    newSelected.push(selectedOption.value);

    // Convert back to string format like "L, White"
    const formatted = newSelected.sort().join(", ");
    setSelectedVariants(formatted);


    // (APPLY THE CORRECT PRICE & STOCK BASED ON SELECTED COMBINATION)
    if (!productData) return;
    if (!productData.hasVariant && !productData.hasVariantCombination) {
      const productStock = Number(productData.stockQuantity);
      setPrice(Number(productData.price));
      setStock(productStock);
      setItemNotAvailable(productStock <= 0); // ✅ Show unavailable if stock = 0
      return;
    }
    // --- 2️⃣ PRODUCT WITH SINGLE VARIANTS ---
    if (productData.hasVariant && !productData.hasVariantCombination) {
      const match = productVariantValues.find(pv => pv.productId === productData.ID && pv.value === formatted);

      if (match) {
        const productStock = Number(match.stock);
        setPrice(Number(match.price));
        setStock(productStock);
        setItemNotAvailable(productStock <= 0); // ✅ Show unavailable if stock = 0
      } else {
        setItemNotAvailable(true);
        setPrice(Number(productData.price));
        setStock(Number(productData.stockQuantity));
      }
      return;
    }
    // --- 3️⃣ PRODUCT WITH VARIANT COMBINATIONS ---
    if (productData.hasVariant && productData.hasVariantCombination) {
      const matchCombo = productVariantCombination.find(
        combo =>
          combo.productId === productData.ID &&
          combo.combinations.split(", ").sort().join(", ") === formatted
      );

      if (matchCombo) {
        const productStock = Number(matchCombo.stock);
        setPrice(Number(matchCombo.price));
        setStock(productStock);
        setItemNotAvailable(productStock <= 0); // ✅ Show unavailable if stock = 0
      } else {
        setItemNotAvailable(true);
        setPrice(Number(productData.price));
        setStock(Number(productData.stockQuantity));
      }
      return;
    }
  };

  const allVariantsSelected = selectedVariants.split(', ').filter(Boolean).length === Object.keys(variantGroups).length;

  const isActionDisabled = productData ? (productData.hasVariant ? (!allVariantsSelected || stock <= 0 || itemNotAvailable) : productData.stockQuantity <= 0 || itemNotAvailable) : true;


  // ADD TO CART
  const handleAddToCart = (productStocks, activeProduct, isOutOfStock) => {
    if (!token) {
      toast.error("Please log in first to add to cart.", { ...toastError });
      navigate("/login")
    }
    // Block if product has variants but none selected
    if (productData.hasVariant && !allVariantsSelected) {
      toast.error("Please select all product options before adding to cart.", { ...toastError });
      return;
    }

    if (activeProduct && !isOutOfStock) {
      const existingCartItem = cartItems.find(item => {
        const itemValue = typeof item.value === "string" ? item.value : "";
        
        const sortedItemValue = itemValue.split(",").map(v => v.trim()).sort().join(", ");
        const sortedSelected = selectedVariants ? selectedVariants.split(",").map(v => v.trim()).sort().join(", ") : '';

        return item.productId === productData.ID && sortedItemValue === sortedSelected;
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
    if (!token) {
      toast.error("Please log in first to buy the product.", { ...toastError });
      navigate("/login")
    }
    
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

  useEffect(() => {
    if (productData && (!productData.isActive || productData.isOutOfStock)) {
      setUnavailableProduct(true);
    } else {
      setUnavailableProduct(false);
    }
  }, [productData]);

  if (!products || products.length === 0) {
    return <Loading />;
  }

  if (!productData) {
    return <Loading />;
  }

  const UnavailableProduct = () => {
    return (
      <div className="up-bg">
        <p className='up-note'>This product is currently unavailable.</p>
      </div>
    );
  };

  return (
    <div className='product-main'>
      {showUnavailableNote && <UnavailableNote />}
      {unavailableProduct && <UnavailableProduct />}
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
                        className={`sizes-none ${selectedVariants.split(', ').includes(opt.value) ? 'sizes-pick' : ''}`}
                        key={opt.ID}
                      >
                        {opt.value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {
                allVariantsSelected && itemNotAvailable &&
                <p className='unavailable-item-message'>Sorry, this item is currently unavailable.</p>
              }
              <div className='quantity-container'>
                <div className="quantity-semi">
                    <p className='select-size-text'>Select Quantity</p>
                    <p className='available-stk'>
                      { !isActionDisabled &&
                        `Available Stocks: ${stock}`
                      }
                    </p>
                </div>
                <div className="quantity-controls">
                  <button onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))} className="quantity-btn" disabled={isActionDisabled}><FiMinus className='minus'/></button>
                  <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} className="quantity-input" min={1} max={stock} disabled={isActionDisabled}/>
                  <button onClick={() => setQuantity((prev) => Math.min(prev + 1, stock))} className="quantity-btn" disabled={isActionDisabled}><FiPlus className='plus'/></button>
                </div>
              </div>
              <div className='buttons-container'>
                <button onClick={() => handleAddToCart(stock, productData.isActive, productData.isOutOfStock)} className='main-button add-cart' disabled={isActionDisabled}>ADD TO CART</button>
                <button className='main-button buy-now' onClick={() => handleBuyNow(stock, productData.isActive, productData.isOutOfStock)} disabled={isActionDisabled}>BUY NOW</button>
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
  )
}

export default Product;

