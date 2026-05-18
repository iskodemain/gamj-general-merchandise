import { useState, useContext, useEffect } from "react";
import "./StockAdjustment.css";
import Navbar from "../Navbar";
import { AdminContext } from "../../context/AdminContextProvider";
import Loading from "../Loading";
import { FaArrowLeft } from "react-icons/fa6";
import { toast } from "react-toastify";

export default function StockAdjustment() {
  const {
    navigate,
    products,
    productVariantValues,
    productVariantCombination,
    adjustStock,
    fetchInventoryStock,
    toastError
  } = useContext(AdminContext);

  // Form state
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedVariantValue, setSelectedVariantValue] = useState("");
  const [selectedVariantCombo, setSelectedVariantCombo] = useState("");
  const [quantity, setQuantity] = useState("");
  const [adjustType, setAdjustType] = useState("ADD");
  const [reason, setReason] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Get product details
  const selectedProductData = products.find(p => p.ID === Number(selectedProduct));
  const hasVariants = selectedProductData?.hasVariant;
  const hasVariantCombination = selectedProductData?.hasVariantCombination;

  // Get current stock for selected product/variant
  const getCurrentStock = () => {
    if (!selectedProduct) return null;
    const stock = fetchInventoryStock.find(s => {
      if (s.productId !== Number(selectedProduct)) return false;
      if (hasVariantCombination) return s.variantCombinationId === Number(selectedVariantCombo);
      if (hasVariants) return s.variantValueId === Number(selectedVariantValue);
      return !s.variantValueId && !s.variantCombinationId;
    });
    return stock ? Number(stock.totalQuantity) : 0;
  };

  const currentStock = getCurrentStock();

  // Reset variant inputs when product changes
  useEffect(() => {
    setSelectedVariantValue("");
    setSelectedVariantCombo("");
    setQuantity("");
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
      toast.error("Please select a product.", { ...toastError });
      return false;
    }

    if (hasVariantCombination && !selectedVariantCombo) {
      toast.error("This product requires a variant combination.", { ...toastError });
      return false;
    }

    if (hasVariants && !hasVariantCombination && !selectedVariantValue) {
      toast.error("This product requires a variant selection.", { ...toastError });
      return false;
    }

    if (!quantity || Number(quantity) <= 0) {
      toast.error("Please enter a valid quantity.", { ...toastError });
      return false;
    }

    if (adjustType === "DEDUCT" && currentStock !== null && Number(quantity) > currentStock) {
      toast.error(`Cannot deduct ${quantity} — only ${currentStock} in stock.`, { ...toastError });
      return false;
    }

    if (!reason || !reason.trim()) {
      toast.error("Reason is required.", { ...toastError });
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
        quantity: Number(quantity),
        adjustType,
        reason: reason.trim(),
      };

      const result = await adjustStock(payload);

      if (result?.success) {
        setSuccess(`✅ Stock adjustment (${adjustType}) of ${quantity} applied successfully!`);
      } else {
        setError(result?.message || "Failed to adjust stock.");
        setLoading(false);
        return;
      }
    } catch (err) {
      setError(`❌ Error: ${err.message || "Failed to process stock adjustment"}`);
      setLoading(false);
      return;
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
    setQuantity("");
    setAdjustType("ADD");
    setReason("");
    setError("");
    setSuccess("");
  };

  return (
    <>
      {loading && <Loading />}
      <Navbar TitleName="Stock Adjustment" />

      <div className="stockadj-container">
        <div className="inventory-main-header">
          <button className="inventory-main-back-btn" onClick={() => history.back()}>
            <FaArrowLeft />
          </button>
          <h3 className="inventory-main-header-title">Back</h3>
        </div>
        <div className="stockadj-wrapper">

          {/* Header Section */}
          <div className="stockadj-header">
            <h1 className="stockadj-title">Stock Adjustment</h1>
            <p className="stockadj-subtitle">Adjust inventory quantities to correct stock discrepancies</p>
          </div>

          {/* Alert Messages */}
          {success && (
            <div className="stockadj-alert stockadj-alert-success">
              {success}
            </div>
          )}

          {error && (
            <div className="stockadj-alert stockadj-alert-error">
              {error}
            </div>
          )}

          {/* Form Card */}
          <div className="stockadj-card">

            {/* Section 1: Product Selection */}
            <div className="stockadj-section">
              <h3 className="stockadj-section-title">Product Information</h3>

              <div className="stockadj-form-group">
                <label className="stockadj-label" htmlFor="product">
                  Product <span className="stockadj-required">*</span>
                </label>
                <select
                  id="product"
                  className="stockadj-select"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  disabled={loading}
                >
                  <option value="">-- Select Product --</option>
                  {products.map((p) => {
                    const unitLabel = p.unitType === 'BOX' ? `📦 Per Box (${p.piecesPerBox} pcs)` : '🔹 Per Piece';
                    const stockLabel = p.isOutOfStock ? ' — ⚠️ No Stock' : '';
                    return (
                      <option key={p.ID} value={p.ID}>
                        {p.productName} | {unitLabel}{stockLabel}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Single variant */}
              {selectedProduct && hasVariants && !hasVariantCombination && (
                <div className="stockadj-form-group">
                  <label className="stockadj-label" htmlFor="variantValue">
                    Variant <span className="stockadj-required">*</span>
                  </label>
                  <select
                    id="variantValue"
                    className="stockadj-select"
                    value={selectedVariantValue}
                    onChange={(e) => setSelectedVariantValue(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">-- Select Variant --</option>
                    {productVariantValues
                      .filter((v) => v.productId === Number(selectedProduct))
                      .map((v) => (
                        <option key={v.ID} value={v.ID}>{v.value}</option>
                      ))}
                  </select>
                </div>
              )}

              {/* Variant combination */}
              {selectedProduct && hasVariantCombination && (
                <div className="stockadj-form-group">
                  <label className="stockadj-label" htmlFor="variantCombo">
                    Variant Combination <span className="stockadj-required">*</span>
                  </label>
                  <select
                    id="variantCombo"
                    className="stockadj-select"
                    value={selectedVariantCombo}
                    onChange={(e) => setSelectedVariantCombo(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">-- Select Combination --</option>
                    {productVariantCombination
                      .filter((c) => c.productId === Number(selectedProduct))
                      .map((c) => (
                        <option key={c.ID} value={c.ID}>{c.combinations}</option>
                      ))}
                  </select>
                </div>
              )}

              {/* Current Stock (read-only) */}
              {selectedProduct && (
                <div className="stockadj-form-group">
                  <label className="stockadj-label">Current Stock</label>
                  <input
                    type="text"
                    className="stockadj-input stockadj-input-readonly"
                    value={currentStock !== null ? `${currentStock}` : "—"}
                    readOnly
                    disabled
                  />
                </div>
              )}
            </div>

            {/* Section 2: Adjustment Details */}
            <div className="stockadj-section">
              <h3 className="stockadj-section-title">Adjustment Details</h3>

              <div className="stockadj-form-row">
                <div className="stockadj-form-group">
                  <label className="stockadj-label" htmlFor="adjustType">
                    Adjust Type <span className="stockadj-required">*</span>
                  </label>
                  <select
                    id="adjustType"
                    className="stockadj-select"
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value)}
                    disabled={loading}
                  >
                    <option value="ADD">ADD — Increase stock</option>
                    <option value="DEDUCT">DEDUCT — Decrease stock</option>
                  </select>
                </div>

                <div className="stockadj-form-group">
                  <label className="stockadj-label" htmlFor="quantity">
                    Quantity <span className="stockadj-required">*</span>
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    className="stockadj-input"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    onWheel={(e) => e.target.blur()}
                    placeholder="Enter quantity to adjust"
                    min="1"
                    disabled={loading || !selectedProduct}
                  />
                </div>
              </div>

              {/* Preview */}
              {selectedProduct && quantity && Number(quantity) > 0 && currentStock !== null && (
                <div className={`stockadj-preview ${adjustType === 'ADD' ? 'stockadj-preview-add' : 'stockadj-preview-deduct'}`}>
                  <span>Stock after adjustment:</span>
                  <strong>
                    {adjustType === 'ADD'
                      ? currentStock + Number(quantity)
                      : Math.max(0, currentStock - Number(quantity))
                    }
                  </strong>
                </div>
              )}
            </div>

            {/* Section 3: Reason */}
            <div className="stockadj-section">
              <h3 className="stockadj-section-title">Additional Information</h3>

              <div className="stockadj-form-group">
                <label className="stockadj-label" htmlFor="reason">
                  Reason <span className="stockadj-required">*</span>
                </label>
                <textarea
                  id="reason"
                  className="stockadj-textarea"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain the reason for this stock adjustment (e.g. damaged goods, data correction, physical count discrepancy)..."
                  rows="4"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="stockadj-actions">
              <button
                type="button"
                className="stockadj-btn stockadj-btn-cancel"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="stockadj-btn stockadj-btn-submit"
                onClick={handleSubmit}
                disabled={loading || !selectedProduct}
              >
                {loading ? "Processing..." : "Adjust Stock"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
