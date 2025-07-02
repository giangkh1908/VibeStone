import React, { useEffect, useState } from 'react'
import './Orders.css'
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets, url, currency } from '../../assets/assets';

const Order = () => {

  const [orders, setOrders] = useState([]);
  
  // Hàm định dạng tiền tệ với dấu phân cách hàng nghìn
  const formatCurrency = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Hàm định dạng thời gian
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const fetchAllOrders = async () => {
    const response = await axios.get(`${url}/api/order/list`)
    if (response.data.success) {
      // Sắp xếp đơn hàng từ mới nhất đến cũ nhất dựa trên trường date
      const sortedOrders = response.data.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setOrders(sortedOrders);
    }
    else {
      toast.error("Error")
    }
  }

  const statusHandler = async (event, orderId) => {
    console.log(event, orderId);
    const response = await axios.post(`${url}/api/order/status`, {
      orderId,
      status: event.target.value
    })
    if (response.data.success) {
      toast.success('Cập nhật trạng thái đơn hàng thành công!');
      await fetchAllOrders();
    } else {
      toast.error('Cập nhật trạng thái đơn hàng thất bại!');
    }
  }

  // Hàm xử lý xóa đơn hàng
  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
      try {
        const response = await axios.delete(`${url}/api/order/delete/${orderId}`);
        if (response.data.success) {
          toast.success('Xóa đơn hàng thành công!');
          // Cập nhật lại danh sách đơn hàng
          await fetchAllOrders();
        } else {
          toast.error('Xóa đơn hàng thất bại!');
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        toast.error('Có lỗi xảy ra khi xóa đơn hàng!');
      }
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [])

  // Đếm số lượng đơn hàng theo từng trạng thái
  const countByStatus = (status) => orders.filter(order => order.status === status).length;

  // Tính tổng tiền của các đơn hàng ở trạng thái 'Đã giao hàng'
  const totalDeliveredAmount = orders
    .filter(order => order.status === 'Đã giao hàng')
    .reduce((sum, order) => sum + order.amount, 0);

  // State cho bộ lọc trạng thái
  const [filterStatus, setFilterStatus] = useState('Tất cả');

  // Danh sách trạng thái đơn hàng
  const statusOptions = ['Tất cả', 'Đang xử lý', 'Đang giao hàng', 'Đã giao hàng'];

  // Lọc đơn hàng theo trạng thái
  const filteredOrders = filterStatus === 'Tất cả'
    ? orders
    : orders.filter(order => order.status === filterStatus);

  return (
    <div className='order add'>
      <h3>Đơn hàng</h3>
      {/* Thống kê số lượng đơn hàng theo trạng thái */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
        <div><b>Đang xử lý:</b> {countByStatus('Đang xử lý')}</div>
        <div><b>Đang giao hàng:</b> {countByStatus('Đang giao hàng')}</div>
        <div><b>Đã giao hàng:</b> {countByStatus('Đã giao hàng')}</div>
      </div>
      {/* Tổng tiền các đơn hàng đã giao + Bộ lọc trạng thái */}
      <div className="order-summary-filter">
        <span className="order-summary-total">
          Tổng doanh thu: <span className="order-summary-amount">{formatCurrency(totalDeliveredAmount)}{currency}</span>
        </span>
        
        <select
          className="order-status-filter"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          {statusOptions.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>
      {/* Danh sách đơn hàng với scroll riêng */}
      <div className="order-list order-list-scroll">
        {filteredOrders.map((order, index) => (
          <div key={index} className='order-item'>
            <img src={assets.parcel_icon} alt="" />
            <div>
              <p className='order-item-food'>
                {order.items.map((item, index) => {
                  if (index === order.items.length - 1) {
                    return item.name + " x " + item.quantity
                  }
                  else {
                    return item.name + " x " + item.quantity + ", "
                  }
                })}
              </p>
              <p className='order-item-name'>{order.address.firstName + " " + order.address.lastName}</p>
              <div className='order-item-address'>
                <p>{order.address.street + ","}</p>
                <p>{order.address.ward + ", " + order.address.district + ", " + order.address.city + ", " + order.address.country}</p>
              </div>
              <p className='order-item-phone'>{order.address.phone}</p>
              <p className='order-item-date'>Thời gian đặt hàng: {formatDate(order.date)}</p>
            </div>
            <p>Số loại : {order.items.length}</p>
            <p>Số tiền : {formatCurrency(order.amount)}{currency}</p>
            <div className="order-actions">
              <select onChange={(e) => statusHandler(e, order._id)} value={order.status} name="" id="">
                <option value="Đang xử lý">Đang xử lý</option>
                <option value="Đang giao hàng">Đang giao hàng</option>
                <option value="Đã giao hàng">Đã giao hàng</option>
              </select>
              <button 
                className="delete-button"
                onClick={() => handleDeleteOrder(order._id)}
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Order
