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
  const {products, search, productCategory} = useContext(ShopContext);
  const [isFilterOpen, setIsFilterOpen] = useState(false); 
  // const [selectedFilter, setSelectedFilter] = useState('Filter'); 
  const [selectedFilter, setSelectedFilter] = useState({ id: null, name: 'Filter' });

  const [filteredProducts, setFilteredProducts] = useState(products);
  const [sortType, setSortType] = useState('default')

  const dropdownRef = useRef(null);
  const toggleFilterDropdown = () => setIsFilterOpen(!isFilterOpen);

  const handleFilterSelect = (id, name) => {
    setSelectedFilter({ id, name });
    setIsFilterOpen(false);
  };


  const filteringProducts = () => {
  let updatedProducts = products;

    if (selectedFilter.name !== 'All' && selectedFilter.name !== 'Best Sellers' && selectedFilter.name !== 'Filter') {
      // Filter by categoryId (from DB)
      updatedProducts = updatedProducts.filter(
        (item) => item.categoryId === selectedFilter.id
      );
    } else if (selectedFilter.name === 'Best Sellers') {
      updatedProducts = updatedProducts.filter((item) => item.isBestSeller === true);
    }

    // Apply search
    if (search) {
      updatedProducts = updatedProducts.filter((item) =>
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
      setFilteredProducts(fpCopy.sort((a, b) => (a.productName.localeCompare(b.productName))));
    }
    else if (sortType === "z-a") {
      setFilteredProducts(fpCopy.sort((a, b) => (b.productName.localeCompare(a.productName)))); 
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
              onClick={toggleFilterDropdown} className="filter-btn">
              <GiSettingsKnobs className='m-20 filter-button' />
              {selectedFilter.name}
            </button>
            {/* Dropdown Menu */}
            {isFilterOpen && (
              <div className='dropdown-container'>
                <ul className='text-sm'>
                  <li onClick={() => handleFilterSelect(null, 'All')} className='px-4 py-2 cursor-pointer dropdown-choices-top'>All</li>
                  <li onClick={() => handleFilterSelect(null, 'Best Sellers')} className='px-4 py-2 cursor-pointer dropdown-choices'>Best Sellers</li>
                  {productCategory.map((cat, index) => (
                    <li
                      key={cat.ID}
                      onClick={() => handleFilterSelect(cat.ID, cat.categoryName)}
                      className={`px-4 py-2 cursor-pointer ${
                        index === productCategory.length - 1
                          ? "dropdown-choices-buttom"
                          : "dropdown-choices"
                      }`}
                    >
                      {cat.categoryName}
                    </li>
                  ))}
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
                ID={item.ID} 
                productId={item.productId} 
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
