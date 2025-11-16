import React, { useState, useEffect, useContext } from 'react';
import { FaPlus, FaTrash, FaArrowLeft } from 'react-icons/fa';
import './AddProduct.css';
import Navbar from '../Navbar';
import { assets } from '../../assets/assets';
import { AdminContext } from '../../context/AdminContextProvider';
import { toast } from 'react-toastify';
import Loading from '../Loading.jsx'

function AddProduct() {
  const { navigate, productCategory, toastError, addProduct } = useContext(AdminContext);
  const [loading, setLoading] = useState(false);

  // --- IMAGE system (copied EXACTLY from Add.jsx pattern)
  const [image_1, setImage_1] = useState(false);
  const [image_2, setImage_2] = useState(false);
  const [image_3, setImage_3] = useState(false);
  const [image_4, setImage_4] = useState(false);

  const [removeImage_1, setRemoveImage_1] = useState(false);
  const [removeImage_2, setRemoveImage_2] = useState(false);
  const [removeImage_3, setRemoveImage_3] = useState(false);
  const [removeImage_4, setRemoveImage_4] = useState(false);

  // Keep same pattern as Add.jsx: when remove flag is true -> clear image and reset flag
  if (removeImage_1) { setImage_1(false); setRemoveImage_1(false); }
  if (removeImage_2) { setImage_2(false); setRemoveImage_2(false); }
  if (removeImage_3) { setImage_3(false); setRemoveImage_3(false); }
  if (removeImage_4) { setImage_4(false); setRemoveImage_4(false); }
  

  // basic product state
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productDetails, setProductDetails] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [displayPrice, setDisplayPrice] = useState('');
  const [displayStock, setDisplayStock] = useState('');
  const [expirationDate, setExpirationDate] = useState({ month: '', day: '', year: '' });

  // toggles
  const [hasVariants, setHasVariants] = useState(false);
  const [hasVariantCombination, setHasVariantCombination] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isOutOfStock, setIsOutOfStock] = useState(false);

  // variants (names & values sets)
  const [variantNamesList, setVariantNamesList] = useState([{ name: '' }]);
  const [variantValuesSets, setVariantValuesSets] = useState([
    [{ name: '', price: '', stock: '', expirationDate: { month: '', day: '', year: '' } }]
  ]);

  // combinations (flat array)
  const [variantCombinations, setVariantCombinations] = useState([
    { combinations: '', price: '', stock: '', availability: true }
  ]);

  // --- effects
  // auto-enable combination if > 1 sets and hasVariants is true
  useEffect(() => {
    if (variantValuesSets.length >= 2 && hasVariants) {
      setHasVariantCombination(true);
    }
    // If user turned off hasVariants, ensure combinations off
    if (!hasVariants) {
      setHasVariantCombination(false);
    }
  }, [variantValuesSets.length, hasVariants]);


  // NEW: When product has variants but NO combinations → sum stock of variant values
useEffect(() => {
  if (hasVariants && !hasVariantCombination) {
    const firstSet = variantValuesSets[0] || [];

    const total = firstSet.reduce((sum, val) => {
      return sum + (parseInt(val.stock, 10) || 0);
    }, 0);

    setDisplayStock(String(total));
  }
}, [variantValuesSets, hasVariants, hasVariantCombination]);


  // When using combinations, total stock becomes sum of combo stocks
  useEffect(() => {
    if (hasVariants && hasVariantCombination) {
      const total = variantCombinations.reduce((sum, combo) => {
        return sum + (parseInt(combo.stock, 10) || 0);
      }, 0);
      setDisplayStock(String(total));
    }
  }, [variantCombinations, hasVariants, hasVariantCombination]);

  const updateVariantName = (index, value) => {
    setVariantNamesList(prev => {
      const copy = [...prev];
      copy[index] = copy[index] || { name: '' };
      copy[index].name = value;
      return copy;
    });
  };

  // variant value sets (for multi-dimension variants like Color, Size)
  const addVariantValuesSet = () => {
    setVariantValuesSets(prev => [
      ...prev,
      [{ name: '', price: '', stock: '', expirationDate: { month: '', day: '', year: '' } }]
    ]);
    setVariantNamesList(prev => [...prev, { name: '' }]);
  };

  const removeVariantValuesSet = (setIndex) => {
    setVariantValuesSets(prevSets => {
      const updatedSets = prevSets.filter((_, i) => i !== setIndex);
      // remove corresponding variant name
      setVariantNamesList(prevNames => prevNames.filter((_, i) => i !== setIndex));
      // disable combination if fewer than 2 sets remain
      if (updatedSets.length < 2) setHasVariantCombination(false);
      return updatedSets;
    });
  };

  const addVariantValue = (setIndex) => {
    setVariantValuesSets(prev => {
      const copy = [...prev];
      copy[setIndex] = copy[setIndex] || [];
      copy[setIndex].push({ name: '', price: '', stock: '', expirationDate: { month: '', day: '', year: '' } });
      return copy;
    });
  };

  const removeVariantValue = (setIndex, valueIndex) => {
    setVariantValuesSets(prev => {
      const copy = [...prev];
      if (!copy[setIndex]) return copy;
      if (copy[setIndex].length <= 1) return copy; // keep at least one
      copy[setIndex] = copy[setIndex].filter((_, i) => i !== valueIndex);
      return copy;
    });
  };

  const updateVariantValue = (setIndex, valueIndex, field, value) => {
    setVariantValuesSets(prev => {
      const copy = [...prev];
      copy[setIndex] = copy[setIndex] || [];
      copy[setIndex][valueIndex] = { ...copy[setIndex][valueIndex], [field]: value };
      return copy;
    });
  };

  const updateVariantValueExpiration = (setIndex, valueIndex, field, value) => {
    setVariantValuesSets(prev => {
      const copy = [...prev];
      copy[setIndex] = copy[setIndex] || [];
      copy[setIndex][valueIndex] = {
        ...copy[setIndex][valueIndex],
        expirationDate: {
          ...copy[setIndex][valueIndex].expirationDate,
          [field]: value
        }
      };
      return copy;
    });
  };

  // combination handlers
  const addVariantCombination = () => {
    setVariantCombinations(prev => [
      ...prev,
      { combinations: '', price: '', stock: '', availability: true }
    ]);
  };

  const removeVariantCombination = (index) => {
    setVariantCombinations(prev => {
      if (prev.length <= 1) return prev; // keep at least one
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateVariantCombination = (index, field, value) => {
    setVariantCombinations(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const toggleCombinationAvailability = (index) => {
    setVariantCombinations(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], availability: !copy[index].availability };
      return copy;
    });
  };

  const handleVariantCombinationToggle = (checked) => {
    setHasVariantCombination(checked);

    if (checked) {
      // ensure at least 2 sets (UI convenience)
      if (variantValuesSets.length < 2) {
        setVariantValuesSets(prev => [
          ...prev,
          [{ name: '', price: '', stock: '', expirationDate: { month: '', day: '', year: '' } }]
        ]);
        setVariantNamesList(prev => [...prev, { name: '' }]);
      }
    } else {
      // reduce variant sets back to 1 (keep first set)
      setVariantValuesSets(prev => [prev[0] || [{ name: '', price: '', stock: '', expirationDate: { month: '', day: '', year: '' } }]]);
      setVariantNamesList(prev => [prev[0] || { name: '' }]);
      // also clear combinations if any (optional)
      setVariantCombinations([{ combinations: '', price: '', stock: '', availability: true }]);
    }
  };

  // sanitize numbers: keep only digits, disallow leading zeros (optional)
  const sanitizeNumber = (raw) => {
    if (raw === undefined || raw === null) return '';
    // remove non-digits
    let result = String(raw).replace(/\D/g, '');
    // remove leading zeros unless the user specifically typed "0"
    // (we'll keep as-is; backend will Number(...) later)
    // prevent negative sign by design
    return result;
  };

  const handleDecimalInput = (raw) => {
    if (raw === undefined || raw === null) return '';

    // Allow digits + one decimal point
    if (/^[0-9]*\.?[0-9]*$/.test(raw)) {
      return raw;
    }

    // Reject invalid characters
    return raw.slice(0, -1);
  };


  // --- submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    let finalExpirationDate;
    let finalVariantNames;
    let finalVariantValues;
    let finalVariantCombinations;

    const hasAtLeastOneImage = image_1 || image_2 || image_3 || image_4;
    if (!hasAtLeastOneImage) {
      toast.error("Please upload at least ONE product image.", { ...toastError });
      return;
    }

    // Basic validations (consistent with your backend)
    if (!productName) { 
      toast.error('Product name is required', { ...toastError });
      return; 
    }
    if (!productDescription) { 
      toast.error('Product description is required', { ...toastError });
      return; 
    }

    if (!categoryId) {
      toast.error("Please select a product category.", { ...toastError });
      return;
    }

    if (displayPrice === '' || displayPrice === null || Number(displayPrice) < 0) { 
      toast.error('Price is required', { ...toastError });
      return; 
    }

    if (displayStock === '' || displayStock === null || Number(displayStock) < 0) { 
      toast.error('Stock is required', { ...toastError });
      return; 
    }

    if (!hasVariants && expirationDate.year && expirationDate.month && expirationDate.day) {
      const expDate = `${expirationDate.year}-${String(expirationDate.month).padStart(2, '0')}-${String(expirationDate.day).padStart(2, '0')}`;
      finalExpirationDate = expDate;
    } else {
      finalExpirationDate = null; 
    }

    // If variants but NO combinations
    if (hasVariants && !hasVariantCombination) {
      // Variant name cannot be empty
      const variantNameIsEmpty = variantNamesList.some(v => !v.name.trim());

      if (variantNameIsEmpty) {
          toast.error("Please fill the Variant Name before continuing.", { ...toastError });
          return;
      }

      // Must have at least ONE valid variant value
      const variantValueSet = variantValuesSets[0] || [];

      const hasAtLeastOneValidValue = variantValueSet.some(value =>
          value.name.trim() !== "" &&
          value.price.trim() !== "" &&
          value.stock.trim() !== ""
      );

      if (!hasAtLeastOneValidValue) {
          toast.error("Please add at least ONE complete Variant Value (Name, Price, Stock).", { ...toastError });
          return;
      }

      // Check for blank newly added value rows
      const hasBlankRow = variantValueSet.some(value =>
          value.name.trim() === "" ||
          value.price.trim() === "" ||
          value.stock.trim() === ""
      );

      if (hasBlankRow) {
          toast.error("You added a new Variant Value but left it blank. Please fill it or delete it.", { ...toastError });
          return;
      }

      // build variantNames (single)
      const variantNames = variantNamesList.map(v => v.name).filter(Boolean);
      // flatten the first set (we keep UI as single set for this case)
      const values = (variantValuesSets[0] || []).map(v => {
        const expDate = v.expirationDate && v.expirationDate.year && v.expirationDate.month && v.expirationDate.day
          ? `${v.expirationDate.year}-${String(v.expirationDate.month).padStart(2, '0')}-${String(v.expirationDate.day).padStart(2, '0')}`
          : null;
        return {
          variantName: variantNames[0] || '',
          name: v.name,
          price: v.price === '' ? null : Number(v.price),
          stock: v.stock === '' ? null : Number(v.stock),
          expirationDate: expDate
        };
      });

      finalVariantNames = variantNames;
      finalVariantValues = values
    }

    if (hasVariants && hasVariantCombination) {
      // Check if user added at least ONE VALID combination row
      const hasAtLeastOneCombo = variantCombinations.some(
        c => c.combinations.trim() !== ""
      );

      if (!hasAtLeastOneCombo) {
        toast.error("Please add at least ONE Variant Combination.", { ...toastError });
        return;
      }

      const variantNames = variantNamesList.map(v => v.name).filter(Boolean);

      // flatten variantValues from sets into flat array
      const flatVariantValues = [];
      variantValuesSets.forEach((set, setIndex) => {
        const variantName = variantNamesList[setIndex]?.name || '';
        (set || []).forEach(val => {
          flatVariantValues.push({
            variantName,
            name: val.name
          });
        });
      });

      // prepare combinations (they include price & stock)
      const combos = (variantCombinations || []).map(combo => ({
        combinations: combo.combinations,
        price: combo.price === '' ? 0 : Number(combo.price),
        stock: combo.stock === '' ? 0 : Number(combo.stock),
        availability: !!combo.availability
      }));

      finalVariantNames = variantNames;
      finalVariantValues = flatVariantValues;
      finalVariantCombinations = combos;
    }

    const formData = new FormData();
    formData.append('categoryId', Number(categoryId));
    formData.append('productName', productName);
    formData.append('productDescription', productDescription);
    formData.append('productDetails', productDetails || '');
    formData.append('price', displayPrice === '' ? '' : Number(displayPrice));
    
    // append only File objects to FormData as image1..image4
    if (image_1 instanceof File) formData.append('image1', image_1);
    if (image_2 instanceof File) formData.append('image2', image_2);
    if (image_3 instanceof File) formData.append('image3', image_3);
    if (image_4 instanceof File) formData.append('image4', image_4);

    formData.append('stockQuantity', displayStock === '' ? '' : Number(displayStock));
    formData.append('isBestSeller', isBestSeller);
    formData.append('isActive', isActive);
    formData.append('isOutOfStock', isOutOfStock);
    formData.append('hasVariant', hasVariants);
    formData.append('hasVariantCombination', hasVariantCombination);
    formData.append('expirationDate', finalExpirationDate || '');
    formData.append('variantNames', JSON.stringify(finalVariantNames || []));
    formData.append('variantValues', JSON.stringify(finalVariantValues || []));
    formData.append('variantCombination', JSON.stringify(finalVariantCombinations || []));


    console.log("finalVariantNames:", finalVariantNames);
    console.log("FormData:", Object.fromEntries(formData));

    setLoading(true);
    await addProduct(formData);
    setLoading(false);

    navigate('/products/totalproduct');
  };

  // --- render
  return (
    <>
      {loading && <Loading/>}
      <Navbar TitleName="Add Product" />
      <div className="ap-page">
        <div className="ap-container">
          <div className="ap-header">
            <button onClick={() => window.history.back()} className="ap-back">
              <FaArrowLeft />
            </button>
            <h1 className="ap-title">Back</h1>
          </div>

          <form onSubmit={handleSubmit} className="ap-form">
            <section className="ap-card">
              <h2 className="ap-heading">Upload Image</h2>
              <div className="ap-upload-grid">
                {/* IMAGE 1 */}
                <div className={`main-img-container ${image_1 ? 'uploaded' : ''}`}>
                  <p onClick={() => setRemoveImage_1(true)} className={`img-remove-btn ${image_1 ? '' : 'hidden'}`}><span><FaTrash/></span></p>
                  <label htmlFor="image_1" className="img-label">
                    <div className="img-container">
                      <img className="image-con"
                        src={
                          typeof image_1 === 'string'
                            ? image_1
                            : (!image_1 ? assets.image_upload_icon : URL.createObjectURL(image_1))
                        }
                        alt=""
                      />
                    </div>
                    <input onChange={(e) => setImage_1(e.target.files[0])} type="file" id="image_1" hidden />
                  </label>
                </div>

                {/* IMAGE 2 */}
                <div className={`main-img-container ${image_2 ? 'uploaded' : ''}`}>
                  <p onClick={() => setRemoveImage_2(true)} className={`img-remove-btn ${image_2 ? '' : 'hidden'}`}><span><FaTrash/></span></p>
                  <label htmlFor="image_2" className="img-label">
                    <div className="img-container">
                      <img className="image-con"
                        src={
                          typeof image_2 === 'string'
                            ? image_2
                            : (!image_2 ? assets.image_upload_icon : URL.createObjectURL(image_2))
                        }
                        alt=""
                      />
                    </div>
                    <input onChange={(e) => setImage_2(e.target.files[0])} type="file" id="image_2" hidden />
                  </label>
                </div>

                {/* IMAGE 3 */}
                <div className={`main-img-container ${image_3 ? 'uploaded' : ''}`}>
                  <p onClick={() => setRemoveImage_3(true)} className={`img-remove-btn ${image_3 ? '' : 'hidden'}`}><span><FaTrash/></span></p>
                  <label htmlFor="image_3" className="img-label">
                    <div className="img-container">
                      <img className="image-con"
                        src={
                          typeof image_3 === 'string'
                            ? image_3
                            : (!image_3 ? assets.image_upload_icon : URL.createObjectURL(image_3))
                        }
                        alt=""
                      />
                    </div>
                    <input onChange={(e) => setImage_3(e.target.files[0])} type="file" id="image_3" hidden />
                  </label>
                </div>

                {/* IMAGE 4 */}
                <div className={`main-img-container ${image_4 ? 'uploaded' : ''}`}>
                  <p onClick={() => setRemoveImage_4(true)} className={`img-remove-btn ${image_4 ? '' : 'hidden'}`}><span><FaTrash/></span></p>
                  <label htmlFor="image_4" className="img-label">
                    <div className="img-container">
                      <img className="image-con"
                        src={
                          typeof image_4 === 'string'
                            ? image_4
                            : (!image_4 ? assets.image_upload_icon : URL.createObjectURL(image_4))
                        }
                        alt=""
                      />
                    </div>
                    <input onChange={(e) => setImage_4(e.target.files[0])} type="file" id="image_4" hidden />
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Product Name</label>
                <input className="input" type="text" value={productName}
                  onChange={(e) => setProductName(e.target.value)} placeholder="Enter product name" required/>
              </div>

              <div className="form-group">
                <label>Product Description</label>
                <textarea className="input ap-pd" value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)} placeholder="Provide a brief product description" required/>
              </div>

              <div className="form-group">
                <label>Product Details</label>
                <textarea className="textarea" rows="4" value={productDetails}
                  onChange={(e) => setProductDetails(e.target.value)} placeholder="Enter detailed product information (optional)" />
              </div>

              <div className="form-group">
                <label>Product Category</label>
                <select
                  className="select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">Select Category</option>

                  {productCategory && productCategory.length > 0 &&
                    productCategory.map((cat) => (
                      <option key={cat.ID} value={cat.ID}>
                        {cat.categoryName}
                      </option>
                    ))}
                </select>
              </div>


              <div className="grid-2">
                <div className="form-group">
                  <label>Total Stock</label>
                  <input
                    className="input"
                    type="text"
                    inputMode="numeric"
                    value={displayStock}
                    onChange={(e) => setDisplayStock(sanitizeNumber(e.target.value))}
                    placeholder="250"
                    disabled={hasVariants}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Display Price</label>
                  <input
                    className="input price-input"
                    type="text"
                    inputMode="numeric"
                    value={displayPrice}
                    onChange={(e) => setDisplayPrice(handleDecimalInput(e.target.value))}
                    placeholder="₱1000"
                    required
                  />
                </div>
              </div>

              {!hasVariants && (
                <>
                  <div className="form-group">
                    <label>Expiration Date</label>
                  </div>
                  <div className="grid-3 exp-date-set">
                    <select className="select" value={expirationDate.month}
                      onChange={(e) => setExpirationDate({ ...expirationDate, month: e.target.value })}>
                      <option value="">Month</option>
                      {Array.from({ length: 12 }, (_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                    </select>
                    <select className="select" value={expirationDate.day}
                      onChange={(e) => setExpirationDate({ ...expirationDate, day: e.target.value })}>
                      <option value="">Day</option>
                      {Array.from({ length: 31 }, (_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                    </select>
                    <select className="select" value={expirationDate.year}
                      onChange={(e) => setExpirationDate({ ...expirationDate, year: e.target.value })}>
                      <option value="">Year</option>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() + i;
                        return <option key={year} value={year}>{year}</option>;
                      })}
                    </select>
                  </div>
                </>
              )}

              <div className="checkbox-row">
                <label className="checkbox-inline">
                  <input type="checkbox" checked={hasVariants} onChange={(e) => setHasVariants(e.target.checked)} />
                  This product has variants
                </label>
              </div>

              {hasVariants && (
                <label className="checkbox-inline">
                  <input type="checkbox" checked={hasVariantCombination} onChange={(e) => handleVariantCombinationToggle(e.target.checked)} />This product has variant combination
                </label>
              )}
            </section>

            {/* Variants block */}
            {hasVariants && (
              <section className="ap-card variant-card">
                {variantValuesSets.map((valueSet, setIndex) => (
                  <div key={setIndex} className="variant-values-set">
                    <div className="variant-set-header">
                      {hasVariantCombination && variantValuesSets.length > 1 && (
                        <button type="button" className="btn-remove" onClick={() => removeVariantValuesSet(setIndex)}>
                          <FaTrash className='btn-remove-icon' />
                        </button>
                      )}
                    </div>

                    <div className="variant-name-row">
                      <p className="vn-title">Variant Name</p>
                      <input
                        className="input"
                        type="text"
                        value={variantNamesList[setIndex]?.name || ""}
                        onChange={(e) => updateVariantName(setIndex, e.target.value)}
                        placeholder="e.g., Size, Color"
                      />
                    </div>

                    {/* Variant Values */}
                    {valueSet.map((value, valueIndex) => (
                      <div key={valueIndex} className="variant-value-row">
                        <div className="small-title">Variant Value {valueIndex + 1}</div>

                        <div className="grid-3">
                          <div className="form-group">
                            <label>Name</label>
                            <input
                              className="input"
                              type="text"
                              value={value.name}
                              onChange={(e) => updateVariantValue(setIndex, valueIndex, "name", e.target.value)}
                              placeholder="Value Name"
                            />
                          </div>

                          {/* Price + Stock only when NOT combination (choice B) */}
                          {!hasVariantCombination && (
                            <>
                              <div className="form-group">
                                <label>Price</label>
                                <input
                                  className="input price-input"
                                  type="text"
                                  inputMode="numeric"
                                  value={value.price}
                                  onChange={(e) => updateVariantValue(setIndex, valueIndex, "price", handleDecimalInput(e.target.value))}
                                  placeholder='₱500'
                                />
                              </div>

                              <div className="form-group">
                                <label>Stock</label>
                                <input
                                  className="input"
                                  type="text"
                                  inputMode="numeric"
                                  value={value.stock}
                                  onChange={(e) => updateVariantValue(setIndex, valueIndex, "stock", sanitizeNumber(e.target.value))}
                                  placeholder='100'
                                />
                              </div>
                            </>
                          )}
                        </div>

                        {/* Expiration */}
                        <div className="value-actions">
                          <div>
                            <label className="small-label">Expiration Date</label>
                            <div className="grid-3">
                              <select className="select" value={value.expirationDate.month} onChange={(e) => updateVariantValueExpiration(setIndex, valueIndex, "month", e.target.value)}>
                                <option value="">Month</option>
                                {Array.from({ length: 12 }, (_, i) => (<option key={i+1} value={i+1}>{i+1}</option>))}
                              </select>

                              <select className="select" value={value.expirationDate.day} onChange={(e) => updateVariantValueExpiration(setIndex, valueIndex, "day", e.target.value)}>
                                <option value="">Day</option>
                                {Array.from({ length: 31 }, (_, i) => (<option key={i+1} value={i+1}>{i+1}</option>))}
                              </select>

                              <select className="select" value={value.expirationDate.year} onChange={(e) => updateVariantValueExpiration(setIndex, valueIndex, "year", e.target.value)}>
                                <option value="">Year</option>
                                {Array.from({ length: 10 }, (_, i) => {
                                  const y = new Date().getFullYear() + i;
                                  return <option key={y} value={y}>{y}</option>;
                                })}
                              </select>
                            </div>
                          </div>

                          {/* Add or Delete Value */}
                          {valueIndex === valueSet.length - 1 ? (
                            <div className='vv-btn-ctn'>
                              <button type="button" className="btn btn-primary btn-new" onClick={() => addVariantValue(setIndex)}>
                                <FaPlus /> New Value
                              </button>
                              
                              <button type="button" className="btn-remove-vv-double" onClick={() => removeVariantValue(setIndex, valueIndex)}>
                                <FaTrash/>
                              </button>
                            </div>
                          ) : (
                            <button type="button" className="btn btn-remove-vv-solo" onClick={() => removeVariantValue(setIndex, valueIndex)}>
                              <FaTrash /> Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                {hasVariantCombination && (
                  <button type="button" className="avv-btn" onClick={addVariantValuesSet}>+ Add New Variant Value Set</button>
                )}
              </section>
            )}

            {/* Variant Combination */}
            {hasVariantCombination && variantValuesSets.length >= 2 && (
              <section className='ap-card variant-combo-card'>
                <div className="combo-card">
                  <div className="combo-header">
                    <p className='combo-title'>Variant Combination</p>
                    <div className="combo-actions">
                      <button type="button" className="combo-btn-deleteall"
                        onClick={() => {
                          setVariantCombinations([{ combinations: '', price: '', stock: '', availability: true }]);
                        }}>
                        Delete All
                      </button>
                    </div>
                  </div>

                  <div className="combo-list">
                    {variantCombinations.map((combo, idx) => (
                      <div key={idx} className={`combo-row ${!combo.availability ? "disabled" : ""}`}>
                        <div className="combo-col combo-big">
                          <input className="input" type="text" value={combo.combinations} disabled={!combo.availability}
                            onChange={(e) => updateVariantCombination(idx, 'combinations', e.target.value)} placeholder="Combined Variant Value (e.g., S, Blue)" />
                        </div>

                        <div className="combo-col combo-small">
                          <input className="input" type="text" inputMode="numeric" value={combo.price} disabled={!combo.availability} onChange={(e) => updateVariantCombination(idx, 'price', handleDecimalInput(e.target.value))} placeholder="Price" />
                        </div>

                        <div className="combo-col combo-small">
                          <input className="input" type="text" inputMode="numeric" value={combo.stock} disabled={!combo.availability} onChange={(e) => updateVariantCombination(idx, 'stock', sanitizeNumber(e.target.value))} placeholder="Stock" />
                        </div>

                        <div className="combo-col toggle-col">
                          <label className="switch">
                            <input type="checkbox" checked={combo.availability} onChange={() => toggleCombinationAvailability(idx)} />
                            <span className="slider" />
                          </label>
                        </div>

                        <button type="button" className="combo-delete-single" onClick={() => removeVariantCombination(idx)}>
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="button" className="combo-avc-btn" onClick={addVariantCombination}>+ Add New Combination</button>
              </section>
            )}

            {/* toggles & submit */}
            <section className="ap-card">
              <div className="toggle-list">
                <label className="toggle-row">
                  <input type="checkbox" checked={isActive} onChange={() => setIsActive(!isActive)} />
                  Mark as Active
                </label>
                <label className="toggle-row">
                  <input type="checkbox" checked={isBestSeller} onChange={() => setIsBestSeller(!isBestSeller)} />
                  Mark as Best Seller
                </label>
                <label className="toggle-row">
                  <input type="checkbox" checked={isOutOfStock} onChange={() => setIsOutOfStock(!isOutOfStock)} />
                  Mark as Out of Stock
                </label>
              </div>

              <div className="ap-actions">
                <button type="submit" className="btn btn-submit">ADD ITEM</button>
              </div>
            </section>
          </form>
        </div>
      </div>
    </>
  );
}

export default AddProduct;
