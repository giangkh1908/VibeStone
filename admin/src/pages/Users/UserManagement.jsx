import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filterStatus, users]);

  const filterUsers = () => {
    let filtered = [...users];
    
    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Lọc theo trạng thái xác thực
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => 
        filterStatus === 'verified' ? user.isVerified : !user.isVerified
      );
    }
    
    setFilteredUsers(filtered);
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://vibe-stone-backend.vercel.app/api/users');
      if (response.data) {
        const userList = Array.isArray(response.data) ? response.data : [];
        setUsers(userList);
        setFilteredUsers(userList);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error("Lỗi lấy danh sách người dùng");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
    });
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await axios.delete(`https://vibe-stone-backend.vercel.app/api/users/${userId}`);
        toast.success("Xóa người dùng thành công");
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error("Lỗi xóa người dùng");
      }
    }
  };

  const handleToggleVerification = async (userId) => {
    try {
      await axios.put(`https://vibe-stone-backend.vercel.app/api/users/${userId}/toggle-verification`);
      toast.success("Cập nhật trạng thái xác thực thành công");
      fetchUsers();
    } catch (error) {
      console.error('Error toggling verification:', error);
      toast.error("Lỗi cập nhật trạng thái xác thực");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.put(`https://vibe-stone-backend.vercel.app/api/users/${editingUser._id}`, formData);
        toast.success("Cập nhật người dùng thành công");
      }
      setEditingUser(null);
      setFormData({ name: '', email: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error("Lỗi cập nhật người dùng");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="user-management">
      <h2>Quản lý người dùng</h2>
      
      <div className="search-filter-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="verified">Đã xác thực</option>
            <option value="unverified">Chưa xác thực</option>
          </select>
        </div>
      </div>
      
      {editingUser && (
        <div className="edit-form">
          <h3>Chỉnh sửa người dùng</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tên:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-buttons">
              <button type="submit" className="save-btn">Lưu thay đổi</button>
              <button type="button" className="cancel-btn" onClick={() => setEditingUser(null)}>
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <button
                    className={`verify-btn ${user.isVerified ? 'verified' : 'unverified'}`}
                    onClick={() => handleToggleVerification(user._id)}
                  >
                    {user.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                  </button>
                </td>
                <td className="actions">
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(user)}
                  >
                    Sửa
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(user._id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement; 