import { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { toast } from 'react-toastify';
import './FeedbackPopup.css';

// Using window.location.origin as a fallback for API URL
const API_URL = window.location.origin.includes('localhost') 
  ? 'http://localhost:5000'  // Backend API port
  : window.location.origin;

const FeedbackPopup = ({ isOpen, onClose }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung góp ý');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');

      // First get user info if logged in
      let userInfo = null;
      if (token) {
        try {
          const userResponse = await axios.get(`${API_URL}/api/user/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (userResponse.data.success) {
            userInfo = {
              name: userResponse.data.data.name,
              email: userResponse.data.data.email
            };
          }
        } catch (error) {
          console.error('Error getting user info:', error);
        }
      }

      // Then submit feedback
      const response = await axios.post(`${API_URL}/api/feedback`,
        { 
          content: content.trim(),
          user: userInfo
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : undefined
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setContent('');
        onClose();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi gửi góp ý';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="feedback-popup-overlay" onClick={onClose}>
      <div className="feedback-popup" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Gửi góp ý</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập góp ý của bạn..."
            rows="5"
            maxLength="500"
            required
          />
          <div className="character-count">
            {content.length}/500 ký tự
          </div>
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi góp ý'}
          </button>
        </form>
      </div>
    </div>
  );
};

FeedbackPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default FeedbackPopup; 