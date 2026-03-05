import React from 'react'
import { useContext } from 'react';
import { Navigate } from 'react-router-dom'
import { AdminContext } from '../context/AdminContextProvider';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { token, currentUser } = useContext(AdminContext);

    if (!token) {
        return <Navigate to="/" replace />;
    }

    if (currentUser === null) {
        return null; // or loading spinner
    }

    if (currentUser === 'Delivery Staff' && allowedRoles.length > 0) {
        // Delivery Staff is trying to access a restricted route
        return <Navigate to="/activeorders" replace />;
    }

    if (allowedRoles.length === 0) {
        return children;
    }


    const hasAccess = allowedRoles.includes(currentUser);

    if (!hasAccess) {
        if (currentUser === 'Delivery Staff') {
            return <Navigate to="/activeorders" replace />;
        }
        return <Navigate to="/overview" replace />;
    }

    return children;


}

export default ProtectedRoute
