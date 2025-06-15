import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import './SearchBar.css'
import { IoSearchOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import {useLocation} from 'react-router-dom'
function SearchBar() {
    const {search, setSearch, showSearch, setShowSearch} = useContext(ShopContext);
    const [visible, setVisible] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if(location.pathname.includes('shop')) {
            setVisible(true)
        }
        else {
            setVisible(false);
        }
    }, [location])

    const handleCloseSearch = () => {
        setSearch("");
        setShowSearch(false);
    };

  return showSearch && visible ? (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
        <div className='searh-container text-center'>
            <div className='search-bar inline-flex items-center justify-center px-5 py-2 my-5 mx-3 rounded-full w-3/4 sm:w-1/2'>
                <input value={search} onChange={(e) => setSearch(e.target.value)} className='flex-1 outline-none bg-inherit text-sm' type="text" placeholder='Search'/>
                <IoSearchOutline className='search-icon'/>
            </div>
            <IoClose onClick={handleCloseSearch} className='exit-icon'/>
        </div>
    </div>
  ) : null
}

export default SearchBar
