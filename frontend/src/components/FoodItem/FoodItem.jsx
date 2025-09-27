import React, { useContext } from 'react'
import './FoodItem.css'
import { StoreContext } from '../../Context/StoreContext'

const FoodItem = ({ image, name, price, desc, id }) => {
  const { addToCart, cartItems } = useContext(StoreContext);
  
  // Format description to limit length if needed
  const formattedDesc = desc.length > 100 ? `${desc.substring(0, 100)}...` : desc;

  // Format price with thousand separator
  const formatCurrency = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Handle add to cart with stopPropagation to prevent opening detail popup
  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent event bubbling to parent (which would open detail)
    addToCart(id);
  };

  return (
    <div className='food-item'>
      <img src={image} alt={name} />
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <h4>{name}</h4>
        </div>
        <p>{formattedDesc}</p>
        <div className="food-item-price">
          <p className="food-item-price-figure">{formatCurrency(price)} VNĐ</p>
          <button 
            onClick={handleAddToCart} 
            className={`food-item-price-button ${cartItems && cartItems[id] ? 'added' : ''}`}
          >
            {cartItems && cartItems[id] ? `Đã thêm (${cartItems[id]})` : 'Thêm vào giỏ'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default FoodItem
