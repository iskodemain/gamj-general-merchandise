import React from 'react'
import { useContext } from 'react';
import { Navigate } from 'react-router-dom'
import { AdminContext } from '../context/AdminContextProvider';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { token, currentUser } = useContext(AdminContext);

    if (token === undefined) return null;

    if (!token) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles.length === 0) {
        return children;
    }


    const hasAccess = allowedRoles.includes(currentUser);

    if (!hasAccess) {
        return <Navigate to="/overview" replace />;
    }

    return children;


}

export default ProtectedRoute
