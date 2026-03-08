import React, { useState, useEffect, useContext } from 'react';
import './ReturnRefundPolicy.css';
import { AdminContext } from '../context/AdminContextProvider';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Loading from '../components/Loading';


const ReturnRefundPolicy = () => {
  const { fetchReturnRefundPolicy, addReturnRefundPolicy, updateReturnRefundPolicy, toastError, toastSuccess} = useContext(AdminContext);
  
  const [returnRefundDays, setReturnRefundDays] = useState('');
  const [existingPolicy, setExistingPolicy] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch policy on mount
  useEffect(() => {
    fetchPolicy();
  }, [fetchReturnRefundPolicy]);

  const fetchPolicy = async () => {
    try {
      setIsLoading(true);
      
      // ✅ FIX: Check if it's an object (not array)
    if (fetchReturnRefundPolicy && typeof fetchReturnRefundPolicy === 'object') {
      // Check if it's not empty
      if (Object.keys(fetchReturnRefundPolicy).length > 0) {
        setExistingPolicy(fetchReturnRefundPolicy); // ← Direct assignment, no [0]
        setReturnRefundDays(fetchReturnRefundPolicy.returnRefundDays);
      }
    }
    } catch (error) {
      console.error('Error fetching policy:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FIXED: Handle number input with restrictions
  const handleNumberChange = (e) => {
    const value = e.target.value;
    
    // Allow empty string for clearing the input
    if (value === '') {
      setReturnRefundDays('');
      return;
    }

    // Parse as number
    const numValue = parseInt(value, 10);

    // Only allow positive numbers (no negative, no letters)
    if (!isNaN(numValue) && numValue > 0) {
      setReturnRefundDays(numValue);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!returnRefundDays || returnRefundDays <= 0) {
      toast.error('Return/Refund days must be greater than 0', { ...toastError });
      return;
    }

    setIsSaving(true);

    const payload = { returnRefundDays: parseInt(returnRefundDays, 10) };
    let result;

    if (existingPolicy) {
      result = await updateReturnRefundPolicy(payload);
      if (result) {
        toast.success('Policy updated successfully!',  { ...toastSuccess });
        setExistingPolicy(result);
      } else {
        toast.error('Failed to update policy', { ...toastError });
      }
    } else {
      result = await addReturnRefundPolicy(payload);
      if (result) {
        toast.success('Policy created successfully!', { ...toastSuccess });
        setExistingPolicy(result);
      } else {
        toast.error('Failed to create policy', { ...toastError });
      }
    }
    setIsSaving(false);
  };

  return (
    <>
      {isLoading && <Loading />}
      <Navbar TitleName="Return & Refund Period"/>
      <div className="rrp-page-container">
        <div className="rrp-content-wrapper">
          <div className="rrp-card">
            
            <h1 className="rrp-main-title">Return & Refund Period</h1>

            <form onSubmit={handleSubmit} className="rrp-form">

              {/* Return/Refund Days Input */}
              <div className="rrp-form-group">
                <label className="rrp-label">Return/Refund Days</label>
                <input
                  type="number"
                  className="rrp-input"
                  value={returnRefundDays}
                  onChange={handleNumberChange}
                  onKeyDown={(e) => {
                    // ✅ Prevent minus sign, 'e', '+', and '.'
                    if (e.key === '-' || e.key === 'e' || e.key === '+' || e.key === '.') {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Enter number of days (e.g., 7)"
                  min="1"
                  step="1"
                  disabled={isSaving}
                />
                <p className="rrp-helper-text">
                  Number of days customers have to request a return or refund
                </p>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="rrp-submit-btn"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="rrp-btn-spinner"></span>
                    Saving...
                  </>
                ) : (
                  existingPolicy ? 'Save Changes' : 'Submit'
                )}
              </button>

            </form>

            {/* Last Updated Info */}
            {existingPolicy && (
              <div className="rrp-info-footer">
                <p className="rrp-info-text">
                  Last updated: {new Date(existingPolicy.updatedAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default ReturnRefundPolicy;