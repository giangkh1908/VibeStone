import { createContext, useEffect, useState } from "react";
import { menu_list } from "../assets/assets";
import axios from "axios";
import {
  notifyAddedToCart,
  notifyRemovedFromCart,
} from "../utils/notifications";
export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const url = "http://localhost:5000";
  const [food_list, setFoodList] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const currency = " VNĐ";
  const deliveryCharge = 10000;

  const addToCart = async (itemId) => {
    try {
      // Kiểm tra cartItems có tồn tại không
      if (!cartItems) {
        console.error("cartItems is undefined");
        return;
      }

      if (!cartItems[itemId]) {
        setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
      } else {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
      }

      if (token) {
        await axios.post(
          url + "/api/cart/add",
          { itemId },
          { headers: { token } }
        );
      }
    } catch (error) {
      console.error("Error in addToCart:", error);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      // Kiểm tra cartItems có tồn tại không
      if (!cartItems || !cartItems[itemId]) {
        console.error("cartItems is undefined or item not found");
        return;
      }

      // Lấy thông tin sản phẩm và kiểm tra xem có xóa hoàn toàn không
      const product = food_list.find((p) => p._id === itemId);
      const isCompletelyRemoving = cartItems[itemId] <= 1;

      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));

      if (token) {
        await axios.post(
          url + "/api/cart/remove",
          { itemId },
          { headers: { token } }
        );
      }

      // Thông báo cập nhật giỏ hàng
      window.dispatchEvent(new Event("cartUpdated"));

      // CHỈ hiển thị thông báo khi xóa hoàn toàn sản phẩm khỏi giỏ hàng (số lượng = 0)
      if (isCompletelyRemoving && product) {
        notifyRemovedFromCart(product.name);
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;

    // Kiểm tra cartItems có tồn tại không
    if (!cartItems) {
      return totalAmount;
    }

    for (const item in cartItems) {
      try {
        if (cartItems[item] > 0) {
          let itemInfo = food_list.find((product) => product._id === item);
          if (itemInfo) {
            totalAmount += itemInfo.price * cartItems[item];
          }
        }
      } catch (error) {
        console.log("Error calculating total:", error);
      }
    }
    return totalAmount;
  };

  const fetchFoodList = async () => {
    try {
      const response = await axios.get(url + "/api/food/list");
      setFoodList(response.data.data);
    } catch (error) {
      console.error("Error fetching food list:", error);
    }
  };

  const loadCartData = async (tokenObj) => {
    try {
      const response = await axios.post(
        url + "/api/cart/get",
        {},
        { headers: tokenObj }
      );

      if (response.data.success) {
        // Cập nhật state với dữ liệu từ database
        setCartItems(response.data.cartData || {});

        // Thông báo cập nhật giỏ hàng
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      console.error("Error loading cart data:", error);
      // Fallback: sử dụng dữ liệu từ localStorage nếu API thất bại
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        // Lấy danh sách sản phẩm
        await fetchFoodList();

        // Kiểm tra token trong localStorage
        const savedToken = localStorage.getItem("token");
        if (savedToken) {
          setToken(savedToken);

          // Lấy dữ liệu giỏ hàng từ database
          await loadCartData({ token: savedToken });
        } else {
          // Nếu không có token, kiểm tra giỏ hàng trong localStorage
          const savedCart = localStorage.getItem("cart");
          if (savedCart) {
            try {
              setCartItems(JSON.parse(savedCart));
            } catch (parseError) {
              console.error("Error parsing saved cart:", parseError);
              setCartItems({});
            }
          }
        }
      } catch (error) {
        console.error("Error in loadData:", error);
      }
    }
    loadData();
  }, []);

  const contextValue = {
    url,
    food_list,
    menu_list,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    token,
    setToken: (newToken) => {
      setToken(newToken);
      // Nếu token bị xóa (logout), reset cartItems
      if (!newToken) {
        setCartItems({});
      }
    },
    loadCartData,
    setCartItems,
    currency,
    deliveryCharge,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
