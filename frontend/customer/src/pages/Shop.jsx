import React, {useState, useRef, useEffect, useContext} from 'react'
import MainTitle from '../components/MainTitle'
import { ShopContext } from '../context/ShopContext.jsx'
import ProductItem from '../components/ProductItem.jsx';
import OurPolicy from '../components/OurPolicy.jsx';
import Infos from '../components/Infos.jsx';
import Footer from '../components/Footer.jsx';
import './Shop.css'
// ICONS
import { GiSettingsKnobs } from "react-icons/gi";

const Shop = () => {
  const {products, search} = useContext(ShopContext);
  const [isFilterOpen, setIsFilterOpen] = useState(false); 
  const [selectedFilter, setSelectedFilter] = useState('Filter'); 
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [sortType, setSortType] = useState('default')

  const dropdownRef = useRef(null);
  const toggleFilterDropdown = () => setIsFilterOpen(!isFilterOpen);

  // Function to handle filter selection
  const handleFilterSelect = (value) => {
    setSelectedFilter(value);
    setIsFilterOpen(false); //CLOSE FILTER BY CLIKING WINDOW
  }

  // FILTER PRODUCTS FUNCTIONS
  const filteringProducts = () => {
    let updatedProducts = products;

    // Apply category filter
    if (selectedFilter !== 'All' && selectedFilter !== 'Filter') {
      if (selectedFilter === 'Best Sellers') {
        updatedProducts = updatedProducts.filter(item => item.isBestSeller === true);
      } else {
        updatedProducts = updatedProducts.filter(item => item.category === selectedFilter);
      }
    }

    // Apply search filter
    if (search) {
      updatedProducts = updatedProducts.filter(item =>
        item.productName.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredProducts(updatedProducts);
  };
  
  //SORT PRODUCTS FUNCTIONS
  const sortProduct = () => {
    const fpCopy = filteredProducts.slice();
    if (sortType === "low-high") {
      setFilteredProducts(fpCopy.sort((a, b) => (a.price - b.price)));
    }
    else if (sortType === "high-low") {
      setFilteredProducts(fpCopy.sort((a, b) => (b.price - a.price)));
    }
    else if (sortType === "a-z") {
      setFilteredProducts(fpCopy.sort((a, b) => (a.name.localeCompare(b.name))));
    }
    else if (sortType === "z-a") {
      setFilteredProducts(fpCopy.sort((a, b) => (b.name.localeCompare(a.name)))); 
    }
    else {
      setFilteredProducts(fpCopy);
    }
    
  }

  useEffect(() => {
    filteringProducts();
  }, [selectedFilter, search, products]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  // CLOSE CLICK OUTSIDE
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <div className='shop-main'>
      <div className='shop-semi'>
        <MainTitle mtext1={'DISCOVER'} mtext2={'ALL COLLECTIONS'}/>
        <div className='shop-settings'>
          {/* PRODUCT FILTER */}
          <div className='product-filter relative' ref={dropdownRef}>
            <button 
              onClick={toggleFilterDropdown} 
              className="filter-btn">
              <GiSettingsKnobs className='m-20 filter-button' />
              {selectedFilter}
            </button>
            {/* Dropdown Menu */}
            {isFilterOpen && (
              <div className='dropdown-container'>
                <ul className='text-sm'>
                <li onClick={() => handleFilterSelect('All')} className='px-4 py-2 cursor-pointer dropdown-choices-top'>All</li>
                <li onClick={() => handleFilterSelect('Best Sellers')} className='px-4 py-2 cursor-pointer dropdown-choices'>Best Sellers</li>
                {/* DISPLAY ALL CATEGORIES HERE RELAATED TO PRODUCT IN BACKEND */}
                
                  {/* <li onClick={() => handleFilterSelect('Men')} className='px-4 py-2 cursor-pointer dropdown-choices'>Men</li>
                  <li onClick={() => handleFilterSelect('Women')} className='px-4 py-2 cursor-pointer dropdown-choices'>Women</li>
                  <li onClick={() => handleFilterSelect('Shorts')} className='px-4 py-2 cursor-pointer dropdown-choices'>Shorts</li>
                  <li onClick={() => handleFilterSelect('Striped Shirts(UNISEX)')} className='px-4 py-2 cursor-pointer dropdown-choices-buttom'>Striped Shirts(UNISEX)</li> */}
                </ul>
              </div>
            )}
          </div>
          {/* PRODUCT SORT */}
          <div>
            <select onChange={(e)=>setSortType(e.target.value)} className=' text-sm px-2 py-2 sort-container'>
              <option value="default">Sort by: Default</option>
              <option value="low-high">Sort by: Low to High</option>
              <option value="high-low" >Sort by: High to Low</option>
              <option value="a-z" >Sort by: A to Z</option>
              <option value="z-a" >Sort by: Z to A</option>
            </select>
          </div>
        </div>
        {/* DISPLAY ALL PRODUCTS */}
        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 gap-y-6'>
        {filteredProducts.length > 0 ? (
            filteredProducts.map((item, index) => (
              <ProductItem 
                key={index} 
                id={item.productId} 
                image={item.images} 
                name={item.productName} 
                price={item.price} 
                active={item.isActive}
                bestseller={item.isBestSeller}
              />
            ))
          ) : (
            <p>No products found.</p>
          )}
        </div>
      </div>
      <OurPolicy/>
      <Infos/>
      <Footer/>
    </div>
  )
}

export default Shop
