import { useState, useContext, useEffect } from "react";
import "./AddStock.css";
import Navbar from "../Navbar";
import { AdminContext } from "../../context/AdminContextProvider";
import Loading from "../Loading";
import { FaArrowLeft } from "react-icons/fa6";
import { toast } from "react-toastify";

export default function AddStock() {
  const {
    navigate,
    products,
    productVariantValues,
    productVariantCombination,
    addStock,
    toastError
  } = useContext(AdminContext);

  // Form state
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedVariantValue, setSelectedVariantValue] = useState("");
  const [selectedVariantCombo, setSelectedVariantCombo] = useState("");
  const [quantityReceived, setQuantityReceived] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [supplier, setSupplier] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [manufacturingDate, setManufacturingDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("");


  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Get product details
  const selectedProductData = products.find(p => p.ID === Number(selectedProduct));
  const hasVariants = selectedProductData?.hasVariant;
  const hasVariantCombination = selectedProductData?.hasVariantCombination;

  // Reset variant inputs when product changes
  useEffect(() => {
    setSelectedVariantValue("");
    setSelectedVariantCombo("");
  }, [selectedProduct]);

  // Auto-generate batch number
  useEffect(() => {
    if (selectedProduct) {
        const timestamp = Date.now();
        const productCode = selectedProductData?.productId || "PROD";
        setBatchNumber(`BATCH-${productCode}-${timestamp}`);
    }
  }, [selectedProduct]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Validation
  const validateForm = () => {
    if (!selectedProduct) {
      toast.error("Please select a product", { ...toastError });
      return false;
    }

    if (!lowStockThreshold || Number(lowStockThreshold) < 0) {
        toast.error("Please enter a valid low-stock threshold", { ...toastError });
        return false;
    }

    if (!quantityReceived || Number(quantityReceived) <= 0) {
      toast.error("Please enter a valid quantity", { ...toastError });
      return false;
    }

    if (hasVariantCombination && !selectedVariantCombo) {
      toast.error("This product requires a variant combination", { ...toastError });
      return false;
    }

    if (hasVariants && !hasVariantCombination && !selectedVariantValue) {
      toast.error("This product requires a variant selection", { ...toastError });
      return false;
    }

    return true;
  };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!validateForm()) return;

        setLoading(true);

        try {
            const payload = {
            productId: Number(selectedProduct),
            variantValueId: selectedVariantValue ? Number(selectedVariantValue) : null,
            variantCombinationId: selectedVariantCombo ? Number(selectedVariantCombo) : null,
            quantityReceived: Number(quantityReceived),
            expirationDate: expirationDate || null,
            supplier: supplier || null,
            batchNumber,
            manufacturingDate: manufacturingDate || null,
            notes: notes || null,
            lowStockThreshold: Number(lowStockThreshold)
            };

            const result = await addStock(payload);

            if (result?.success) {
                setSuccess(`✅ Successfully added ${quantityReceived} units to inventory!`);
            } else {
                setError("Failed to add stock.");
            }

        } catch (err) {
            setError(`❌ Error: ${err.message || "Failed to process stock-in"}`);
        } finally {
            setLoading(false);
        }


        setTimeout(() => {
            window.location.href = "/inventory/list";  
        }, 500);
        
    };


  const handleCancel = () => {
      history.back();
      setSelectedProduct("");
      setSelectedVariantValue("");
      setSelectedVariantCombo("");
      setQuantityReceived("");
      setExpirationDate("");
      setSupplier("");
      setBatchNumber("");
      setNotes("");
      setError("");
      setSuccess("");
  };

  return (
    <>
      {loading && <Loading/>}
      <Navbar TitleName="Add Stock" />

      <div className="addstock-container">
        <div className="inventory-main-header">
            <button className="inventory-main-back-btn" onClick={() => history.back()}>
                <FaArrowLeft />
            </button>
            <h3 className="inventory-main-header-title">Back</h3>
        </div>
        <div className="addstock-wrapper">
          
          {/* Header Section */}
          <div className="addstock-header">
            <h1 className="addstock-title">Stock-In Management</h1>
            <p className="addstock-subtitle">Add new inventory batch to your stock</p>
          </div>

          {/* Alert Messages */}
          {success && (
            <div className="addstock-alert addstock-alert-success">
              {success}
            </div>
          )}

          {error && (
            <div className="addstock-alert addstock-alert-error">
              {error}
            </div>
          )}

          {/* Form Card */}
          <div className="addstock-card">
            
            {/* Section 1: Product Selection */}
            <div className="addstock-section">
              <h3 className="addstock-section-title"> Product Information</h3>
              
              <div className="addstock-form-group">
                <label className="addstock-label" htmlFor="product">
                  Product <span className="addstock-required">*</span>
                </label>
                <select
                  id="product"
                  className="addstock-select"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  disabled={loading}
                >
                  <option value="">-- Select Product --</option>
                  {products.map((p) => (
                    <option key={p.ID} value={p.ID}>
                      {p.productName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Show variant options if product has variants */}
              {selectedProduct && hasVariants && !hasVariantCombination && (
                <div className="addstock-form-group">
                  <label className="addstock-label" htmlFor="variantValue">
                    Variant <span className="addstock-required">*</span>
                  </label>
                  <select
                    id="variantValue"
                    className="addstock-select"
                    value={selectedVariantValue}
                    onChange={(e) => setSelectedVariantValue(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">-- Select Variant --</option>
                    {productVariantValues
                      .filter((v) => v.productId === Number(selectedProduct))
                      .map((v) => (
                        <option key={v.ID} value={v.ID}>
                          {v.value}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Show combination if product has variant combinations */}
              {selectedProduct && hasVariantCombination && (
                <div className="addstock-form-group">
                  <label className="addstock-label" htmlFor="variantCombo">
                    Variant Combination <span className="addstock-required">*</span>
                  </label>
                  <select
                    id="variantCombo"
                    className="addstock-select"
                    value={selectedVariantCombo}
                    onChange={(e) => setSelectedVariantCombo(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">-- Select Combination --</option>
                    {productVariantCombination
                      .filter((c) => c.productId === Number(selectedProduct))
                      .map((c) => (
                        <option key={c.ID} value={c.ID}>
                          {c.combinations}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            {/* Section 2: Batch Details */}
            <div className="addstock-section">
              <h3 className="addstock-section-title"> Batch Details</h3>

              <div className="addstock-form-row">
                <div className="addstock-form-group">
                  <label className="addstock-label" htmlFor="quantity">
                    Quantity Received 
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    className="addstock-input"
                    value={quantityReceived}
                    onChange={(e) => setQuantityReceived(e.target.value)}
                    placeholder="Enter quantity"
                    min="1"
                    disabled={loading}
                  />
                </div>

                <div className="addstock-form-group">
                    <label className="addstock-label" htmlFor="lowStockThreshold">
                        Low Stock Threshold <span className="addstock-required">*</span>
                    </label>
                    <input
                        id="lowStockThreshold"
                        type="number"
                        className="addstock-input"
                        value={lowStockThreshold}
                        onChange={(e) => setLowStockThreshold(e.target.value)}
                        placeholder="e.g. 10"
                        min="0"
                        disabled={loading}
                    />
                </div>
              </div>

              <div className="addstock-form-row">
                <div className="addstock-form-group">
                  <label className="addstock-label" htmlFor="expirationDate">
                    Expiration Date
                  </label>
                  <input
                    id="expirationDate"
                    type="date"
                    className="addstock-input"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    disabled={loading}
                  />
                </div>

                <div className="addstock-form-group">
                  <label className="addstock-label" htmlFor="supplier">
                    Supplier Name
                  </label>
                  <input
                    id="supplier"
                    type="text"
                    className="addstock-input"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="Optional"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="addstock-form-row">
                <div className="addstock-form-group">
                  <label className="addstock-label" htmlFor="batchNumber">
                    Batch Number
                  </label>
                  <input
                    id="batchNumber"
                    type="text"
                    className="addstock-input"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="Enter the batch number (optional)"
                    disabled={loading}
                  />
                </div>

                <div className="addstock-form-group">
                  <label className="addstock-label" htmlFor="manufacturingDate">
                    Manufacturing Date
                  </label>
                  <input
                    id="manufacturingDate"
                    type="date"
                    className="addstock-input"
                    value={manufacturingDate}
                    onChange={(e) => setManufacturingDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Additional Notes */}
            <div className="addstock-section">
              <h3 className="addstock-section-title"> Additional Information</h3>

              <div className="addstock-form-group">
                <label className="addstock-label" htmlFor="notes">
                  Notes / Remarks
                </label>
                <textarea
                  id="notes"
                  className="addstock-textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes about this stock-in..."
                  rows="4"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="addstock-actions">
              <button
                type="button"
                className="addstock-btn addstock-btn-cancel"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="addstock-btn addstock-btn-submit"
                onClick={handleSubmit}
                disabled={loading || !selectedProduct}
              >
                {loading ? (
                  <>
                    <span></span>
                    Processing...
                  </>
                ) : (
                  <>
                    Add Stock
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}