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
  const { productId } = useParams(); // expects route like /products/update/:id
  const [loading, setLoading] = useState(false);

  // product holder (full object from products list)
  const [productItemState, setProductItemState] = useState(null);

  // basic product state
  const [productID, setProductID] = useState(null); // will hold numeric ID from product
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productDetails, setProductDetails] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [displayPrice, setDisplayPrice] = useState('');
  const [displayStock, setDisplayStock] = useState('');
  const [expirationDate, setExpirationDate] = useState({ month: '', day: '', year: '' });

  // --- IMAGE STATES (copied pattern from your Update.jsx)
  const [image_1, setImage_1] = useState(false);
  const [image_2, setImage_2] = useState(false);
  const [image_3, setImage_3] = useState(false);
  const [image_4, setImage_4] = useState(false);

  // flags to indicate user clicked the "close" on an existing remote image
  const [image_2Close, setImage_2Close] = useState(false);
  const [image_3Close, setImage_3Close] = useState(false);
  const [image_4Close, setImage_4Close] = useState(false);

  // convenience remove toggles (keeps parity with your Add.jsx pattern)
  const [removeImage_2, setRemoveImage_2] = useState(false);
  const [removeImage_3, setRemoveImage_3] = useState(false);
  const [removeImage_4, setRemoveImage_4] = useState(false);

  // auto clear when remove flags set (same small pattern used in Add.jsx)
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
    [{ name: '', price: '', stock: '', expirationDate: { month: '', day: '', year: '' } }]
  ]);

  // combinations (flat array)
  const [variantCombinations, setVariantCombinations] = useState([
    { combinations: '', price: '', stock: '', availability: true }
  ]);

  // ----- Prefill product data on mount / products change -----
  useEffect(() => {
  if (!products || !products.length || !productId) return;

  // find product by numeric ID or productId string
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
  setDisplayStock(found.stockQuantity !== undefined && found.stockQuantity !== null ? String(found.stockQuantity) : '');
  setIsBestSeller(Boolean(found.isBestSeller));
  setIsActive(found.isActive === undefined ? true : Boolean(found.isActive));
  setIsOutOfStock(Boolean(found.isOutOfStock));
  setHasVariants(Boolean(found.hasVariant));
  setHasVariantCombination(Boolean(found.hasVariantCombination));

  // Expiration date parsing if present
  if (found.expirationDate) {
    try {
      const d = new Date(found.expirationDate);
      if (!Number.isNaN(d.getTime())) {
        setExpirationDate({
          month: String(d.getMonth() + 1),
          day: String(d.getDate()),
          year: String(d.getFullYear())
        });
      } else {
        setExpirationDate({ month: '', day: '', year: '' });
      }
    } catch (err) {
      setExpirationDate({ month: '', day: '', year: '' });
    }
  } else {
    setExpirationDate({ month: '', day: '', year: '' });
  }

  // Build variantNamesList (ordered)
  if (Array.isArray(variantName) && variantName.length) {
    if (Array.isArray(found.variantNames) && found.variantNames.length) {
      setVariantNamesList(found.variantNames.map(n => ({ name: String(n) })));
    } else {
      const vnById = {};
      variantName.forEach(vn => { vnById[String(vn.ID)] = vn.name; });

      // If productVariantValues exist, derive used variantNameIds for this product
      const usedVnIds = (Array.isArray(productVariantValues) ? productVariantValues.filter(pvv => pvv.productId === found.ID).map(pvv => String(pvv.variantNameId)) : []);
      // Remove duplicates and keep order
      const orderedUniqueVnIds = [...new Set(usedVnIds)];
      if (orderedUniqueVnIds.length) {
        setVariantNamesList(orderedUniqueVnIds.map(id => ({ name: vnById[id] || '' })));
      } else {
        // fallback: single empty name slot
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
    // filter values for this product
    const valuesForProduct = productVariantValues.filter(v => String(v.productId) === String(found.ID));
    if (valuesForProduct.length) {
      if (!found.hasVariantCombination) {
        // Non-combination mode: flatten values into a single set
        const singleSet = valuesForProduct.map(v => ({
          name: v.value ?? '',
          price: v.price !== undefined && v.price !== null ? String(v.price) : '',
          stock: v.stock !== undefined && v.stock !== null ? String(v.stock) : '',
          expirationDate: v.expirationDate ? (() => {
            const dt = new Date(v.expirationDate);
            if (!Number.isNaN(dt.getTime())) {
              return { month: String(dt.getMonth() + 1), day: String(dt.getDate()), year: String(dt.getFullYear()) };
            }
            return { month: '', day: '', year: '' };
          })() : { month: '', day: '', year: '' }
        }));
        setVariantValuesSets([singleSet]);
      } else {
        // Combination mode: group values by variantNameId and order groups to match variantNamesList
        // Build map: variantNameId -> [values]
        const groups = {};
        valuesForProduct.forEach(v => {
          const key = String(v.variantNameId);
          groups[key] = groups[key] || [];
          groups[key].push({
            name: v.value ?? '',
            price: v.price !== undefined && v.price !== null ? String(v.price) : '',
            stock: v.stock !== undefined && v.stock !== null ? String(v.stock) : '',
            expirationDate: v.expirationDate ? (() => {
              const dt = new Date(v.expirationDate);
              if (!Number.isNaN(dt.getTime())) {
                return { month: String(dt.getMonth() + 1), day: String(dt.getDate()), year: String(dt.getFullYear()) };
              }
              return { month: '', day: '', year: '' };
            })() : { month: '', day: '', year: '' }
          });
        });

        // Order groups by variantNamesList if we have it, else use the keys order
        let orderedSets = [];
        const vnById = {};
        (variantName || []).forEach(vn => { vnById[String(vn.ID)] = vn.name; });

        if (Array.isArray(found.variantNames) && found.variantNames.length) {
          // If found.variantNames is a list of names, try to map them back to IDs via vnById reverse lookup
          const nameToId = {};
          Object.entries(vnById).forEach(([id, name]) => { nameToId[name] = id; });
          orderedSets = found.variantNames.map(name => {
            const id = nameToId[name];
            return groups[id] || [{ name: '' , price: '', stock:'', expirationDate: { month:'', day:'', year:'' } }];
          });
        } else {
          // fallback: iterate keys found in groups (stable order)
          orderedSets = Object.keys(groups).map(k => groups[k]);
        }

        // Ensure at least one set exists
        if (!orderedSets.length) orderedSets = [[{ name: '', price: '', stock: '', expirationDate: { month:'', day:'', year:'' } }]];

        setVariantValuesSets(orderedSets);
      }
    }
  } else if (Array.isArray(found.variantValues) && found.variantValues.length) {
    // fallback for older shape: flat variantValues on found object
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
    }
  } else {
    // Leave default (single empty set) if nothing available
    setVariantValuesSets(prev => (prev && prev.length ? prev : [[{ name:'', price:'', stock:'', expirationDate:{ month:'', day:'', year:'' } }]]));
  }

  // Variant combinations (productVariantCombination context or found.variantCombination)
  if (Array.isArray(productVariantCombination) && productVariantCombination.length) {
    const combosForProduct = productVariantCombination.filter(c => String(c.productId) === String(found.ID));
    if (combosForProduct.length) {
      setVariantCombinations(combosForProduct.map(c => ({
        combinations: c.combinations ?? '',
        price: c.price !== undefined && c.price !== null ? String(c.price) : '',
        stock: c.stock !== undefined && c.stock !== null ? String(c.stock) : '',
        availability: c.availability === undefined ? true : Boolean(c.availability)
      })));
    }
  } else if (Array.isArray(found.variantCombination) && found.variantCombination.length) {
    setVariantCombinations(found.variantCombination.map(c => ({
      combinations: c.combinations ?? '',
      price: c.price !== undefined && c.price !== null ? String(c.price) : '',
      stock: c.stock !== undefined && c.stock !== null ? String(c.stock) : '',
      availability: c.availability === undefined ? true : Boolean(c.availability)
    })));
  } else {
    // keep default
    setVariantCombinations(prev => (prev && prev.length ? prev : [{ combinations:'', price:'', stock:'', availability:true }]));
  }

  }, [products, productId, variantName, productVariantValues, productVariantCombination]);


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

  // ----- Image helper: handle close button for existing images (2..4)
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
    if (productID) formData.append('productID', productID);

    formData.append('categoryId', Number(categoryId));
    formData.append('productName', productName);
    formData.append('productDescription', productDescription);
    formData.append('productDetails', productDetails || '');
    formData.append('price', displayPrice === '' ? null : Number(displayPrice));
    
    // image_1
    if (image_1) {
      formData.append('image1', image_1);
    } else {
      // if productItemState exists, append existing cloud url so backend keeps it
      formData.append('image1', productItemState?.image1 || '');
    }

    // image_2
    if ((image_2 && image_2Close) || (image_2 && !image_2Close)) {
      formData.append('image2', image_2);
    } else if (image_2Close && !image_2) {
      formData.append('image2', null); // request backend to remove
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

    console.log("FormData:", Object.fromEntries(formData));

    setLoading(true);
    await updateProduct(formData);
    setLoading(false);

    navigate('/products/totalproduct');
  };

  // ----- Delete handler (if AdminContext provides deleteProduct) -----
  const handleDelete = async () => {
    if (!window.confirm("Delete this product? This action cannot be undone.")) return;
  };

  // --- render
  // convenience existing images (cloud urls) for template
  const existingImage1 = productItemState?.image1 || productItemState?.images?.[0] || null;
  const existingImage2 = productItemState?.image2 || null;
  const existingImage3 = productItemState?.image3 || null;
  const existingImage4 = productItemState?.image4 || null;

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
                 {/* IMAGE 1 */}
                <div className={`main-img-container ${(image_1 || existingImage1) ? 'uploaded' : ''}`}>
                  <label htmlFor="image_1" className="img-label">
                    <div className="img-container">
                      <img
                        className="image-con"
                        src={image_1 ? URL.createObjectURL(image_1) : (existingImage1 || assets.image_upload_icon)}
                        alt=""
                      />
                    </div>
                    <input type="file" id="image_1" hidden onChange={(e) => setImage_1(e.target.files[0])}/>
                  </label>
                </div>

                {/* IMAGE 2 */}
                <div className={`main-img-container ${(image_2 || existingImage2) ? 'uploaded' : ''}`}>
                  <p
                    onClick={() => image_2 ? setImage_2(false) : handleImgCloseButton(2)}
                    className={`img-remove-btn ${(image_2 || existingImage2) ? '' : 'hidden'}`}
                  >
                    <FaTrash />
                  </p>

                  <label htmlFor="image_2" className="img-label">
                    <div className="img-container">
                      <img
                        className="image-con"
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
                <div className={`main-img-container ${(image_3 || existingImage3) ? 'uploaded' : ''}`}>
                  <p
                    onClick={() => image_3 ? setImage_3(false) : handleImgCloseButton(3)}
                    className={`img-remove-btn ${(image_3 || existingImage3) ? '' : 'hidden'}`}
                  >
                    <FaTrash />
                  </p>

                  <label htmlFor="image_3" className="img-label">
                    <div className="img-container">
                      <img
                        className="image-con"
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
                <div className={`main-img-container ${(image_4 || existingImage4) ? 'uploaded' : ''}`}>
                  <p
                    onClick={() => image_4 ? setImage_4(false) : handleImgCloseButton(4)}
                    className={`img-remove-btn ${(image_4 || existingImage4) ? '' : 'hidden'}`}
                  >
                    <FaTrash />
                  </p>

                  <label htmlFor="image_4" className="img-label">
                    <div className="img-container">
                      <img
                        className="image-con"
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
                <button type="submit" className="btn-submit">Save Changes</button>


                {/* Delete button (left) */}
                <button type="button" className="upp-delete-btn" onClick={handleDelete} style={{ marginRight: 'auto' }}>
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
