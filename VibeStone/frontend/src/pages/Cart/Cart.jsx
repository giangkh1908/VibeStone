import React, { useState, useEffect, useContext, useRef } from 'react'
import './Cart.css'
import { useNavigate } from 'react-router-dom'
import { StoreContext } from '../../Context/StoreContext'
import { notifyRemovedFromCart } from '../../utils/notifications'
import axios from 'axios'
import useDebounce from '../../hooks/useDebounce'

const Cart = () => {
  const [cartItems, setCartItems] = useState({})
  const [products, setProducts] = useState([])
  const [pendingChanges, setPendingChanges] = useState({}) // Theo dõi quantity changes
  const [isUpdating, setIsUpdating] = useState(false)
  const navigate = useNavigate()
  const CURRENCY = ' VNĐ'
  const DELIVERY_CHARGE = 5000
  const { url, token, food_list, setCartItems: setContextCartItems } = useContext(StoreContext)
  
  // Debounce pending changes với delay 1.5 giây
  const debouncedPendingChanges = useDebounce(pendingChanges, 1500)
  
  const isMountedRef = useRef(true)

  // Hàm định dạng tiền tệ
  const formatCurrency = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    // Lấy dữ liệu giỏ hàng từ localStorage
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }

    // Lấy danh sách sản phẩm từ localStorage
    const savedProducts = localStorage.getItem('products')
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts))
    }
  }, [])

  // Effect để batch sync với server
  useEffect(() => {
    const batchSyncWithServer = async () => {
      if (!token || Object.keys(debouncedPendingChanges).length === 0 || isUpdating) {
        return
      }

      setIsUpdating(true)
      
      try {
        console.log('🔄 Batch syncing cart changes with server...', debouncedPendingChanges)
        
        // Gọi API batch update một lần duy nhất
        await axios.post(url + "/api/cart/batch-update", {
          items: debouncedPendingChanges
        }, { 
          headers: { token } 
        })
        
        // Clear pending changes sau khi sync thành công
        setPendingChanges({})
        
      } catch (error) {
        console.error('❌ Error batch syncing cart with server:', error)
        // Có thể hiển thị thông báo lỗi cho user
      } finally {
        if (isMountedRef.current) {
          setIsUpdating(false)
        }
      }
    }

    batchSyncWithServer()
  }, [debouncedPendingChanges, token, url])

  // Hàm helper để update local state và pending changes
  const updateCartItem = (itemId, newQuantity) => {
    // Ensure minimum quantity is 1 (or 0 to remove)
    const finalQuantity = Math.max(0, newQuantity)
    
    // Cập nhật state local ngay lập tức
    setCartItems(prevCart => {
      const newCart = { ...prevCart }
      
      if (finalQuantity === 0) {
        delete newCart[itemId]
      } else {
        newCart[itemId] = finalQuantity
      }
      
      localStorage.setItem('cart', JSON.stringify(newCart))
      return newCart
    })
    
    // Cập nhật context cart items
    setContextCartItems(prevCart => {
      const newCart = { ...prevCart }
      
      if (finalQuantity === 0) {
        delete newCart[itemId]
      } else {
        newCart[itemId] = finalQuantity
      }
      
      return newCart
    })
    
    // Queue cho batch update nếu đã đăng nhập
    if (token) {
      setPendingChanges(prev => {
        const newPending = { ...prev }
        
        if (finalQuantity === 0) {
          delete newPending[itemId]
        } else {
          newPending[itemId] = finalQuantity
        }
        
        return newPending
      })
    }
    
    // Trigger cart updated event
    window.dispatchEvent(new Event('cartUpdated'))
  }

  // Tăng số lượng sản phẩm
  const increaseQuantity = (itemId) => {    
    try {
      const currentQuantity = cartItems[itemId] || 0
      updateCartItem(itemId, currentQuantity + 1)
    } catch (error) {
      console.error('Error increasing quantity:', error)
    }
  }

  // Giảm số lượng sản phẩm (tối thiểu là 1)
  const decreaseQuantity = (itemId) => {
    try {
      const currentQuantity = cartItems[itemId] || 0
      if (currentQuantity > 1) {
        updateCartItem(itemId, currentQuantity - 1)
      }
    } catch (error) {
      console.error('Error decreasing quantity:', error)
    }
  }

  // Xóa toàn bộ sản phẩm
  const removeItem = async (itemId) => {
    try {
      // Tìm sản phẩm để hiển thị thông báo
      const product = food_list.find(p => p._id === itemId)
      
      // Set quantity = 0 để xóa
      updateCartItem(itemId, 0)
      
      // Tạo hiệu ứng nhảy cho cart icon
      const cartCountElement = document.querySelector('.cart-count')
      if (cartCountElement) {
        cartCountElement.classList.remove('animate-bounce')
        setTimeout(() => {
          cartCountElement.classList.add('animate-bounce')
        }, 10)
      }
      
      // Hiển thị thông báo khi xóa sản phẩm
      if (product) {
        notifyRemovedFromCart(product.name)
      }
      
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  // Thêm hàm để set quantity trực tiếp (cho input number)
  const setQuantity = (itemId, quantity) => {
    const numQuantity = parseInt(quantity) || 1
    updateCartItem(itemId, numQuantity)
  }

  const getTotalCartAmount = () => {
    let totalAmount = 0
    for (const itemId in cartItems) {
      const product = food_list.find(p => p._id === itemId)
      if (product) {
        totalAmount += product.price * cartItems[itemId]
      }
    }
    return totalAmount
  }

  const handleCheckout = () => {
    console.log('Checkout button clicked')
    console.log('Cart items:', cartItems)
    console.log('Total amount:', getTotalCartAmount())
    
    // Kiểm tra xem có sản phẩm trong giỏ hàng không
    if (getTotalCartAmount() === 0) {
      alert('Giỏ hàng của bạn đang trống!')
      return
    }
    
    // Kiểm tra nếu đang có pending changes
    if (Object.keys(pendingChanges).length > 0) {
      alert('Đang đồng bộ giỏ hàng với server, vui lòng đợi một chút...')
      return
    }
    
    // Đồng bộ cartItems với StoreContext trước khi navigate
    setContextCartItems(cartItems)
    
    try {
      navigate('/order')
      console.log('Navigation attempted to /order')
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }

  return (
    <div className='cart'>

      
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Sản phẩm </p> <p>Tiêu đề </p> <p>Giá </p> <p>Số lượng </p> <p>Tổng </p> <p>Gỡ bỏ</p>
        </div>
        <br />
        <hr />
        {food_list.map((item, index)=> {
          if (item && cartItems[item._id] > 0) {
            return (
              <div key={index}>
              <div className="cart-items-title cart-items-item">
                  <img src={item.image} alt={item.name} />
                <p>{item.name}</p>
                  <p>{formatCurrency(item.price)}{CURRENCY}</p>
                  <div className="quantity-controls">
                    <button 
                      onClick={() => decreaseQuantity(item._id)}
                      disabled={cartItems[item._id] <= 1}
                    >
                      -
                    </button>
                    
                    {/* Input number để set quantity trực tiếp */}
                    <input 
                      type="number" 
                      min="1" 
                      value={cartItems[item._id]} 
                      onChange={(e) => setQuantity(item._id, e.target.value)}
                      className="quantity-input"
                    />
                    
                    <button onClick={() => increaseQuantity(item._id)}>+</button>
                  </div>
                  <p>{formatCurrency(item.price * cartItems[item._id])}{CURRENCY}</p>
                  <p className='cart-items-remove-icon' onClick={() => removeItem(item._id)}>x</p>
                </div>
                <hr />
              </div>
            )
          }
          return null
        })}
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Tổng kết giỏ hàng</h2>
          <div>
            <div className="cart-total-details">
              <p>Thành tiền</p>
              <p>{formatCurrency(getTotalCartAmount())}{CURRENCY}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Phí vận chuyển</p>
              <p>{formatCurrency(getTotalCartAmount() === 0 ? 0 : DELIVERY_CHARGE)}{CURRENCY}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Tổng</b>
              <b>{formatCurrency(getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + DELIVERY_CHARGE)}{CURRENCY}</b>
            </div>
          </div>
          <button onClick={handleCheckout}>THANH TOÁN</button>
        </div>
        <div className="cart-promocode">
          <div>
            <p>Nếu bạn có mã khuyến mãi, hãy nhập nó vào đây!</p>
            <div className='cart-promocode-input'>
              <input type="text" placeholder='Mã khuyến mãi'/>
              <button>Xác nhận</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart