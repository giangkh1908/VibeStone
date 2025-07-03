import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Feedback.css';

// Using window.location.origin as a fallback for API URL
const url = 'https://vibe-stone-backend.vercel.app'

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${url}/api/feedback/admin?page=${currentPage}&status=${statusFilter}`,
        { headers: { token } }
      );

      if (response.data.success) {
        setFeedbacks(response.data.data);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast.error('Có lỗi xảy ra khi lấy danh sách góp ý');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [currentPage, statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${url}/api/feedback/admin/${id}`,
        { status: newStatus },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Cập nhật trạng thái thành công');
        fetchFeedbacks();
      }
    } catch (error) {
      console.error('Error updating feedback status:', error);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa góp ý này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${url}/api/feedback/admin/${id}`,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Xóa góp ý thành công');
        fetchFeedbacks();
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error('Có lỗi xảy ra khi xóa góp ý');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'read':
        return 'status-read';
      // case 'deleted':
      //   return 'status-deleted';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'read':
        return 'Đã đọc';
      // case 'deleted':
      //   return 'Đã xóa';
      default:
        return status;
    }
  };

  return (
    <div className="feedback-container">
      <div className="feedback-header">
        <h1>Quản lý góp ý</h1>
        <div className="filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="read">Đã đọc</option>
            {/* <option value="deleted">Đã xóa</option> */}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <>
          <div className="feedback-list">
            {feedbacks.map((feedback) => (
              <div key={feedback._id} className="feedback-item">
                <div className="feedback-header">
                  <span className={`status-badge ${getStatusBadgeClass(feedback.status)}`}>
                    {getStatusText(feedback.status)}
                  </span>
                  <span className="feedback-date">
                    {new Date(feedback.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                <div className="feedback-content">{feedback.content}</div>
                <div className="feedback-footer">
                  <div className="user-info">
                    {feedback.user ? (
                      <>
                        <span className="user-name">{feedback.user.name}</span>
                        <span className="user-email">{feedback.user.email}</span>
                      </>
                    ) : (
                      <span className="anonymous-user">Ẩn danh người dùng</span>
                    )}
                  </div>
                  <div className="feedback-actions">
                    {feedback.status !== 'read' && (
                      <button
                        onClick={() => handleStatusChange(feedback._id, 'read')}
                        className="action-button read"
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}
                    {feedback.status !== 'deleted' && (
                      <button
                        onClick={() => handleDelete(feedback._id)}
                        className="action-button delete"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Trước
              </button>
              <span className="pagination-info">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Feedback;
