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
      await fetchAllOrders();
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

  return (
    <div className='order add'>
      <h3>Đơn hàng</h3>
      <div className="order-list">
        {orders.map((order, index) => (
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
