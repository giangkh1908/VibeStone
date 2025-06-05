import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../../utils/config';
import './VerifyEmail.css';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        const email = searchParams.get('email');

        if (!token || !email) {
          setStatus('error');
          setMessage('Link xác thực không hợp lệ');
          return;
        }

        const apiUrl = getApiUrl();
        const response = await axios.get(
          `${apiUrl}/api/user/verify-email?token=${token}&email=${email}`
        );

        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message);
          setUserName(response.data.userName);
        } else {
          setStatus('error');
          setMessage(response.data.message);
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Có lỗi xảy ra khi xác thực email');
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleResendEmail = async () => {
    try {
      const email = searchParams.get('email');
      const apiUrl = getApiUrl();
      const response = await axios.post(
        `${apiUrl}/api/user/resend-verification`,
        { email }
      );
      
      if (response.data.success) {
        alert('Email xác thực đã được gửi lại thành công!');
      }
    } catch (error) {
      alert('Không thể gửi lại email xác thực');
    }
  };

  return (
    <div className="verify-email-container">
      <div className="verify-email-card">
        {status === 'verifying' && (
          <div className="verifying">
            <div className="spinner"></div>
            <h2>🔄 Đang xác thực email...</h2>
            <p>Vui lòng đợi trong giây lát</p>
          </div>
        )}

        {status === 'success' && (
          <div className="success">
            <div className="success-icon">✅</div>
            <h2>🎉 Xác thực thành công!</h2>
            <p>Chào mừng <strong>{userName}</strong> đến với VibeStone!</p>
            <p className="success-message">{message}</p>
            
            <div className="success-actions">
              <Link to="/" className="btn btn-primary">
                🏠 Về Trang Chủ
              </Link>
              <Link to="/store" className="btn btn-secondary">
                🛍️ Khám Phá Cửa Hàng
              </Link>
            </div>
            
            <div className="welcome-bonus">
              <h3>🎁 Ưu đãi chào mừng!</h3>
              <p>Sử dụng mã <span className="promo-code">WELCOME10</span> để được giảm 10% cho đơn hàng đầu tiên!</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="error">
            <div className="error-icon">❌</div>
            <h2>Xác thực thất bại</h2>
            <p className="error-message">{message}</p>
            
            <div className="error-actions">
              <button onClick={handleResendEmail} className="btn btn-primary">
                📧 Gửi lại Email Xác Thực
              </button>
              <Link to="/" className="btn btn-secondary">
                🏠 Về Trang Chủ
              </Link>
            </div>
            
            <div className="help-text">
              <p>Nếu vẫn gặp vấn đề, vui lòng liên hệ với chúng tôi qua:</p>
              <p>📧 Email: support@vibestone.com</p>
              <p>📞 Hotline: 1900-1234</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;