import React, { useEffect, useContext, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import Loading from "./Loading";
import "./PaypalModal.css"; // ✅ Import CSS

const PaypalModal = () => {
    const { backendUrl, token, paypalClientId, totalPrice, orderItems, cartItemsToDelete, paymentMethod, navigate, setShowPaypalModal} = useContext(ShopContext);

    const [visible, setVisible] = useState(true);
    const [loading, setLoading] = useState(true);
    const [sdkLoaded, setSdkLoaded] = useState(false);

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
            toast.error("Failed to load PayPal SDK.");
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
        const { data } = await axios.post(
          `${backendUrl}/api/paypal/create-order`,
          { amount: totalPrice },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!data?.id) {
          toast.error("Unable to create PayPal order.");
          setLoading(false);
          return;
        }

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
                  },
                  { headers: { Authorization: `Bearer ${token}` } }
                );

                if (capture.data?.success) {
                  toast.success("Payment successful!");
                  handleClose();
                  navigate("/orders");
                } else {
                  toast.error("Payment failed, please try again.");
                }
              } catch {
                toast.error("Error capturing PayPal payment.");
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
        toast.error("PayPal initialization failed.");
        setLoading(false);
      }
    };

    renderButtons();
  }, [sdkLoaded, visible, totalPrice, token, backendUrl]);


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
          Total Amount: <strong>₱{totalPrice.toLocaleString()}</strong>
        </p>

        <div id="paypal-buttons-container"></div>
      </div>
    </div>,
    document.body
  );
};

export default PaypalModal;
