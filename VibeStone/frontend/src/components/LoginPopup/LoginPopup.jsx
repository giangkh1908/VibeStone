import React, { useContext, useState, useEffect, useRef } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { notifyLogin, notifyRegistration, notifyError } from '../../utils/notifications'

const LoginPopup = ({ setShowLogin }) => {

    const { setToken, url, loadCartData } = useContext(StoreContext)
    const [currState, setCurrState] = useState("Đăng ký");
    const [isLoading, setIsLoading] = useState(false);

    const [data, setData] = useState({
        name: "",
        email: "",
        password: ""
    })
    const loginPopupRef = useRef(null)

    // Thiết lập Facebook callback functions
    useEffect(() => {
        // Định nghĩa hàm checkLoginState trên window object
        window.checkLoginState = function() {
            if (window.FB) {
                window.FB.getLoginStatus(function(response) {
                    statusChangeCallback(response);
                });
            }
        };

        // Định nghĩa hàm statusChangeCallback
        window.statusChangeCallback = function(response) {
            console.log('Facebook status change:', response);
            
            if (response.status === 'connected') {
                // User đã đăng nhập Facebook và authorize app
                console.log('User is connected:', response.authResponse);
                handleFacebookUserInfo(response.authResponse);
            } else if (response.status === 'not_authorized') {
                // User đã đăng nhập Facebook nhưng chưa authorize app
                console.log('User logged into Facebook but not authorized app');
                notifyError("Bạn cần cấp quyền để đăng nhập bằng Facebook");
            } else {
                // User chưa đăng nhập Facebook
                console.log('User not logged into Facebook');
            }
        };

        // Parse Facebook XFBML khi component mount
        if (window.FB) {
            window.FB.XFBML.parse();
        }

        // Cleanup function
        return () => {
            delete window.checkLoginState;
            delete window.statusChangeCallback;
        };
    }, []);

    useEffect(() => {
        if (currState === "Đăng nhập" && window.FB && loginPopupRef.current) {
            window.FB.XFBML.parse(loginPopupRef.current);
        }
    }, [currState]);

    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setData(data => ({ ...data, [name]: value }))
    }

    const onLogin = async (e) => {
        e.preventDefault()
        setIsLoading(true);

        let new_url = url;
        if (currState === "Đăng nhập") {
            new_url += "/api/user/login";
        }
        else {
            new_url += "/api/user/register"
        }

        // Nếu là đăng ký - hiển thị toast và đóng popup ngay lập tức
        if (currState === "Đăng ký") {
            toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.", {
                position: "top-right",
                autoClose: 7000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            
            setShowLogin(false);
            registerUser(new_url, data);
            setIsLoading(false);
            return;
        }

        // Xử lý đăng nhập bình thường
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
        } finally {
            setIsLoading(false);
        }
    }

    // Hàm đăng ký chạy ngầm
    const registerUser = async (url, userData) => {
        try {
            const response = await axios.post(url, userData);
            console.log('Registration response:', response.data);
            
            if (!response.data.success && !response.data.needVerification) {
                toast.error("Có lỗi xảy ra khi đăng ký: " + response.data.message, {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        } catch (error) {
            console.error('Registration error:', error);
            if (!error.response?.data?.needVerification) {
                toast.error("Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.", {
                    position: "top-right",
                    autoClose: 5000,
                });
            }
        }
    }

    // Callback được gọi khi trạng thái Facebook thay đổi
    const statusChangeCallback = (response) => {
        console.log('Status change callback:', response);
        
        if (response.status === 'connected') {
            setIsLoading(true);
            handleFacebookUserInfo(response.authResponse);
        }
    };

    // Xử lý thông tin user từ Facebook
    const handleFacebookUserInfo = (authResponse) => {
        console.log('Getting user info with access token:', authResponse.accessToken);

        window.FB.api('/me', { 
            fields: 'id,name,email,picture.width(200).height(200)',
            access_token: authResponse.accessToken 
        }, async (userInfo) => {
            console.log('Facebook user info:', userInfo);

            if (userInfo.error) {
                console.error('Facebook API error:', userInfo.error);
                notifyError("Không thể lấy thông tin từ Facebook");
                setIsLoading(false);
                return;
            }

            try {
                // Chuẩn bị dữ liệu gửi lên server
                const facebookData = {
                    facebookId: userInfo.id,
                    name: userInfo.name,
                    email: userInfo.email || null,
                    picture: userInfo.picture?.data?.url || null,
                    accessToken: authResponse.accessToken,
                    userID: authResponse.userID
                };

                console.log('Sending to backend:', facebookData);

                // Gửi thông tin Facebook tới backend
                const loginResponse = await axios.post(url + "/api/user/facebook-login", facebookData);

                console.log('Backend response:', loginResponse.data);

                if (loginResponse.data.success) {
                    // Đăng nhập thành công
                    setToken(loginResponse.data.token)
                    localStorage.setItem("token", loginResponse.data.token)
                    await loadCartData({token: loginResponse.data.token})
                    notifyLogin(userInfo.name)
                    setShowLogin(false)
                } else {
                    notifyError(loginResponse.data.message || "Đăng nhập Facebook thất bại")
                }
            } catch (error) {
                console.error('Facebook login error:', error);
                if (error.response?.data?.message) {
                    notifyError(error.response.data.message);
                } else {
                    notifyError("Đăng nhập Facebook thất bại. Vui lòng thử lại.");
                }
            } finally {
                setIsLoading(false);
            }
        });
    };

    return (
        <div className='login-popup'>
            <form ref={loginPopupRef} onSubmit={onLogin} className="login-popup-container">
                <div className="login-popup-title">
                    <h2>{currState}</h2> 
                    <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
                </div>
                <div className="login-popup-inputs">
                    {currState === "Đăng ký" ? 
                        <input 
                            name='name' 
                            onChange={onChangeHandler} 
                            value={data.name} 
                            type="text" 
                            placeholder='Tên tài khoản' 
                            required 
                            disabled={isLoading}
                        /> : <></>
                    }
                    <input 
                        name='email' 
                        onChange={onChangeHandler} 
                        value={data.email} 
                        type="email" 
                        placeholder='Email của bạn' 
                        required 
                        disabled={isLoading}
                    />
                    <input 
                        name='password' 
                        onChange={onChangeHandler} 
                        value={data.password} 
                        type="password" 
                        placeholder='Mật khẩu' 
                        required 
                        disabled={isLoading}
                    />
                </div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Đang xử lý..." : (currState === "Đăng nhập" ? "Đăng nhập" : "Đăng ký")}
                </button>
                
                {currState === "Đăng nhập" && (
                    <div className="facebook-login-section">
                        <div className="login-divider">
                            <span>hoặc</span>
                        </div>
                        {/* Facebook Login Button chính thức */}
                        <div className="fb-login-wrapper">
                            <div 
                                className="fb-login-button" 
                                data-width=""
                                data-size="large"
                                data-button-type="login_with"
                                data-layout="default"
                                data-auto-logout-link="false"
                                data-use-continue-as="false"
                                data-scope="public_profile,email"
                                data-onlogin="checkLoginState();"
                            ></div>
                        </div>
                        
                        {/* Loading indicator cho Facebook */}
                        {isLoading && (
                            <div className="facebook-loading">
                                <p>Đang xử lý đăng nhập Facebook...</p>
                            </div>
                        )}
                    </div>
                )}
                
                <div className="login-popup-condition">
                    <input type="checkbox" name="" id="" required disabled={isLoading}/>
                    <p>Đồng ý với bảo mật và điều khoản!</p>
                </div>
                {currState === "Đăng nhập"
                    ? <p>Chưa có tài khoản? <span onClick={() => !isLoading && setCurrState('Đăng ký')}>Đăng ký</span></p>
                    : <p>Đã có tài khoản? <span onClick={() => !isLoading && setCurrState('Đăng nhập')}>Đăng nhập</span></p>
                }
            </form>
        </div>
    )
}

export default LoginPopup