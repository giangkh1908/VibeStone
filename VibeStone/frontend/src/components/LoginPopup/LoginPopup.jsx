import React, { useContext, useState, useEffect, useRef } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const LoginPopup = ({ setShowLogin }) => {

    const { setToken, url, loadCartData } = useContext(StoreContext)
    const [currState, setCurrState] = useState("Đăng ký");
    const [isLoading, setIsLoading] = useState(false);
    const [fbLoading, setFbLoading] = useState(false);

    const [data, setData] = useState({
        name: "",
        email: "",
        password: ""
    })
    const loginPopupRef = useRef(null)

    // Facebook Business Login Configuration
    const FB_CONFIG_ID = '2660338754299019'; // Thay bằng CONFIG_ID bạn nhận được

    // Thiết lập Facebook callback functions
    useEffect(() => {
        // Đảm bảo Facebook SDK đã load
        window.fbAsyncInit = function() {
            window.FB.init({
                appId: '779759428148398',
                cookie: true,
                xfbml: true,
                version: 'v23.0'
            });
        };
    }, []);

    useEffect(() => {
        if (currState === "Đăng nhập" && window.FB && loginPopupRef.current) {
            window.FB.XFBML.parse(loginPopupRef.current);
        }
    }, [currState]);

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }))
    }

    const onLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        let newUrl = url;
        if (currState === "Đăng nhập") {
            newUrl += "/api/user/login"
        } else {
            newUrl += "/api/user/register"
        }

        try {
            const response = await axios.post(newUrl, data);
            if (response.data.success) {
                setToken(response.data.token);
                localStorage.setItem("token", response.data.token);
                await loadCartData(response.data.token);
                setShowLogin(false);
                toast.success(currState === "Đăng nhập" ? "Đăng nhập thành công!" : "Đăng ký thành công!");
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error("Có lỗi xảy ra, vui lòng thử lại");
        } finally {
            setIsLoading(false);
        }
    }

    // Facebook Business Login Handler
    const handleFacebookBusinessLogin = () => {
        setFbLoading(true);
        
        if (!window.FB) {
            toast.error('Facebook SDK chưa được tải');
            setFbLoading(false);
            return;
        }

        // Sử dụng FB.login với config_id cho Business Login
        window.FB.login(
            function(response) {
                console.log('Facebook Business Login Response:', response);
                
                if (response.status === 'connected') {
                    // Xử lý khi đăng nhập thành công
                    handleFacebookLoginSuccess(response);
                } else {
                    console.log('User cancelled login or did not fully authorize.');
                    setFbLoading(false);
                }
            },
            {
                config_id: FB_CONFIG_ID, // Sử dụng configuration ID
            }
        );
    };

    // Xử lý khi Facebook login thành công
    const handleFacebookLoginSuccess = async (response) => {
        try {
            const { authResponse } = response;
            
            // Lấy thông tin user từ Facebook Graph API
            window.FB.api('/me', { fields: 'name,email' }, async function(userInfo) {
                console.log('Facebook User Info:', userInfo);
                
                try {
                    // Gọi API backend để xử lý Facebook login
                    const loginResponse = await axios.post(`${url}/api/user/facebook-login`, {
                        facebookId: userInfo.id,
                        name: userInfo.name,
                        email: userInfo.email,
                        accessToken: authResponse.accessToken
                    });
                    
                    if (loginResponse.data.success) {
                        setToken(loginResponse.data.token);
                        localStorage.setItem('token', loginResponse.data.token);
                        await loadCartData(loginResponse.data.token);
                        setShowLogin(false);
                        toast.success('Đăng nhập Facebook thành công!');
                    } else {
                        toast.error(loginResponse.data.message || 'Đăng nhập thất bại');
                    }
                } catch (error) {
                    console.error('Backend login error:', error);
                    toast.error('Có lỗi xảy ra khi đăng nhập');
                }
                
                setFbLoading(false);
            });
            
        } catch (error) {
            console.error('Facebook login error:', error);
            toast.error('Có lỗi xảy ra khi đăng nhập Facebook');
            setFbLoading(false);
        }
    };

    return (
        <div className="login-popup">
            <form ref={loginPopupRef} onSubmit={onLogin} className="login-popup-container">
                <div className="login-popup-title">
                    <h2>{currState}</h2>
                    <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
                </div>
                <div className="login-popup-inputs">
                    {currState === "Đăng ký" && (
                        <input
                            name='name'
                            onChange={onChangeHandler}
                            value={data.name}
                            type="text"
                            placeholder='Tên của bạn'
                            required
                        />
                    )}
                    <input
                        name='email'
                        onChange={onChangeHandler}
                        value={data.email}
                        type="email"
                        placeholder='Email của bạn'
                        required
                    />
                    <input
                        name='password'
                        onChange={onChangeHandler}
                        value={data.password}
                        type="password"
                        placeholder='Mật khẩu'
                        required
                    />
                </div>
                
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Đang xử lý...' : (currState === "Đăng ký" ? "Tạo tài khoản" : "Đăng nhập")}
                </button>

                {currState === "Đăng nhập" && (
                    <div className="facebook-login-section">
                        <div className="login-divider">
                            <span>hoặc</span>
                        </div>
                        
                        <button 
                            type="button" 
                            className="facebook-login-button"
                            onClick={handleFacebookBusinessLogin}
                            disabled={fbLoading}
                        >
                            {fbLoading ? (
                                <span>Đang đăng nhập...</span>
                            ) : (
                                <>
                                    <img src={assets.facebook_icon} alt="Facebook" />
                                    <span>Đăng nhập bằng Facebook</span>
                                </>
                            )}
                        </button>
                    </div>
                )}

                <div className="login-popup-condition">
                    <input type="checkbox" required />
                    <p>Bằng việc tiếp tục, tôi đồng ý với điều khoản sử dụng & chính sách riêng tư.</p>
                </div>
                
                {currState === "Đăng nhập" ? (
                    <p>Tạo tài khoản mới? <span onClick={() => setCurrState("Đăng ký")}>Nhấn vào đây</span></p>
                ) : (
                    <p>Đã có tài khoản? <span onClick={() => setCurrState("Đăng nhập")}>Đăng nhập tại đây</span></p>
                )}
            </form>
        </div>
    )
}

export default LoginPopup