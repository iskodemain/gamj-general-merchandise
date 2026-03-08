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
  const { navigate, productCategory, toastError, updateProduct, deleteProduct, products, variantName, productVariantValues, productVariantCombination } = useContext(AdminContext);
  const { productId } = useParams();
  const [loading, setLoading] = useState(false);

  const [productItemState, setProductItemState] = useState(null);

  // basic product state
  const [productID, setProductID] = useState(null);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productDetails, setProductDetails] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [displayPrice, setDisplayPrice] = useState('');
  const [unitType, setUnitType] = useState('PIECE');
  const [piecesPerBox, setPiecesPerBox] = useState(1);

  // --- IMAGE STATES
  const [image_1, setImage_1] = useState(false);
  const [image_2, setImage_2] = useState(false);
  const [image_3, setImage_3] = useState(false);
  const [image_4, setImage_4] = useState(false);

  const [image_2Close, setImage_2Close] = useState(false);
  const [image_3Close, setImage_3Close] = useState(false);
  const [image_4Close, setImage_4Close] = useState(false);

  const [removeImage_2, setRemoveImage_2] = useState(false);
  const [removeImage_3, setRemoveImage_3] = useState(false);
  const [removeImage_4, setRemoveImage_4] = useState(false);

  if (removeImage_2) { setImage_2(false); setRemoveImage_2(false); }
  if (removeImage_3) { setImage_3(false); setRemoveImage_3(false); }
  if (removeImage_4) { setImage_4(false); setRemoveImage_4(false); }

  // toggles
  const [hasVariants, setHasVariants] = useState(false);
  const [hasVariantCombination, setHasVariantCombination] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isOutOfStock, setIsOutOfStock] = useState(false);

  // variants (names & values sets)
  const [variantNamesList, setVariantNamesList] = useState([{ name: '' }]);
  const [variantValuesSets, setVariantValuesSets] = useState([
    [{ name: '', price: '' }]
  ]);

  // combinations (flat array)
  const [variantCombinations, setVariantCombinations] = useState([
    { combinations: '', price: '', availability: true }
  ]);

  // ----- Prefill product data on mount / products change -----
  useEffect(() => {
    if (!products || !products.length || !productId) return;

    const found = products.find(p => String(p.ID) === String(productId) || String(p.productId) === String(productId));
    if (!found) return;

    setProductItemState(found);

    // Basic fields
    setProductID(found.ID ?? null);
    setProductName(found.productName ?? '');
    setProductDescription(found.productDescription ?? '');
    setProductDetails(found.productDetails ?? '');
    setCategoryId(found.categoryId ?? '');
    setDisplayPrice(found.price !== undefined && found.price !== null ? String(found.price) : '');
    setIsBestSeller(Boolean(found.isBestSeller));
    setIsActive(found.isActive === undefined ? true : Boolean(found.isActive));
    setIsOutOfStock(Boolean(found.isOutOfStock));
    setHasVariants(Boolean(found.hasVariant));
    setHasVariantCombination(Boolean(found.hasVariantCombination));
    setUnitType(found.unitType || 'PIECE');
    setPiecesPerBox(found.piecesPerBox !== undefined && found.piecesPerBox !== null ? Number(found.piecesPerBox) : 1);

    // Build variantNamesList (ordered)
    if (Array.isArray(variantName) && variantName.length) {
      if (Array.isArray(found.variantNames) && found.variantNames.length) {
        setVariantNamesList(found.variantNames.map(n => ({ name: String(n) })));
      } else {
        const vnById = {};
        variantName.forEach(vn => { vnById[String(vn.ID)] = vn.name; });

        const usedVnIds = (Array.isArray(productVariantValues) ? productVariantValues.filter(pvv => pvv.productId === found.ID).map(pvv => String(pvv.variantNameId)) : []);
        const orderedUniqueVnIds = [...new Set(usedVnIds)];
        if (orderedUniqueVnIds.length) {
          setVariantNamesList(orderedUniqueVnIds.map(id => ({ name: vnById[id] || '' })));
        } else {
          setVariantNamesList(prev => (prev && prev.length ? prev : [{ name: '' }]));
        }
      }
    } else if (Array.isArray(found.variantNames) && found.variantNames.length) {
      setVariantNamesList(found.variantNames.map(n => ({ name: String(n) })));
    } else {
      setVariantNamesList(prev => (prev && prev.length ? prev : [{ name: '' }]));
    }

    // Build variantValuesSets
    if (Array.isArray(productVariantValues) && productVariantValues.length) {
      const valuesForProduct = productVariantValues.filter(v => String(v.productId) === String(found.ID));
      if (valuesForProduct.length) {
        if (!found.hasVariantCombination) {
          // Non-combination mode: flatten values into a single set
          const singleSet = valuesForProduct.map(v => ({
            name: v.value ?? '',
            price: v.price !== undefined && v.price !== null ? String(v.price) : ''
          }));
          setVariantValuesSets([singleSet]);
        } else {
          // Combination mode: group values by variantNameId
          const groups = {};
          valuesForProduct.forEach(v => {
            const key = String(v.variantNameId);
            groups[key] = groups[key] || [];
            groups[key].push({
              name: v.value ?? '',
              price: v.price !== undefined && v.price !== null ? String(v.price) : ''
            });
          });

          let orderedSets = [];
          const vnById = {};
          (variantName || []).forEach(vn => { vnById[String(vn.ID)] = vn.name; });

          if (Array.isArray(found.variantNames) && found.variantNames.length) {
            const nameToId = {};
            Object.entries(vnById).forEach(([id, name]) => { nameToId[name] = id; });
            orderedSets = found.variantNames.map(name => {
              const id = nameToId[name];
              return groups[id] || [{ name: '', price: '' }];
            });
          } else {
            orderedSets = Object.keys(groups).map(k => groups[k]);
          }

          if (!orderedSets.length) orderedSets = [[{ name: '', price: '' }]];

          setVariantValuesSets(orderedSets);
        }
      }
    } else if (Array.isArray(found.variantValues) && found.variantValues.length) {
      if (!found.hasVariantCombination) {
        setVariantValuesSets([found.variantValues.map(v => ({
          name: v.name ?? '',
          price: v.price !== undefined && v.price !== null ? String(v.price) : ''
        }))]);
      }
    } else {
      setVariantValuesSets(prev => (prev && prev.length ? prev : [[{ name: '', price: '' }]]));
    }

    // Variant combinations
    if (Array.isArray(productVariantCombination) && productVariantCombination.length) {
      const combosForProduct = productVariantCombination.filter(c => String(c.productId) === String(found.ID));
      if (combosForProduct.length) {
        setVariantCombinations(combosForProduct.map(c => ({
          combinations: c.combinations ?? '',
          price: c.price !== undefined && c.price !== null ? String(c.price) : '',
          availability: c.availability === undefined ? true : Boolean(c.availability)
        })));
      }
    } else if (Array.isArray(found.variantCombination) && found.variantCombination.length) {
      setVariantCombinations(found.variantCombination.map(c => ({
        combinations: c.combinations ?? '',
        price: c.price !== undefined && c.price !== null ? String(c.price) : '',
        availability: c.availability === undefined ? true : Boolean(c.availability)
      })));
    } else {
      setVariantCombinations(prev => (prev && prev.length ? prev : [{ combinations: '', price: '', availability: true }]));
    }
  }, [products, productId, variantName, productVariantValues, productVariantCombination]);

  // auto-enable combination if > 1 sets and hasVariants is true
  useEffect(() => {
    if (hasVariants) {
      setHasVariantCombination(variantValuesSets.length >= 2);
    } else {
      setHasVariantCombination(false);
    }
  }, [variantValuesSets, hasVariants]);

  const handleImgCloseButton = (imageIndex) => {
    if (imageIndex === 2) { setImage_2Close(true); setImage_2(false); }
    if (imageIndex === 3) { setImage_3Close(true); setImage_3(false); }
    if (imageIndex === 4) { setImage_4Close(true); setImage_4(false); }
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
      [{ name: '', price: '' }]
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
      copy[setIndex].push({ name: '', price: '' });
      return copy;
    });
  };

  const removeVariantValue = (setIndex, valueIndex) => {
    setVariantValuesSets(prev => {
      const copy = [...prev];
      if (!copy[setIndex]) return copy;
      if (copy[setIndex].length <= 1) return copy;
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

  const addVariantCombination = () => {
    setVariantCombinations(prev => [
      ...prev,
      { combinations: '', price: '', availability: true }
    ]);
  };

  const removeVariantCombination = (index) => {
    setVariantCombinations(prev => {
      if (prev.length <= 1) return prev;
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
          [{ name: '', price: '' }]
        ]);
        setVariantNamesList(prev => [...prev, { name: '' }]);
      }
    } else {
      setVariantValuesSets(prev => [prev[0] || [{ name: '', price: '' }]]);
      setVariantNamesList(prev => [prev[0] || { name: '' }]);
      setVariantCombinations([{ combinations: '', price: '', availability: true }]);
    }
  };

  const handleDecimalInput = (raw) => {
    if (raw === undefined || raw === null) return '';
    if (/^[0-9]*\.?[0-9]*$/.test(raw)) {
      return raw;
    }
    return raw.slice(0, -1);
  };

  // ----- Submit (Update) -----
  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasAtLeastOneImage = image_1 || image_2 || image_3 || image_4 || (productItemState && (productItemState.image1 || productItemState.image2 || productItemState.image3 || productItemState.image4));
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
    if (unitType === 'BOX' && (!piecesPerBox || Number(piecesPerBox) < 1)) {
      toast.error('Pieces per box must be at least 1.', { ...toastError });
      return;
    }

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
        value.price.trim() !== ""
      );
      if (!hasAtLeastOneValidValue) {
        toast.error("Please add at least ONE complete Variant Value (Name, Price).", { ...toastError });
        return;
      }
      const hasBlankRow = variantValueSet.some(value =>
        value.name.trim() === "" ||
        value.price.trim() === ""
      );
      if (hasBlankRow) {
        toast.error("You added a new Variant Value but left it blank. Please fill it or delete it.", { ...toastError });
        return;
      }

      const variantNames = variantNamesList.map(v => v.name).filter(Boolean);
      const values = (variantValuesSets[0] || []).map(v => {
        return {
          variantName: variantNames[0] || '',
          name: v.name,
          price: v.price === '' ? null : Number(v.price)
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
        availability: !!combo.availability
      }));
      finalVariantNames = variantNames;
      finalVariantValues = flatVariantValues;
      finalVariantCombinations = combos;
    }

    const formData = new FormData();
    if (productID) formData.append('productID', productID);

    formData.append('categoryId', Number(categoryId));
    formData.append('productName', productName);
    formData.append('productDescription', productDescription);
    formData.append('productDetails', productDetails || '');
    formData.append('price', displayPrice === '' ? null : Number(displayPrice));
    formData.append('unitType', unitType);
    formData.append('piecesPerBox', unitType === 'BOX' ? Number(piecesPerBox) : 1);
    
    // image_1
    if (image_1) {
      formData.append('image1', image_1);
    } else {
      formData.append('image1', productItemState?.image1 || '');
    }

    // image_2
    if ((image_2 && image_2Close) || (image_2 && !image_2Close)) {
      formData.append('image2', image_2);
    } else if (image_2Close && !image_2) {
      formData.append('image2', null);
    } else {
      formData.append('image2', productItemState?.image2 || '');
    }

    // image_3
    if ((image_3 && image_3Close) || (image_3 && !image_3Close)) {
      formData.append('image3', image_3);
    } else if (image_3Close && !image_3) {
      formData.append('image3', null);
    } else {
      formData.append('image3', productItemState?.image3 || '');
    }

    // image_4
    if ((image_4 && image_4Close) || (image_4 && !image_4Close)) {
      formData.append('image4', image_4);
    } else if (image_4Close && !image_4) {
      formData.append('image4', null);
    } else {
      formData.append('image4', productItemState?.image4 || '');
    }

    formData.append('isBestSeller', isBestSeller);
    formData.append('isActive', isActive);
    formData.append('isOutOfStock', isOutOfStock);
    formData.append('hasVariant', hasVariants);
    formData.append('hasVariantCombination', hasVariantCombination);
    formData.append('variantNames', JSON.stringify(finalVariantNames || []));
    formData.append('variantValues', JSON.stringify(finalVariantValues || []));
    formData.append('variantCombination', JSON.stringify(finalVariantCombinations || []));

    setLoading(true);
    const update = await updateProduct(formData);
    
    if (update) {
      setTimeout(() => {
        window.location.href = "/products/totalproduct";
      }, 500);
    }

    setLoading(false);
  };

  const handleDelete = async (ID) => {
    setLoading(true);
    const success = await deleteProduct(ID);
    if (success) {
      setTimeout(() => {
        window.location.href = "/products/totalproduct";
      }, 500);
    }
    setLoading(false);
  };

  const existingImage1 = productItemState?.image1 || productItemState?.images?.[0] || null;
  const existingImage2 = productItemState?.image2 || null;
  const existingImage3 = productItemState?.image3 || null;
  const existingImage4 = productItemState?.image4 || null;

  return (
    <>
      {loading && <Loading />}
      <Navbar TitleName="Update Product" />
      <div className="upp-page">
        <div className="upp-container">
          <div className="upp-header">
            <button onClick={() => window.history.back()} className="upp-back">
              <FaArrowLeft />
            </button>
            <h1 className="upp-title">Back</h1>
          </div>

          <form onSubmit={handleSubmit} className="upp-form">
            <section className="upp-card">
              <div className="upp-form-group">
                <label>Product Name</label>
                <input className="upp-input" type="text" value={productName}
                  onChange={(e) => setProductName(e.target.value)} placeholder="Enter product name" required />
              </div>

              <div className="upp-form-group">
                <label>Product Description</label>
                <textarea className="upp-input upp-pd" value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)} placeholder="Provide a brief product description" required />
              </div>

              <div className="upp-form-group">
                <label>Product Details</label>
                <textarea className="upp-textarea" rows="4" value={productDetails}
                  onChange={(e) => setProductDetails(e.target.value)} placeholder="Enter detailed product information (optional)" />
              </div>

              <div className="upp-form-group">
                <label>Product Category</label>
                <select
                  className="upp-select"
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

              <div className="upp-form-group">
                <label>Display Price</label>
                <input
                  className="upp-input upp-price-input"
                  type="text"
                  inputMode="decimal"
                  value={displayPrice}
                  onChange={(e) => setDisplayPrice(handleDecimalInput(e.target.value))}
                  placeholder="₱1000"
                  required
                />
              </div>

              <div className="upp-form-group">
                <label>Unit Type</label>
                <select
                  className="upp-select"
                  value={unitType}
                  onChange={(e) => {
                    setUnitType(e.target.value);
                    if (e.target.value === 'PIECE') setPiecesPerBox(1);
                  }}
                >
                  <option value="PIECE">Per Piece</option>
                  <option value="BOX">Per Box</option>
                </select>
              </div>

              {unitType === 'BOX' && (
                <div className="upp-form-group">
                  <label>Pieces Per Box</label>
                  <input
                    className="upp-input"
                    type="number"
                    min="1"
                    value={piecesPerBox}
                    onChange={(e) => setPiecesPerBox((e.target.value))}
                    placeholder="e.g. 7"
                    required
                  />
                </div>
              )}

              <div className="upp-checkbox-row">
                <label className="upp-checkbox-inline">
                  <input type="checkbox" checked={hasVariants} onChange={(e) => setHasVariants(e.target.checked)} />
                  This product has variants
                </label>
              </div>

              {hasVariants && (
                <label className="upp-checkbox-inline">
                  <input type="checkbox" checked={hasVariantCombination} onChange={(e) => handleVariantCombinationToggle(e.target.checked)} />This product has variant combination
                </label>
              )}
            </section>

            {/* Variants block */}
            {hasVariants && (
              <section className="upp-card upp-variant-card">
                {variantValuesSets.map((valueSet, setIndex) => (
                  <div key={setIndex} className="upp-variant-values-set">
                    <div className="upp-variant-set-header">
                      {hasVariantCombination && variantValuesSets.length > 1 && (
                        <button type="button" className="upp-btn-remove" onClick={() => removeVariantValuesSet(setIndex)}>
                          <FaTrash className='upp-btn-remove-icon' />
                        </button>
                      )}
                    </div>

                    <div className="upp-variant-name-row">
                      <p className="upp-vn-title">Variant Name</p>
                      <input
                        className="upp-input"
                        type="text"
                        value={variantNamesList[setIndex]?.name || ""}
                        onChange={(e) => updateVariantName(setIndex, e.target.value)}
                        placeholder="e.g., Size, Color"
                      />
                    </div>

                    {/* Variant Values */}
                    {valueSet.map((value, valueIndex) => (
                      <div key={valueIndex} className="upp-variant-value-row">
                        <div className="upp-small-title">Variant Value {valueIndex + 1}</div>

                        <div className={hasVariantCombination ? "upp-grid-1" : "upp-grid-2"}>
                          <div className="upp-form-group">
                            <label>Name</label>
                            <input
                              className="upp-input"
                              type="text"
                              value={value.name}
                              onChange={(e) => updateVariantValue(setIndex, valueIndex, "name", e.target.value)}
                              placeholder="Value Name"
                            />
                          </div>

                          {!hasVariantCombination && (
                            <div className="upp-form-group">
                              <label>Price</label>
                              <input
                                className="upp-input upp-price-input"
                                type="text"
                                inputMode="decimal"
                                value={value.price}
                                onChange={(e) => updateVariantValue(setIndex, valueIndex, "price", handleDecimalInput(e.target.value))}
                                placeholder='₱500'
                              />
                            </div>
                          )}
                        </div>

                        <div className="upp-value-actions">
                          {valueIndex === valueSet.length - 1 ? (
                            <div className='upp-vv-btn-ctn'>
                              <button type="button" className="upp-btn upp-btn-primary upp-btn-new" onClick={() => addVariantValue(setIndex)}>
                                <FaPlus /> New Value
                              </button>

                              <button type="button" className="upp-btn-remove-vv-double" onClick={() => removeVariantValue(setIndex, valueIndex)}>
                                <FaTrash />
                              </button>
                            </div>
                          ) : (
                            <button type="button" className="upp-btn upp-btn-remove-vv-solo" onClick={() => removeVariantValue(setIndex, valueIndex)}>
                              <FaTrash /> Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                {hasVariantCombination && (
                  <button type="button" className="upp-avv-btn" onClick={addVariantValuesSet}>+ Add New Variant Value Set</button>
                )}
              </section>
            )}

            {/* Variant Combination */}
            {hasVariantCombination && variantValuesSets.length >= 2 && (
              <section className='upp-card upp-variant-combo-card'>
                <div className="upp-combo-card">
                  <div className="upp-combo-header">
                    <p className='upp-combo-title'>Variant Combination</p>
                    <div className="upp-combo-actions">
                      <button type="button" className="upp-combo-btn-deleteall"
                        onClick={() => {
                          setVariantCombinations([{ combinations: '', price: '', availability: true }]);
                        }}>
                        Delete All
                      </button>
                    </div>
                  </div>

                  <div className="upp-combo-list">
                    {variantCombinations.map((combo, idx) => (
                      <div key={idx} className={`upp-combo-row ${!combo.availability ? "upp-disabled" : ""}`}>
                        <div className="upp-combo-col upp-combo-big">
                          <input className="upp-input" type="text" value={combo.combinations} disabled={!combo.availability}
                            onChange={(e) => updateVariantCombination(idx, 'combinations', e.target.value)} placeholder="Combined Variant Value (e.g., S, Blue)" />
                        </div>

                        <div className="upp-combo-col upp-combo-small">
                          <input className="upp-input" type="text" inputMode="decimal" value={combo.price} disabled={!combo.availability} onChange={(e) => updateVariantCombination(idx, 'price', handleDecimalInput(e.target.value))} placeholder="Price" />
                        </div>

                        <div className="upp-combo-col upp-toggle-col">
                          <label className="upp-switch">
                            <input type="checkbox" checked={combo.availability} onChange={() => toggleCombinationAvailability(idx)} />
                            <span className="upp-slider" />
                          </label>
                        </div>

                        <button type="button" className="upp-combo-delete-single" onClick={() => removeVariantCombination(idx)}>
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="button" className="upp-combo-avc-btn" onClick={addVariantCombination}>+ Add New Combination</button>
              </section>
            )}

            {/* Image Upload */}
            <section className="upp-card">
              <h2 className="upp-heading">Upload Image</h2>
              <div className="upp-upload-grid">
                {/* IMAGE 1 */}
                <div className={`upp-main-img-container ${(image_1 || existingImage1) ? 'upp-uploaded' : ''}`}>
                  <label htmlFor="image_1" className="upp-img-label">
                    <div className="upp-img-container">
                      <img
                        className="upp-image-con"
                        src={image_1 ? URL.createObjectURL(image_1) : (existingImage1 || assets.image_upload_icon)}
                        alt=""
                      />
                    </div>
                    <input type="file" id="image_1" hidden onChange={(e) => setImage_1(e.target.files[0])}/>
                  </label>
                </div>

                {/* IMAGE 2 */}
                <div className={`upp-main-img-container ${(image_2 || existingImage2) && !image_2Close ? 'upp-uploaded' : ''}`}>
                  <p
                    onClick={() => image_2 ? setImage_2(false) : handleImgCloseButton(2)}
                    className={`upp-img-remove-btn ${(image_2 || (existingImage2 && !image_2Close)) ? '' : 'upp-hidden'}`}
                  >
                    <FaTrash />
                  </p>
                  <label htmlFor="image_2" className="upp-img-label">
                    <div className="upp-img-container">
                      <img
                        className="upp-image-con"
                        src={
                          image_2
                            ? URL.createObjectURL(image_2)
                            : (existingImage2 && !image_2Close ? existingImage2 : assets.image_upload_icon)
                        }
                        alt=""
                      />
                    </div>
                    <input type="file" id="image_2" hidden onChange={(e) => setImage_2(e.target.files[0])}/>
                  </label>
                </div>

                {/* IMAGE 3 */}
                <div className={`upp-main-img-container ${(image_3 || existingImage3) && !image_3Close ? 'upp-uploaded' : ''}`}>
                  <p
                    onClick={() => image_3 ? setImage_3(false) : handleImgCloseButton(3)}
                    className={`upp-img-remove-btn ${(image_3 || (existingImage3 && !image_3Close)) ? '' : 'upp-hidden'}`}
                  >
                    <FaTrash />
                  </p>
                  <label htmlFor="image_3" className="upp-img-label">
                    <div className="upp-img-container">
                      <img
                        className="upp-image-con"
                        src={
                          image_3
                            ? URL.createObjectURL(image_3)
                            : (existingImage3 && !image_3Close ? existingImage3 : assets.image_upload_icon)
                        }
                        alt=""
                      />
                    </div>
                    <input type="file" id="image_3" hidden onChange={(e) => setImage_3(e.target.files[0])}/>
                  </label>
                </div>

                {/* IMAGE 4 */}
                <div className={`upp-main-img-container ${(image_4 || existingImage4) && !image_4Close ? 'upp-uploaded' : ''}`}>
                  <p
                    onClick={() => image_4 ? setImage_4(false) : handleImgCloseButton(4)}
                    className={`upp-img-remove-btn ${(image_4 || (existingImage4 && !image_4Close)) ? '' : 'upp-hidden'}`}
                  >
                    <FaTrash />
                  </p>
                  <label htmlFor="image_4" className="upp-img-label">
                    <div className="upp-img-container">
                      <img
                        className="upp-image-con"
                        src={
                          image_4
                            ? URL.createObjectURL(image_4)
                            : (existingImage4 && !image_4Close ? existingImage4 : assets.image_upload_icon)
                        }
                        alt=""
                      />
                    </div>
                    <input type="file" id="image_4" hidden onChange={(e) => setImage_4(e.target.files[0])}/>
                  </label>
                </div>
              </div>
            </section>

            {/* toggles & submit */}
            <section className="upp-card">
              <div className="upp-toggle-list">
                <label className="upp-toggle-row">
                  <input type="checkbox" checked={isActive} onChange={() => setIsActive(!isActive)} />
                  Mark as Active
                </label>
                <label className="upp-toggle-row">
                  <input type="checkbox" checked={isBestSeller} onChange={() => setIsBestSeller(!isBestSeller)} />
                  Mark as Best Seller
                </label>
                <label className="upp-toggle-row">
                  <input type="checkbox" checked={isOutOfStock} onChange={() => setIsOutOfStock(!isOutOfStock)} />
                  Mark as Out of Stock
                </label>
              </div>

              <div className="upp-actions" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                <button type="submit" className="upp-btn-submit">Save Changes</button>

                <button type="button" className="upp-delete-btn" onClick={() => handleDelete(productID)} style={{ marginRight: 'auto' }}>
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