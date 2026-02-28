import { toast } from 'react-toastify';

/**
 * Centralized API Error Handler
 * Used across the entire application for consistent error handling
 * 
 * @param {Error} error - The error object from axios/fetch
 * @param {string} customMessage - Optional custom message to show user
 * @param {object} toastConfig - Toast configuration object
 * @returns {string} The user-friendly error message that was displayed
 */
export const handleApiError = (error, customMessage = null, toastConfig = {}) => {
  
  // ========================================
  // 1. LOG TECHNICAL DETAILS (FOR DEVELOPERS)
  // ========================================
  console.error("🔴 API Error Details:", {
    message: error.message,
    response: error.response?.data,
    status: error.response?.status,
    statusText: error.response?.statusText,
    url: error.config?.url,
    method: error.config?.method,
    timestamp: new Date().toISOString(),
    stack: error.stack
  });

  // ========================================
  // 2. DETERMINE USER-FRIENDLY MESSAGE
  // ========================================
  let userMessage = customMessage;

  if (!userMessage) {
    if (error.response) {
      // Server responded with error status (4xx, 5xx)
      const status = error.response.status;
      const serverMessage = error.response.data?.message;
      
      switch (status) {
        case 400:
          // Bad Request - Usually validation errors
          userMessage = serverMessage || "Invalid request. Please check your input.";
          break;
          
        case 401:
          // Unauthorized - Token expired or invalid
          userMessage = "Your session has expired. Please log in again.";
          // Optional: Trigger logout
          // localStorage.removeItem('token');
          // window.location.href = '/login';
          break;
          
        case 403:
          // Forbidden - User doesn't have permission
          userMessage = "You don't have permission to perform this action.";
          break;
          
        case 404:
          // Not Found
          userMessage = "The requested information was not found.";
          break;
          
        case 422:
          // Unprocessable Entity - Validation error
          userMessage = serverMessage || "Please check your input and try again.";
          break;
          
        case 429:
          // Too Many Requests - Rate limiting
          userMessage = "Too many requests. Please wait a moment and try again.";
          break;
          
        case 500:
          // Internal Server Error
          userMessage = "Server error. Our team has been notified. Please try again later.";
          break;
          
        case 502:
          // Bad Gateway
          userMessage = "Server is temporarily unavailable. Please try again in a moment.";
          break;
          
        case 503:
          // Service Unavailable
          userMessage = "Service is temporarily down for maintenance. Please try again later.";
          break;
          
        case 504:
          // Gateway Timeout
          userMessage = "Request timed out. Please check your connection and try again.";
          break;
          
        default:
          // Any other error
          userMessage = serverMessage || "Something went wrong. Please try again.";
      }
    } else if (error.request) {
      // Request was made but no response received (Network error)
      userMessage = "Connection issue. Please check your internet and try again.";
    } else {
      // Something happened in setting up the request
      userMessage = "An unexpected error occurred. Please try again.";
    }
  }

  // ========================================
  // 3. SHOW USER-FRIENDLY TOAST
  // ========================================
  toast.error(userMessage, toastConfig);

  return userMessage;
};

export const handleApiSuccess = (message, toastConfig = {}) => {
  toast.success(message, toastConfig);
};