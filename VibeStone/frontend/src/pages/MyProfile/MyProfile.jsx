import { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../../Context/StoreContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import './MyProfile.css';

const MyProfile = () => {
  const { url, token } = useContext(StoreContext);
  
  const [activeTab, setActiveTab] = useState('password');
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    isDefault: false,
  });

  const [avatar, setAvatar] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const userData = response.data.data;
        setAvatar(userData.avatar);
        setAddresses(userData.addresses || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi lấy thông tin người dùng');
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
        toast.error('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF)');
        return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước file không được vượt quá 5MB');
        return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const response = await axios.post('/api/user/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.success) {
            toast.success(response.data.message);
            // Refresh user data to get new avatar
            fetchUserData();
        }
    } catch (error) {
        console.error('Error updating avatar:', error);
        toast.error(error.response?.data?.message || 'Lỗi khi cập nhật ảnh đại diện');
    }
  };

  const handleAvatarSubmit = async () => {
    if (!avatar) {
      toast.error('Vui lòng chọn ảnh đại diện!');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('avatar', avatar);

      const response = await axios.post(
        url + "/api/user/avatar",
        formData,
        {
          headers: {
            token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setPreviewAvatar(null);
        setAvatar(null);
        // Refresh user data
        fetchUserData();
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error(error.response?.data?.message || 'Cập nhật avatar thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.address) {
        toast.error('Vui lòng điền đầy đủ thông tin địa chỉ');
        return;
    }

    try {
        const response = await axios.post('/api/user/address', newAddress, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.success) {
            toast.success(response.data.message);
            setNewAddress({
                name: '',
                phone: '',
                address: '',
                city: '',
                district: '',
                ward: '',
                isDefault: false
            });
            // Refresh user data to get new address
            fetchUserData();
        }
    } catch (error) {
        console.error('Error adding address:', error);
        toast.error(error.response?.data?.message || 'Lỗi khi thêm địa chỉ');
    }
  };

  const handleRemoveAddress = async (addressId) => {
    try {
        const response = await axios.delete(`/api/user/address/${addressId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.success) {
            toast.success(response.data.message);
            // Refresh user data to get updated addresses
            fetchUserData();
        }
    } catch (error) {
        console.error('Error removing address:', error);
        toast.error(error.response?.data?.message || 'Lỗi khi xóa địa chỉ');
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
        const response = await axios.put(`/api/user/address/${addressId}/default`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.success) {
            toast.success(response.data.message);
            // Refresh user data to get updated addresses
            fetchUserData();
        }
    } catch (error) {
        console.error('Error setting default address:', error);
        toast.error(error.response?.data?.message || 'Lỗi khi đặt địa chỉ mặc định');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại!');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu mới và mật khẩu xác nhận không khớp!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        url + "/api/user/change-password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="loading">Đang tải...</div>;
    }

    switch (activeTab) {
      case 'password':
        return (
          <div className="profile-section">
            <h2>Đổi mật khẩu</h2>
            <form onSubmit={handlePasswordSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">Mật khẩu mới</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <button type="submit" className="save-button" disabled={loading}>
                {loading ? 'Đổi mật khẩu...' : 'Đổi mật khẩu'}
              </button>
            </form>
          </div>
        );

      case 'addresses':
        return (
          <div className="profile-section">
            <h2>Địa chỉ giao hàng</h2>
            <div className="addresses-list">
              {addresses.map((address) => (
                <div key={address.id} className="address-card">
                  <div className="address-info">
                    <h3>{address.name}</h3>
                    <p>{address.phone}</p>
                    <p>{address.address}</p>
                    <p>
                      {address.ward}, {address.district}, {address.city}
                    </p>
                    {address.isDefault && <span className="default-badge">Mặc định</span>}
                  </div>
                  <div className="address-actions">
                    <button
                      onClick={() => handleSetDefaultAddress(address.id)}
                      className="action-button"
                      disabled={address.isDefault || loading}
                    >
                      Đặt làm địa chỉ mặc định
                    </button>
                    <button
                      onClick={() => handleRemoveAddress(address.id)}
                      className="action-button delete"
                      disabled={loading}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="add-address-section">
              <h3>Thêm địa chỉ mới</h3>
              <div className="address-form">
                <div className="form-group">
                  <label htmlFor="name">Họ và tên</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newAddress.name}
                    onChange={handleAddressChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Số điện thoại</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={newAddress.phone}
                    onChange={handleAddressChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Địa chỉ</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={newAddress.address}
                    onChange={handleAddressChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">Thành phố</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={newAddress.city}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="district">Quận</label>
                    <input
                      type="text"
                      id="district"
                      name="district"
                      value={newAddress.district}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="ward">Phường</label>
                    <input
                      type="text"
                      id="ward"
                      name="ward"
                      value={newAddress.ward}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={newAddress.isDefault}
                      onChange={handleAddressChange}
                    />
                    Đặt làm địa chỉ mặc định
                  </label>
                </div>

                <button 
                  onClick={handleAddAddress} 
                  className="add-address-button"
                  disabled={loading}
                >
                  {loading ? 'Thêm địa chỉ...' : 'Thêm địa chỉ'}
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Hồ sơ của tôi</h1>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="avatar-section">
            <div className="avatar-preview">
              <img
                src={previewAvatar || avatar || '/default-avatar.png'}
                alt="Profile"
              />
              <div className="avatar-overlay">
                <label htmlFor="avatar-upload" className="upload-button">
                  Change Avatar
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  hidden
                />
              </div>
            </div>
            {avatar && (
              <button 
                onClick={handleAvatarSubmit} 
                className="save-button"
                disabled={loading}
              >
                {loading ? 'Lưu...' : 'Lưu'}
              </button>
            )}
          </div>

          <nav className="profile-nav">
            <button
              className={`nav-item ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
              disabled={loading}
            >
              Đổi mật khẩu
            </button>
            <button
              className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
              onClick={() => setActiveTab('addresses')}
              disabled={loading}
            >
              Địa chỉ giao hàng
            </button>
          </nav>
        </div>

        <div className="profile-main">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
