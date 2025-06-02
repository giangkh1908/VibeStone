import React, { useContext, useState, useEffect } from 'react'
import './FoodDisplay.css'
import FoodItem from '../FoodItem/FoodItem'
import { StoreContext } from '../../Context/StoreContext'
import ProductDetailPopup from '../ProductDetailPopup/ProductDetailPopup'

const FoodDisplay = ({category}) => {
  const { food_list, addToCart } = useContext(StoreContext);
  const [randomProducts, setRandomProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Kiểm tra xem food_list có tồn tại và có phải là mảng không
  const validFoodList = Array.isArray(food_list) ? food_list : [];

  // Hàm để lấy 8 sản phẩm ngẫu nhiên từ danh sách
  useEffect(() => {
    if (validFoodList.length > 0) {
      // Lọc sản phẩm theo category nếu cần
      const filteredList = category === "All" 
        ? validFoodList 
        : validFoodList.filter(item => item.category === category);
      
      // Lấy 8 sản phẩm ngẫu nhiên hoặc tất cả nếu ít hơn 8
      const getRandomProducts = (products, count) => {
        const shuffled = [...products].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, products.length));
      };
      
      setRandomProducts(getRandomProducts(filteredList, 8));
    }
  }, [validFoodList, category]);

  // Hàm hiển thị chi tiết sản phẩm
  const showProductDetail = (product) => {
    setSelectedProduct(product);
  };

  // Hàm đóng popup chi tiết sản phẩm
  const closeProductDetail = () => {
    setSelectedProduct(null);
  };

  return (
    <div className='food-display' id='food-display'>
      <h2>Sản Phẩm Nổi Bật</h2>
      <div className='food-display-list'>
        {randomProducts.length > 0 ? (
          randomProducts.map((item) => (
            <div key={item._id} onClick={() => showProductDetail(item)} className="food-item-container">
              <FoodItem 
                image={item.image} 
                name={item.name} 
                desc={item.description} 
                price={item.price} 
                id={item._id} 
              />
            </div>
          ))
        ) : (
          <p className="no-products">Đang cập nhật!</p>
        )}
      </div>

      {/* Chi tiết sản phẩm popup */}
      {selectedProduct && (
        <ProductDetailPopup 
          product={selectedProduct} 
          onClose={closeProductDetail} 
          onAddToCart={addToCart} 
        />
      )}
    </div>
  )
}

export default FoodDisplay
