import React, { useContext, useEffect, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../Context/StoreContext'
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const PlaceOrder = () => {
    const [payment, setPayment] = useState("cod")
    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        street: "",
        ward: "",    // Phường/xã
        district: "", // Quận/huyện  
        city: "",     // Tỉnh/thành phố
        country: "Việt Nam",
        phone: ""
    })

    // State cho địa chỉ
    const [provinces, setProvinces] = useState([])
    const [districts, setDistricts] = useState([])
    const [wards, setWards] = useState([])
    const [selectedProvince, setSelectedProvince] = useState("")
    const [selectedDistrict, setSelectedDistrict] = useState("")
    const [loading, setLoading] = useState({
        provinces: false,
        districts: false,
        wards: false
    })

    const { getTotalCartAmount, token, food_list, cartItems, url, setCartItems, currency, deliveryCharge } = useContext(StoreContext);
    const navigate = useNavigate();

    // Hàm định dạng tiền tệ
    const formatCurrency = (amount) => {
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    // Load danh sách tỉnh/thành phố khi component mount
    useEffect(() => {
        loadProvinces()
    }, [])

    // Load danh sách tỉnh/thành phố
    const loadProvinces = async () => {
        try {
            setLoading(prev => ({ ...prev, provinces: true }))
            const response = await axios.get('https://provinces.open-api.vn/api/p/')
            setProvinces(response.data)
        } catch (error) {
            console.error('Error loading provinces:', error)
            toast.error('Không thể tải danh sách tỉnh/thành phố')
        } finally {
            setLoading(prev => ({ ...prev, provinces: false }))
        }
    }

    // Load danh sách quận/huyện khi chọn tỉnh
    const loadDistricts = async (provinceCode) => {
        try {
            setLoading(prev => ({ ...prev, districts: true }))
            const response = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
            setDistricts(response.data.districts || [])
            setWards([]) // Reset danh sách phường/xã
            setSelectedDistrict("")
            setData(prev => ({ ...prev, district: "", ward: "" }))
        } catch (error) {
            console.error('Error loading districts:', error)
            toast.error('Không thể tải danh sách quận/huyện')
        } finally {
            setLoading(prev => ({ ...prev, districts: false }))
        }
    }

    // Load danh sách phường/xã khi chọn quận/huyện
    const loadWards = async (districtCode) => {
        try {
            setLoading(prev => ({ ...prev, wards: true }))
            const response = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
            setWards(response.data.wards || [])
            setData(prev => ({ ...prev, ward: "" }))
        } catch (error) {
            console.error('Error loading wards:', error)
            toast.error('Không thể tải danh sách phường/xã')
        } finally {
            setLoading(prev => ({ ...prev, wards: false }))
        }
    }

    // Xử lý thay đổi tỉnh/thành phố
    const handleProvinceChange = (e) => {
        const provinceCode = e.target.value
        const provinceName = provinces.find(p => p.code.toString() === provinceCode)?.name || ""
        
        setSelectedProvince(provinceCode)
        setData(prev => ({ ...prev, city: provinceName }))
        
        if (provinceCode) {
            loadDistricts(provinceCode)
        } else {
            setDistricts([])
            setWards([])
            setSelectedDistrict("")
        }
    }

    // Xử lý thay đổi quận/huyện
    const handleDistrictChange = (e) => {
        const districtCode = e.target.value
        const districtName = districts.find(d => d.code.toString() === districtCode)?.name || ""
        
        setSelectedDistrict(districtCode)
        setData(prev => ({ ...prev, district: districtName }))
        
        if (districtCode) {
            loadWards(districtCode)
        } else {
            setWards([])
        }
    }

    // Xử lý thay đổi phường/xã
    const handleWardChange = (e) => {
        const wardCode = e.target.value
        const wardName = wards.find(w => w.code.toString() === wardCode)?.name || ""
        setData(prev => ({ ...prev, ward: wardName }))
    }

    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setData(data => ({ ...data, [name]: value }))
    }

    const placeOrder = async (e) => {
        e.preventDefault()
        
        // Validate địa chỉ
        if (!data.city || !data.district || !data.ward) {
            toast.error("Vui lòng chọn đầy đủ thông tin địa chỉ!")
            return
        }

        let orderItems = [];
        food_list.map(((item) => {
            if (cartItems[item._id] > 0) {
                let itemInfo = item;
                itemInfo["quantity"] = cartItems[item._id];
                orderItems.push(itemInfo)
            }
        }))
        
        let orderData = {
            address: data,
            items: orderItems,
            amount: getTotalCartAmount() + deliveryCharge,
        }
        
        try {
            let response;
            if (payment === "stripe") {
                response = await axios.post(url + "/api/order/place", orderData, { headers: { token } });
                if (response.data.success) {
                    const { session_url } = response.data;
                    window.location.replace(session_url);
                }
                else {
                    toast.error("Có lỗi xảy ra khi đặt hàng")
                }
            }
            else {
                response = await axios.post(url + "/api/order/placecod", orderData, { headers: { token } });
                if (response.data.success) {
                    navigate("/myorders")
                    toast.success("Đặt hàng thành công! Email xác nhận đã được gửi.")
                    setCartItems({});
                    // Xóa localStorage khi đặt hàng thành công
                    localStorage.removeItem('cart');
                    // Dispatch event để cập nhật navbar
                    window.dispatchEvent(new Event('cartUpdated'));
                }
                else {
                    toast.error("Có lỗi xảy ra khi đặt hàng")
                }
            }
        } catch (error) {
            console.error('Order error:', error)
            toast.error("Có lỗi xảy ra khi đặt hàng")
        }
    }

    useEffect(() => {
        if (!token) {
            toast.error("Bạn phải thực hiện đăng nhập để đặt hàng!")
            navigate('/cart')
        }
        else if (getTotalCartAmount() === 0) {
            navigate('/cart')
        }
    }, [token])

    return (
        <form onSubmit={placeOrder} className='place-order'>
            <div className="place-order-left">
                <p className='title'>Thông tin giao hàng</p>
                <div className="multi-field">
                    <input 
                        type="text" 
                        name='firstName' 
                        onChange={onChangeHandler} 
                        value={data.firstName} 
                        placeholder='Họ và tên đệm' 
                        required 
                    />
                    <input 
                        type="text" 
                        name='lastName' 
                        onChange={onChangeHandler} 
                        value={data.lastName} 
                        placeholder='Tên' 
                        required 
                    />
                </div>
                
                <input 
                    type="email" 
                    name='email' 
                    onChange={onChangeHandler} 
                    value={data.email} 
                    placeholder='Email nhận thông báo' 
                    required 
                />
                
                <input 
                    type="text" 
                    name='phone' 
                    onChange={onChangeHandler} 
                    value={data.phone} 
                    placeholder='Số điện thoại' 
                    required 
                />

                {/* Quốc gia - mặc định Việt Nam */}
                <input 
                    type="text" 
                    name='country' 
                    value={data.country} 
                    placeholder='Quốc gia' 
                    readOnly 
                    className="readonly-input"
                />

                {/* Tỉnh/Thành phố */}
                <select 
                    value={selectedProvince}
                    onChange={handleProvinceChange}
                    required
                    disabled={loading.provinces}
                    className="address-select"
                >
                    <option value="">
                        {loading.provinces ? "Đang tải..." : "Chọn Tỉnh/Thành phố"}
                    </option>
                    {provinces.map(province => (
                        <option key={province.code} value={province.code}>
                            {province.name}
                        </option>
                    ))}
                </select>

                {/* Quận/Huyện */}
                <select 
                    value={selectedDistrict}
                    onChange={handleDistrictChange}
                    required
                    disabled={!selectedProvince || loading.districts}
                    className="address-select"
                >
                    <option value="">
                        {loading.districts ? "Đang tải..." : "Chọn Quận/Huyện"}
                    </option>
                    {districts.map(district => (
                        <option key={district.code} value={district.code}>
                            {district.name}
                        </option>
                    ))}
                </select>

                {/* Phường/Xã */}
                <select 
                    onChange={handleWardChange}
                    required
                    disabled={!selectedDistrict || loading.wards}
                    className="address-select"
                >
                    <option value="">
                        {loading.wards ? "Đang tải..." : "Chọn Phường/Xã"}
                    </option>
                    {wards.map(ward => (
                        <option key={ward.code} value={ward.code}>
                            {ward.name}
                        </option>
                    ))}
                </select>

                {/* Địa chỉ cụ thể */}
                <input 
                    type="text" 
                    name='street' 
                    onChange={onChangeHandler} 
                    value={data.street} 
                    placeholder='Số nhà, tên đường' 
                    required 
                />
            </div>
            
            <div className="place-order-right">
                <div className="cart-total">
                    <h2>Chi tiết đơn hàng</h2>
                    <div>
                        <div className="cart-total-details">
                            <p>Thành tiền</p>
                            <p>{formatCurrency(getTotalCartAmount())}{currency}</p>
                        </div>
                        <hr />
                        <div className="cart-total-details">
                            <p>Phí giao hàng</p>
                            <p>{formatCurrency(getTotalCartAmount() === 0 ? 0 : deliveryCharge)}{currency}</p>
                        </div>
                        <hr />
                        <div className="cart-total-details">
                            <b>Tổng cộng</b>
                            <b>{formatCurrency(getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + deliveryCharge)}{currency}</b>
                        </div>
                    </div>
                </div>
                
                <div className="payment">
                    <h2>Phương thức thanh toán</h2>
                    <div onClick={() => setPayment("cod")} className="payment-option">
                        <img src={payment === "cod" ? assets.checked : assets.un_checked} alt="" />
                        <p>COD ( Thanh toán khi nhận hàng )</p>
                    </div>
                </div>
                
                <button className='place-order-submit' type='submit'>
                    {payment === "cod" ? "Đặt hàng" : "Thanh toán"}
                </button>
            </div>
        </form>
    )
}

export default PlaceOrder
