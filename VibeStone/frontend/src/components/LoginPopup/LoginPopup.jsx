import React, { useContext, useState } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { notifyLogin, notifyRegistration, notifyError } from '../../utils/notifications'

const LoginPopup = ({ setShowLogin }) => {

    const { setToken, url, loadCartData } = useContext(StoreContext)
    const [currState, setCurrState] = useState("Đăng ký");

    const [data, setData] = useState({
        name: "",
        email: "",
        password: ""
    })

    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setData(data => ({ ...data, [name]: value }))
    }

    const onLogin = async (e) => {
        e.preventDefault()

        let new_url = url;
        if (currState === "Đăng nhập") {
            new_url += "/api/user/login";
        }
        else {
            new_url += "/api/user/register"
        }

        // Nếu là đăng ký - hiển thị toast và đóng popup ngay lập tức
        if (currState === "Đăng ký") {
            // Hiển thị toast ngay
            toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.", {
                position: "top-right",
                autoClose: 7000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            
            // Đóng popup ngay
            setShowLogin(false);
            
            // Gọi API đăng ký ngầm (không await)
            registerUser(new_url, data);
            return;
        }

        // Xử lý đăng nhập bình thường (chờ API response)
        try {
            const response = await axios.post(new_url, data);
            if (response.data.success) {
                if (response.data.needVerification) {
                    toast.info("Tài khoản chưa được xác thực. Vui lòng kiểm tra email.", {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                    setShowLogin(false);
                    return;
                }
                
                // Lưu token và đăng nhập thành công
                setToken(response.data.token)
                localStorage.setItem("token", response.data.token)
                await loadCartData({token: response.data.token})
                notifyLogin(data.name || data.email)
                setShowLogin(false)
            }
            else {
                notifyError(response.data.message)
            }
        } catch (error) {
            if (error.response?.data?.needVerification) {
                toast.info("Tài khoản chưa được xác thực. Vui lòng kiểm tra email để xác thực tài khoản.", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            } else {
                notifyError(error.response?.data?.message || "Đã xảy ra lỗi")
            }
        }
    }

    // Hàm đăng ký chạy ngầm
    const registerUser = async (url, userData) => {
        try {
            const response = await axios.post(url, userData);
            console.log('Registration response:', response.data);
            
            // Nếu có lỗi thực sự (không phải needVerification), có thể hiển thị toast error
            if (!response.data.success && !response.data.needVerification) {
                toast.error("Có lỗi xảy ra khi đăng ký: " + response.data.message, {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        } catch (error) {
            console.error('Registration error:', error);
            // Chỉ hiển thị lỗi nghiêm trọng
            if (!error.response?.data?.needVerification) {
                toast.error("Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.", {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        }
    }

    return (
        <div className='login-popup'>
            <form onSubmit={onLogin} className="login-popup-container">
                <div className="login-popup-title">
                    <h2>{currState}</h2> <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
                </div>
                <div className="login-popup-inputs">
                    {currState === "Đăng ký" ? <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Tên tài khoản' required /> : <></>}
                    <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email của bạn' required />
                    <input name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder='Mật khẩu' required />
                </div>
                <button>{currState === "Đăng nhập" ? "Đăng nhập" : "Đăng ký"}</button>
                <div className="login-popup-condition">
                    <input type="checkbox" name="" id="" required/>
                    <p>Đồng ý với bảo mật và điều khoản!</p>
                </div>
                {currState === "Đăng nhập"
                    ? <p>Chưa có tài khoản? <span onClick={() => setCurrState('Đăng ký')}>Đăng ký</span></p>
                    : <p>Đã có tài khoản? <span onClick={() => setCurrState('Đăng nhập')}>Đăng nhập</span></p>
                }
            </form>
        </div>
    )
}

export default LoginPopup