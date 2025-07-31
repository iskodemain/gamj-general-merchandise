import React, { useContext } from "react";  
import {ToastContainer} from 'react-toastify'
import {Routes, Route, Navigate} from 'react-router-dom'
import './App.css'
import LoginAdmin from './pages/LoginAdmin'
import AdminSignUp from './pages/AdminSignUp' // <-- Import

//components
// icon 
import { IoIosArrowUp } from "react-icons/io";
const App = () => {
  return (
   <div className='App'>
    
    <ToastContainer/>
    <Routes>
      <Route path="/" element={<LoginAdmin />} />
      <Route path="*" element={<LoginAdmin/>}/>
      <Route path="/signup" element={<AdminSignUp />} />
    </Routes>
   </div>
  )
}

export default App
