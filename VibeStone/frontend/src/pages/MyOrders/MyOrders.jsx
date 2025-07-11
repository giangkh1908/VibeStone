import React, { useContext, useEffect, useState } from 'react'
import './MyOrders.css'
import axios from 'axios'
import { StoreContext } from '../../Context/StoreContext';
import { assets } from '../../assets/assets';

const MyOrders = () => {
  
  const [data,setData] =  useState([]);
  const {url,token,currency} = useContext(StoreContext);

  // Hàm định dạng tiền tệ với dấu phân cách hàng nghìn
  const formatCurrency = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const fetchOrders = async () => {
    const response = await axios.post(url+"/api/order/userorders",{},{headers:{token}});
    // Sắp xếp đơn hàng từ mới đến cũ
    const sortedOrders = response.data.data.sort((a, b) => new Date(b.date) - new Date(a.date));
    setData(sortedOrders);
  }

  useEffect(()=>{
    if (token) {
      fetchOrders();
    }
  },[token, fetchOrders])

  return (
    <div className='my-orders'>
      <h2>Đơn hàng của tôi</h2>
      <div className="container">
        {data.map((order,index)=>{
          return (
            <div key={index} className='my-orders-order'>
                <img src={assets.parcel_icon} alt="" />
                <p>{order.items.map((item,index)=>{
                  if (index === order.items.length-1) {
                    return item.name+" x "+item.quantity
                  }
                  else{
                    return item.name+" x "+item.quantity+", "
                  }
                  
                })}</p>
                <p>{formatCurrency(order.amount)}{currency}</p>
                <p>Sản phẩm: {order.items.length}</p>
                <p><span>&#x25cf;</span> <b>{order.status}</b></p>
                <button onClick={fetchOrders}>Theo dõi đơn hàng</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MyOrders
