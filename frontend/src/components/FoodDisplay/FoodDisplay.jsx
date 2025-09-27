import React, { useContext, useState, useEffect } from 'react'
import './FoodDisplay.css'
import FoodItem from '../FoodItem/FoodItem'
import { StoreContext } from '../../Context/StoreContext'
import ProductDetailPopup from '../ProductDetailPopup/ProductDetailPopup'
import { notifyAddedToCart } from '../../utils/notifications'

// Hàm định dạng giá tiền với dấu chấm ngăn cách
const formatPrice = (price) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const FoodDisplay = ({category}) => {
  const { food_list, addToCart, url } = useContext(StoreContext);
  const [randomProducts, setRandomProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : {};
  });

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

  // Hàm thêm vào giỏ hàng với hiệu ứng
  const handleAddToCart = (itemId) => {
    // Tìm thông tin sản phẩm để hiển thị thông báo
    const product = randomProducts.find((p) => p._id === itemId);

    // Cập nhật state
    if (!cart[itemId]) {
      setCart((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCart((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }

    // Cập nhật localStorage
    const updatedCart = { ...cart };
    updatedCart[itemId] = (updatedCart[itemId] || 0) + 1;
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Thông báo cập nhật giỏ hàng
    window.dispatchEvent(new Event("cartUpdated"));

    // Hiển thị thông báo đã thêm vào giỏ hàng
    if (product) {
      notifyAddedToCart(product.name);
    }

    // Tạo hiệu ứng sản phẩm bay vào giỏ hàng
    const productElement = document.querySelector(
      `[data-product-id="${itemId}"]`
    );
    if (productElement) {
      const cartIcon = document.querySelector(".navbar-search-icon");
      if (cartIcon) {
        // Tìm thông tin sản phẩm
        const product = randomProducts.find((p) => p._id === itemId);
        if (!product) return;

        const productRect = productElement.getBoundingClientRect();
        const cartRect = cartIcon.getBoundingClientRect();

        // Tạo sản phẩm bay
        const flyingProduct = document.createElement("div");
        flyingProduct.className = "flying-product";

        // Đặt style ban đầu
        flyingProduct.style.cssText = `
          position: fixed;
          top: ${productRect.top}px;
          left: ${productRect.left}px;
          width: 50px;
          height: 50px;
          background: url(${url}/images/${product.image}) center/cover;
          background-size: cover;
          border-radius: 50%;
          z-index: 1000;
          pointer-events: none;
          opacity: 0.9;
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          border: 2px solid rgba(255,255,255,0.8);
        `;

        document.body.appendChild(flyingProduct);

        // Tính toán đường bay
        const midX = (productRect.left + cartRect.left) / 2;
        const midY = productRect.top - 100;

        // Kích hoạt animation
        requestAnimationFrame(() => {
          // Đường bay parabol
          flyingProduct.style.transform = `translate(${
            midX - productRect.left
          }px, ${midY - productRect.top}px) rotate(-45deg)`;
          flyingProduct.style.opacity = "1";

          // Hoàn thành animation
          setTimeout(() => {
            flyingProduct.style.transform = `translate(${
              cartRect.left - productRect.left
            }px, ${cartRect.top - productRect.top}px) scale(0.1) rotate(45deg)`;
            flyingProduct.style.opacity = "0";

            // Bounce effect
            setTimeout(() => {
              flyingProduct.style.transform = `translate(${
                cartRect.left - productRect.left
              }px, ${
                cartRect.top - productRect.top
              }px) scale(0.1) rotate(45deg) translateY(5px)`;
            }, 100);
          }, 400);
        });

        // Tạo hiệu ứng nhảy số cho cart icon
        const cartCountElement = document.querySelector(".cart-count");
        if (cartCountElement) {
          cartCountElement.classList.remove("animate-bounce");
          setTimeout(() => {
            cartCountElement.classList.add("animate-bounce");
          }, 10);
        }

        // Xóa phần tử sau khi animation kết thúc
        setTimeout(() => {
          document.body.removeChild(flyingProduct);
        }, 800);
      }
    }
  };

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  return (
    <div className='food-display' id='food-display'>
      <h2>Sản Phẩm Nổi Bật</h2>
      <div className='food-display-list'>
        {randomProducts.length > 0 ? (
          randomProducts.map((item) => (
            <div key={item._id} className="food-item-container" data-product-id={item._id}>
              <div className="product-image" onClick={() => showProductDetail(item)}>
                <img src={item.image} alt={item.name} />
              </div>
              <h3 onClick={() => showProductDetail(item)}>{item.name}</h3>
              <p className="price">{formatPrice(item.price)} VNĐ</p>
              <p className="description">
                {item.description.length > 100
                  ? `${item.description.substring(0, 100)}...`
                  : item.description}
              </p>
              <button
                className={`add-to-cart ${cart[item._id] ? "added" : ""}`}
                onClick={() => handleAddToCart(item._id)}
                data-product-id={item._id}
              >
                {cart[item._id]
                  ? `Đã thêm (${cart[item._id]})`
                  : "Thêm vào giỏ"}
              </button>
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
          onAddToCart={() => handleAddToCart(selectedProduct._id)}
        />
      )}
    </div>
  )
}

export default FoodDisplay
