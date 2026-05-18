import React, { useEffect, useContext, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import Loading from "./Loading";
import "./PaypalModal.css"; // ✅ Import CSS

const PaypalModal = () => {
    const { toastSuccess, toastError, backendUrl, token, paypalClientId, orderItems, cartItemsToDelete, paymentMethod, navigate, setShowPaypalModal, orderSubTotal, shippingFee, totalPrice, setShowOrderProofPayment, setOrderId, setCustomerId, setOrderTotalAmount, paypalFee, setPaypalFee} = useContext(ShopContext);

    const [visible, setVisible] = useState(true);
    const [loading, setLoading] = useState(true);
    const [sdkLoaded, setSdkLoaded] = useState(false);
    // Store the fee returned from backend create-order so capture can use it
    const [resolvedPaypalFee, setResolvedPaypalFee] = useState(0);

    const handleClose = () => {
        setVisible(false);
        setShowPaypalModal(false); // ✅ hide globally
    };


    /* ---------------- Load PayPal SDK ---------------- */
    useEffect(() => {
        if (!visible || paymentMethod !== "Paypal") return;

        const loadPayPalScript = () => {
        // If already loaded
        if (window.paypal) {
            setSdkLoaded(true);
            return;
        }

        const script = document.createElement("script");
        script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=PHP&disable-funding=card,credit`;
        script.async = true;
        script.onload = () => {
            console.log("✅ PayPal SDK loaded");
            setSdkLoaded(true);
        };
        script.onerror = () => {
            toast.error("Failed to load PayPal SDK.", { ...toastError });
            setLoading(false);
        };
        document.body.appendChild(script);
        };

        loadPayPalScript();
    }, [paypalClientId, visible, paymentMethod]);

  /* ---------------- Render PayPal Buttons ---------------- */
  useEffect(() => {
    const renderButtons = async () => {
      if (!sdkLoaded || !visible) return;

      try {
        // Backend calculates the grossed-up amount and returns the fee
        const { data } = await axios.post(
          `${backendUrl}/api/paypal/create-order`,
          { amount: orderSubTotal + shippingFee },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!data?.id) {
          toast.error("Unable to create PayPal order.", { ...toastError });
          setLoading(false);
          return;
        }

        // Store the fee from backend for use in capture
        const feeFromBackend = data.paypalFee || 0;
        setResolvedPaypalFee(feeFromBackend);
        setPaypalFee(feeFromBackend);

        // Render PayPal Buttons
        window.paypal
          .Buttons({
            style: {
              layout: "vertical",
              color: "blue",
              shape: "pill",
              label: "paypal",
            },
            createOrder: () => data.id,
            onApprove: async (details) => {
              setLoading(true);
              try {
                const capture = await axios.post(
                  `${backendUrl}/api/paypal/capture-order`,
                  {
                    orderID: details.orderID,
                    paymentMethod,
                    orderItems,
                    cartItemsToDelete,
                    subtotal: orderSubTotal,
                    shippingFee: shippingFee,
                    totalAmount: orderSubTotal + shippingFee, // original order total (without fee)
                    paypalFee: feeFromBackend
                  },
                  { headers: { Authorization: `Bearer ${token}` } }
                );

                if (capture.data?.success) {
                  toast.success("Payment successful!", { ...toastSuccess });
                  const order = capture.data.order;
                  setOrderId(order.ID);
                  setCustomerId(order.customerId);
                  setOrderTotalAmount(order.totalAmount);
                  handleClose();
                  setShowOrderProofPayment(true);
                  navigate("/orders");
                } else {
                  toast.error("Payment failed, please try again.", { ...toastError });
                }
              } catch {
                toast.error("Error capturing PayPal payment.", { ...toastError });
              } finally {
                setLoading(false);
              }
            },
            onCancel: () => {
              handleClose();
              setLoading(false);
            },
            onError: (err) => {
              console.error(err);
              handleClose();
              setLoading(false);
            },
            onInit: () => {
              // Stop loading once PayPal buttons are ready
              setLoading(false);
            },
          })
          .render("#paypal-buttons-container");
      } catch {
        toast.error("PayPal initialization failed.", { ...toastError });
        setLoading(false);
      }
    };

    renderButtons();
  }, [sdkLoaded, visible, token, backendUrl]);


  if (!visible) return null;

  /* ---------------- Modal Render ---------------- */
  return createPortal(
    <div className="paypal-overlay">
      <div className="paypal-modal">
        {loading && <Loading />}

        <button onClick={handleClose} className="paypal-close" aria-label="Close PayPal modal">
          &times;
        </button>

        <h2 className="paypal-title">Complete Your Payment</h2>
        <p className="paypal-subtext">
          Order Total: <strong>₱{(orderSubTotal + shippingFee).toLocaleString()}</strong>
        </p>
        {resolvedPaypalFee > 0 && (
          <p className="paypal-subtext">
            PayPal Fee: <strong>₱{Number(resolvedPaypalFee).toFixed(2)}</strong>
          </p>
        )}
        {resolvedPaypalFee > 0 && (
          <p className="paypal-subtext paypal-charged-total">
            You will be charged: <strong>₱{(orderSubTotal + shippingFee + resolvedPaypalFee).toFixed(2)}</strong>
          </p>
        )}

        <div id="paypal-buttons-container"></div>
      </div>
    </div>,
    document.body
  );
};

export default PaypalModal;
