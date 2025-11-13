import React, { useState } from 'react';
import './OutOfStock.css';
import { FaArrowLeft, FaTrash, FaSearch } from 'react-icons/fa';

function OutOfStock({ onBack }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [products, setProducts] = useState([
    {
      id: 1,
      image: 'https://via.placeholder.com/64/1b5e20/ffffff?text=IB', // green bottle
      name: 'Isopropyl Alcohol (Green Cross)',
      category: 'Wound Care',
      price: 149.0,
      stocks: 0
    },
    {
      id: 2,
      image: 'https://via.placeholder.com/64/1565c0/ffffff?text=FM', // face mask box
      name: 'Disposable Face Mask (indoplas) – 50 pcs',
      category: 'PPE',
      price: 149.0,
      stocks: 0
    },
    {
      id: 3,
      image: 'https://via.placeholder.com/64/2e7d32/ffffff?text=SY', // syringe box
      name: 'Plastic Syringe with Needle (YNCY) – 100 pack',
      category: 'IV & Injection',
      price: 149.0,
      stocks: 0
    }
  ]);

  const handleDelete = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleView = (p) => {
    alert(`View: ${p.name}`);
  };

  const filtered = products
    .filter(p => !query || p.name.toLowerCase().includes(query.toLowerCase()))
    .filter(p => !filter || p.category === filter);

  // simple sort examples
  if (sortBy === 'price-asc') filtered.sort((a,b) => a.price - b.price);
  if (sortBy === 'price-desc') filtered.sort((a,b) => b.price - a.price);

  return (
    <div className="tpc-container">
      <div className="tpc-card">
        <div className="tpc-controls">
          <div className="tpc-controls-left">
            {onBack && (
              <button className="tpc-back" onClick={onBack} aria-label="Back">
                <FaArrowLeft />
              </button>
            )}

           
          </div>

          <div className="tpc-controls-right">
            <button className="tpc-add-btn">Add Product</button>

           
          </div>
        </div>

        <table className="tpc-table" cellSpacing="0">
          <thead>
            <tr>
              <th>Image</th>
              <th className="left">Name</th>
              <th className="left">Category</th>
              <th className="center">Price</th>
              <th className="center">Stocks</th>
              <th className="center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td>
                  <img src={p.image} alt={p.name} className="tpc-thumb" />
                </td>
                <td className="left">{p.name}</td>
                <td className="left">{p.category}</td>
                <td className="center">₱{p.price.toFixed(2)}</td>
                <td className="center">{p.stocks}</td>
                <td className="center">
                  <button className="tpc-trash" onClick={() => handleDelete(p.id)} aria-label="Delete">
                    <FaTrash />
                  </button>
                  <button className="tpc-view" onClick={() => handleView(p)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OutOfStock;