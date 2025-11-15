import React, { useState, useEffect, useContext } from 'react';
import { FaPlus, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import './UpdateProduct.css';
import Navbar from '../Navbar';
import { assets } from '../../assets/assets';
import { AdminContext } from '../../context/AdminContextProvider';
import { toast } from 'react-toastify';
import Loading from '../Loading.jsx';

function UpdateProduct() {
  const { navigate, productCategory, toastError, updateProduct, deleteProduct, products } = useContext(AdminContext);
  const { productId } = useParams(); // expects route like /products/update/:id
  const [loading, setLoading] = useState(false);

  // basic product state
  const [productID, setProductID] = useState(null); // will hold numeric ID from product
  const [productIdentifier, setProductIdentifier] = useState(''); // productId like PRDT-000001 (if present)
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productDetails, setProductDetails] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [displayPrice, setDisplayPrice] = useState('');
  const [displayStock, setDisplayStock] = useState('');
  const [expirationDate, setExpirationDate] = useState({ month: '', day: '', year: '' });

  // images
  const [images, setImages] = useState([null, null, null, null]); // File objects for new uploads
  const [imagePreviews, setImagePreviews] = useState([null, null, null, null]); // preview urls (existing URLs or blob urls)

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

  // ----- Prefill product data on mount / products change -----
  useEffect(() => {
    if (!products || !products.length) return;

    // Try to find by numeric ID or by productId string (route param)
    const found = products.find(p => {
      // productId might be numeric string or productId like PRDT-000001
      if (!productId) return false;
      if (String(p.ID) === productId) return true;
      if (String(p.productId) === productId) return true;
      return false;
    });

    if (!found) return;

    // Prefill basic fields
    setProductID(found.ID ?? null);
    setProductIdentifier(found.productId ?? '');
    setProductName(found.productName ?? '');
    setProductDescription(found.productDescription ?? '');
    setProductDetails(found.productDetails ?? '');
    setCategoryId(found.categoryId ?? '');
    setDisplayPrice(found.price !== undefined && found.price !== null ? String(found.price) : '');
    setDisplayStock(found.stockQuantity !== undefined && found.stockQuantity !== null ? String(found.stockQuantity) : '');

    setIsBestSeller(Boolean(found.isBestSeller));
    setIsActive(found.isActive === undefined ? true : Boolean(found.isActive));
    setIsOutOfStock(Boolean(found.isOutOfStock));
    setHasVariants(Boolean(found.hasVariant));
    setHasVariantCombination(Boolean(found.hasVariantCombination));

    // Expiration date - if present and stored as ISO e.g., "2025-11-15"
    if (found.expirationDate) {
      try {
        const d = new Date(found.expirationDate);
        if (!Number.isNaN(d.getTime())) {
          setExpirationDate({
            month: String(d.getMonth() + 1),
            day: String(d.getDate()),
            year: String(d.getFullYear())
          });
        }
      } catch (err) {
        // ignore parsing errors
      }
    } else {
      setExpirationDate({ month: '', day: '', year: '' });
    }

    // Images: put existing cloud URLs into previews, keep images[] null (so we only upload if user changes)
    setImagePreviews([
      found.image1 || (found.images && found.images[0]) || null,
      found.image2 || null,
      found.image3 || null,
      found.image4 || null
    ]);
    setImages([null, null, null, null]);

    // Variant details: your provided products sample did not include variant rows,
    // so we only prefill flags. If you have variant names/values in your product object,
    // extend this block to map them into variantNamesList, variantValuesSets, variantCombinations.
    // For now keep default structures if none available.

    // If product contains variantNames, variantValues, variantCombination arrays, map them:
    if (found.variantNames && Array.isArray(found.variantNames) && found.variantNames.length) {
      setVariantNamesList(found.variantNames.map(n => ({ name: n })));
    } else {
      // keep existing state (or single name slot)
      setVariantNamesList(prev => prev.length ? prev : [{ name: '' }]);
    }

    if (found.variantValues && Array.isArray(found.variantValues) && found.variantValues.length) {
      // If product stores flat variantValues (e.g., for combination case), place them into a single set
      // If you store grouped sets, adapt accordingly.
      // We'll map into single set for non-combination variant mode.
      if (!found.hasVariantCombination) {
        setVariantValuesSets([found.variantValues.map(v => ({
          name: v.name ?? '',
          price: v.price !== undefined && v.price !== null ? String(v.price) : '',
          stock: v.stock !== undefined && v.stock !== null ? String(v.stock) : '',
          expirationDate: v.expirationDate ? (() => {
            const dt = new Date(v.expirationDate);
            if (!Number.isNaN(dt.getTime())) {
              return { month: String(dt.getMonth() + 1), day: String(dt.getDate()), year: String(dt.getFullYear()) };
            }
            return { month: '', day: '', year: '' };
          })() : { month: '', day: '', year: '' }
        }))]);
      } else {
        // For combinations mode we still set empty sets; user can add sets in UI
        // You may adapt this if you store sets grouped by variant name.
      }
    }

    if (found.variantCombination && Array.isArray(found.variantCombination) && found.variantCombination.length) {
      setVariantCombinations(found.variantCombination.map(c => ({
        combinations: c.combinations ?? '',
        price: c.price !== undefined && c.price !== null ? String(c.price) : '',
        stock: c.stock !== undefined && c.stock !== null ? String(c.stock) : '',
        availability: c.availability === undefined ? true : Boolean(c.availability)
      })));
    }

  }, [products, productId]);

  // --- effects
  // auto-enable combination if > 1 sets and hasVariants is true
  useEffect(() => {
    if (hasVariants) {
        setHasVariantCombination(variantValuesSets.length >= 2);
    } else {
        setHasVariantCombination(false);
    }
}, [variantValuesSets, hasVariants]);


  // When using variants WITHOUT combinations → sum stock of variant values
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

  // --- helpers
  const handleImageChange = (index, file) => {
    const copyFiles = [...images];
    const copyPre = [...imagePreviews];

    if (!file) {
      copyFiles[index] = null;
      copyPre[index] = null;
    } else {
      copyFiles[index] = file;
      copyPre[index] = URL.createObjectURL(file);
    }

    setImages(copyFiles);
    setImagePreviews(copyPre);
  };

  const updateVariantName = (index, value) => {
    setVariantNamesList(prev => {
      const copy = [...prev];
      copy[index] = copy[index] || { name: '' };
      copy[index].name = value;
      return copy;
    });
  };

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
      setVariantNamesList(prevNames => prevNames.filter((_, i) => i !== setIndex));
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
      if (variantValuesSets.length < 2) {
        setVariantValuesSets(prev => [
          ...prev,
          [{ name: '', price: '', stock: '', expirationDate: { month: '', day: '', year: '' } }]
        ]);
        setVariantNamesList(prev => [...prev, { name: '' }]);
      }
    } else {
      setVariantValuesSets(prev => [prev[0] || [{ name: '', price: '', stock: '', expirationDate: { month: '', day: '', year: '' } }]]);
      setVariantNamesList(prev => [prev[0] || { name: '' }]);
      setVariantCombinations([{ combinations: '', price: '', stock: '', availability: true }]);
    }
  };

  // sanitize numbers (integers)
  const sanitizeNumber = (raw) => {
    if (raw === undefined || raw === null) return '';
    let result = String(raw).replace(/\D/g, '');
    return result;
  };

  // decimal support handler
  const handleDecimalInput = (raw) => {
    if (raw === undefined || raw === null) return '';

    // Allow digits + one decimal point
    if (/^[0-9]*\.?[0-9]*$/.test(raw)) {
      return raw;
    }

    // Reject invalid characters
    return raw.slice(0, -1);
  };

  // ----- Submit (Update) -----
  const handleSubmit = async (e) => {
    e.preventDefault();

    // validation same as add
    const hasAtLeastOneImage = images.some(img => img !== null) || imagePreviews.some(p => p);
    if (!hasAtLeastOneImage) {
      toast.error("Please upload at least ONE product image.", { ...toastError });
      return;
    }

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

    // expiration
    let finalExpirationDate = null;
    if (!hasVariants && expirationDate.year && expirationDate.month && expirationDate.day) {
      finalExpirationDate = `${expirationDate.year}-${String(expirationDate.month).padStart(2, '0')}-${String(expirationDate.day).padStart(2, '0')}`;
    }

    // build variant payloads (same logic as add)
    let finalVariantNames;
    let finalVariantValues;
    let finalVariantCombinations;

    if (hasVariants && !hasVariantCombination) {
      const variantNameIsEmpty = variantNamesList.some(v => !v.name.trim());
      if (variantNameIsEmpty) {
        toast.error("Please fill the Variant Name before continuing.", { ...toastError });
        return;
      }
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
      const hasBlankRow = variantValueSet.some(value =>
        value.name.trim() === "" ||
        value.price.trim() === "" ||
        value.stock.trim() === ""
      );
      if (hasBlankRow) {
        toast.error("You added a new Variant Value but left it blank. Please fill it or delete it.", { ...toastError });
        return;
      }

      const variantNames = variantNamesList.map(v => v.name).filter(Boolean);
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
      finalVariantValues = values;
    }

    if (hasVariants && hasVariantCombination) {
      const hasAtLeastOneCombo = variantCombinations.some(c => c.combinations.trim() !== "");
      if (!hasAtLeastOneCombo) {
        toast.error("Please add at least ONE Variant Combination.", { ...toastError });
        return;
      }
      const variantNames = variantNamesList.map(v => v.name).filter(Boolean);
      const flatVariantValues = [];
      variantValuesSets.forEach((set, setIndex) => {
        const variantName = variantNamesList[setIndex]?.name || '';
        (set || []).forEach(val => {
          flatVariantValues.push({ variantName, name: val.name });
        });
      });
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

    // Build FormData exactly as your backend expects (same as add)
    const formData = new FormData();
    // include both identifiers to be safe - backend can choose which to use
    if (productID) formData.append('ID', productID);
    if (productIdentifier) formData.append('productId', productIdentifier);

    formData.append('categoryId', Number(categoryId));
    formData.append('productName', productName);
    formData.append('productDescription', productDescription);
    formData.append('productDetails', productDetails || '');
    formData.append('price', displayPrice === '' ? null : Number(displayPrice));
    // only append images that are actual File objects (new uploads)
    if (images[0] instanceof File) formData.append("image1", images[0]);
    if (images[1] instanceof File) formData.append("image2", images[1]);
    if (images[2] instanceof File) formData.append("image3", images[2]);
    if (images[3] instanceof File) formData.append("image4", images[3]);
    // if no new file for a slot, we don't append; backend should keep existing image.
    formData.append('stockQuantity', displayStock === '' ? null : Number(displayStock));
    formData.append('isBestSeller', isBestSeller);
    formData.append('isActive', isActive);
    formData.append('isOutOfStock', isOutOfStock);
    formData.append('hasVariant', hasVariants);
    formData.append('hasVariantCombination', hasVariantCombination);
    formData.append('expirationDate', finalExpirationDate || null);
    formData.append('variantNames', JSON.stringify(finalVariantNames || []));
    formData.append('variantValues', JSON.stringify(finalVariantValues || []));
    formData.append('variantCombination', JSON.stringify(finalVariantCombinations || []));

    setLoading(true);
    try {
      // call your provided updateProduct(formData)
      await updateProduct(formData);
      toast.success("Product updated successfully.");
      navigate('/products/totalproduct');
    } catch (err) {
      console.error('Update failed:', err);
      toast.error(err?.message || 'Failed to update product', { ...toastError });
    } finally {
      setLoading(false);
    }
  };

  // ----- Delete handler (if AdminContext provides deleteProduct) -----
  const handleDelete = async () => {
    if (!productID && !productIdentifier) {
      toast.error("Unable to determine product to delete.", { ...toastError });
      return;
    }
    if (!deleteProduct) {
      toast.error("Delete operation not available. Implement deleteProduct in AdminContext.", { ...toastError });
      console.warn("AdminContext.deleteProduct not available.");
      return;
    }

    if (!window.confirm("Delete this product? This action cannot be undone.")) return;

    setLoading(true);
    try {
      // attempt both identifiers; context implementation can check which one it wants
      const payload = new FormData();
      if (productID) payload.append('ID', productID);
      if (productIdentifier) payload.append('productId', productIdentifier);

      await deleteProduct(payload);
      toast.success("Product deleted.");
      navigate('/products/totalproduct');
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error(err?.message || 'Failed to delete product', { ...toastError });
    } finally {
      setLoading(false);
    }
  };

  // --- render
  return (
    <>
      {loading && <Loading />}
      <Navbar TitleName="Update Product" />
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
                {Array.from({ length: 4 }).map((_, idx) => (
                  <label key={idx} className="ap-upload-slot">
                    {imagePreviews[idx] ? (
                      <img src={imagePreviews[idx]} alt={`preview-${idx}`} className="ap-preview" />
                    ) : (
                      <div className="ap-upload-placeholder">
                        <img src={assets.image_upload_icon} alt="" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(ev) => handleImageChange(idx, ev.target.files[0])}
                      className="ap-file-input"
                    />
                    {imagePreviews[idx] && (
                      <button
                        type="button"
                        className="ap-remove-image"
                        onClick={(e) => {
                          e.preventDefault();
                          handleImageChange(idx, null);
                        }}
                        title="Remove image"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </label>
                ))}
              </div>

              <div className="form-group">
                <label>Product Name</label>
                <input className="input" type="text" value={productName}
                  onChange={(e) => setProductName(e.target.value)} placeholder="Enter product name" required />
              </div>

              <div className="form-group">
                <label>Product Description</label>
                <textarea className="input ap-pd" value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)} placeholder="Provide a brief product description" required />
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
                    inputMode="decimal"
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
                      {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                    </select>
                    <select className="select" value={expirationDate.day}
                      onChange={(e) => setExpirationDate({ ...expirationDate, day: e.target.value })}>
                      <option value="">Day</option>
                      {Array.from({ length: 31 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
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

            {/* Variants block (same as AddProduct) */}
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

                          {!hasVariantCombination && (
                            <>
                              <div className="form-group">
                                <label>Price</label>
                                <input
                                  className="input price-input"
                                  type="text"
                                  inputMode="decimal"
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
                                {Array.from({ length: 12 }, (_, i) => (<option key={i + 1} value={i + 1}>{i + 1}</option>))}
                              </select>

                              <select className="select" value={value.expirationDate.day} onChange={(e) => updateVariantValueExpiration(setIndex, valueIndex, "day", e.target.value)}>
                                <option value="">Day</option>
                                {Array.from({ length: 31 }, (_, i) => (<option key={i + 1} value={i + 1}>{i + 1}</option>))}
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
                                <FaTrash />
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
                          <input className="input" type="text" inputMode="decimal" value={combo.price} disabled={!combo.availability} onChange={(e) => updateVariantCombination(idx, 'price', handleDecimalInput(e.target.value))} placeholder="Price" />
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

              <div className="ap-actions" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                {/* Save Changes */}
                <button type="submit" className="btn btn-submit">Save Changes</button>


                {/* Delete button (left) */}
                <button type="button" className="btn btn-danger" onClick={handleDelete} style={{ marginRight: 'auto' }}>
                  Delete
                </button>
              </div>
            </section>
          </form>
        </div>
      </div>
    </>
  );
}

export default UpdateProduct;
