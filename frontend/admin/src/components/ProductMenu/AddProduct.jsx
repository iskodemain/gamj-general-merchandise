import React, { useState } from 'react';
import './addProduct.css';
import { FaPlus, FaTrash, FaArrowLeft } from 'react-icons/fa';
function AddProduct() {
  const [hasVariants, setHasVariants] = useState(false);
  const [isBestSelling, setIsBestSelling] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [variants, setVariants] = useState([{ name: '', values: [{ name: '', price: '', stock: '' }] }]);
  
  const addVariantValue = (variantIndex) => {
    setVariants(prev => {
      const newVariants = prev.map(v => ({ ...v, values: v.values.map(x => ({ ...x })) }));
      newVariants[variantIndex].values.push({ name: '', price: '', stock: '' });
      return newVariants;
    });
  };
  
  const deleteVariantValue = (variantIndex, valueIndex) => {
    setVariants(prev => {
      return prev.map((v, vi) => {
        if (vi !== variantIndex) return v;
        const newValues = v.values.filter((_, idx) => idx !== valueIndex);
        // ensure at least one value remains
        return { ...v, values: newValues.length ? newValues : [{ name: '', price: '', stock: '' }] };
      });
    });
  };

  const addNewVariant = () => {
    setVariants(prev => [...prev, { name: '', values: [{ name: '', price: '', stock: '' }] }]);
  };

  return (
    <div className="add-product-container">
      <div className="product-form-card">
        
        <section className="form-section">
          <div className="section-header">
            <button
              type="button"
              className="plc-back"
              onClick={() => window.history.back()}
              aria-label="Back"
            >
              <FaArrowLeft />
            </button>
            <h2 className="section-title">Upload Image</h2>
          </div>
           <div className="upload-grid">
             {[1, 2, 3, 4].map(index => (
               <div key={index} className="upload-box">
                 <FaPlus className="upload-icon" />
                 <p className="upload-text">Upload 500x500</p>
               </div>
             ))}
           </div>
         </section>
        
        <section className="form-section">
          <div className="form-group">
            <label htmlFor="productName">Product Name</label>
            <input 
              type="text" 
              id="productName" 
              placeholder="Enter product name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="productDescription">Product Description</label>
            <input 
              type="text" 
              id="productDescription" 
              placeholder="Provide a brief product description"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="productDetails">Product Details</label>
            <textarea 
              id="productDetails" 
              rows="4"
              placeholder="Enter detailed product information (e.g., materials, dimensions, instructions)"
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="productCategory">Product Category</label>
            <div className="custom-select">
              <select id="productCategory">
                <option value="">Select Category</option>
                <option value="medical">Medical Supplies</option>
                <option value="equipment">Medical Equipment</option>
                <option value="pharmacy">Pharmacy Items</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="displayStock">Display Stock</label>
              <input 
                type="number" 
                id="displayStock" 
                placeholder="250"
                defaultValue="250"
              />
            </div>
            
            <div className="form-group half">
              <label htmlFor="displayPrice">Display Price</label>
              <div className="price-input">
                <span className="currency">₱</span>
                <input 
                  type="number" 
                  id="displayPrice" 
                  placeholder="1000"
                  defaultValue="1000"
                />
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label>Expiration Date</label>
            <div className="date-select-row">
              <div className="date-select">
                <select>
                  <option value="">Month</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
              
              <div className="date-select">
                <select>
                  <option value="">Day</option>
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
              
              <div className="date-select">
                <select>
                  <option value="">Year</option>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <div className="checkbox-container">
              <input 
                type="checkbox" 
                id="hasVariants" 
                checked={hasVariants}
                onChange={() => setHasVariants(!hasVariants)}
              />
              <label htmlFor="hasVariants" className="checkbox-label">This product has variants</label>
            </div>
          </div>
          
          {hasVariants && (
            <div className="variants-container">
              {variants.map((variant, variantIndex) => (
                <div key={variantIndex} className="variant-section">
                  <div className="form-group">
                    <label htmlFor={`variantName-${variantIndex}`}>Variant Name</label>
                    <input 
                      type="text" 
                      id={`variantName-${variantIndex}`} 
                      placeholder="Product Variant Name"
                      value={variant.name}
                      onChange={(e) => {
                        const newVariants = [...variants];
                        newVariants[variantIndex].name = e.target.value;
                        setVariants(newVariants);
                      }}
                    />
                  </div>
                  
                  {variant.values.map((value, valueIndex) => {
                    const isLastValue = valueIndex === variant.values.length - 1;
                    return (
                      <div key={valueIndex} className="variant-value-section">
                        <h3 className="value-title">Variant Value {valueIndex + 1}</h3>
                        <div className="form-row">
                          <div className="form-group third">
                            <label htmlFor={`valueName-${variantIndex}-${valueIndex}`}>Name</label>
                            <input 
                              type="text" 
                              id={`valueName-${variantIndex}-${valueIndex}`} 
                              placeholder="Value Name"
                              value={value.name}
                              onChange={(e) => {
                                setVariants(prev => {
                                  const copy = prev.map(v => ({ ...v, values: v.values.map(x => ({ ...x })) }));
                                  copy[variantIndex].values[valueIndex].name = e.target.value;
                                  return copy;
                                });
                              }}
                            />
                          </div>
                          
                          <div className="form-group third">
                            <label htmlFor={`valuePrice-${variantIndex}-${valueIndex}`}>Price</label>
                            <div className="price-input">
                              <span className="currency">₱</span>
                              <input 
                                type="number" 
                                id={`valuePrice-${variantIndex}-${valueIndex}`} 
                                placeholder="Value Price"
                                value={value.price}
                                onChange={(e) => {
                                  setVariants(prev => {
                                    const copy = prev.map(v => ({ ...v, values: v.values.map(x => ({ ...x })) }));
                                    copy[variantIndex].values[valueIndex].price = e.target.value;
                                    return copy;
                                  });
                                }}
                              />
                            </div>
                          </div>
                          
                          <div className="form-group third">
                            <label htmlFor={`valueStock-${variantIndex}-${valueIndex}`}>Stock</label>
                            <input 
                              type="number" 
                              id={`valueStock-${variantIndex}-${valueIndex}`} 
                              placeholder="Value Stock"
                              value={value.stock}
                              onChange={(e) => {
                                setVariants(prev => {
                                  const copy = prev.map(v => ({ ...v, values: v.values.map(x => ({ ...x })) }));
                                  copy[variantIndex].values[valueIndex].stock = e.target.value;
                                  return copy;
                                });
                              }}
                            />
                          </div>
                        </div>
                        
                        <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                          <div>
                            <label>Expiration Date</label>
                            <div className="date-select-row">
                              <div className="date-select">
                                <select>
                                  <option value="">Month</option>
                                  {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i} value={i + 1}>{i + 1}</option>
                                  ))}
                                </select>
                              </div>
                              
                              <div className="date-select">
                                <select>
                                  <option value="">Day</option>
                                  {Array.from({ length: 31 }, (_, i) => (
                                    <option key={i} value={i + 1}>{i + 1}</option>
                                  ))}
                                </select>
                              </div>
                              
                              <div className="date-select">
                                <select>
                                  <option value="">Year</option>
                                  {Array.from({ length: 10 }, (_, i) => {
                                    const year = new Date().getFullYear() + i;
                                    return <option key={year} value={year}>{year}</option>;
                                  })}
                                </select>
                              </div>
                            </div>
                          </div>

                          {isLastValue ? (
                            <button 
                              type="button" 
                              className="btn btn-new-value"
                              onClick={() => addVariantValue(variantIndex)}
                            >
                              <FaPlus /> New Value
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-delete-value"
                              onClick={() => deleteVariantValue(variantIndex, valueIndex)}
                            >
                              <FaTrash /> Delete
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                 
                </div>
              ))}
              
              <button 
                type="button" 
                className="btn btn-add-variant"
                onClick={addNewVariant}
              >
                Add New Variant
              </button>
            </div>
          )}
          
          <div className="toggle-group">
            <div className="toggle-container">
              <label className="toggle-label">Mark as best-selling product</label>
              <div className={`toggle-switch ${isBestSelling ? 'active' : ''}`} onClick={() => setIsBestSelling(!isBestSelling)}>
                <div className="toggle-slider"></div>
              </div>
            </div>
            
            <div className="toggle-container">
              <label className="toggle-label">Mark as available</label>
              <div className={`toggle-switch ${isAvailable ? 'active' : ''}`} onClick={() => setIsAvailable(!isAvailable)}>
                <div className="toggle-slider"></div>
              </div>
            </div>
          </div>
        </section>
        
        <button type="submit" className="btn-add-item">ADD ITEM</button>
      </div>
    </div>
  );
}

export default AddProduct;