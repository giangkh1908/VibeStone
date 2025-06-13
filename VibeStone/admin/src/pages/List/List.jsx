import React, { useEffect, useState } from 'react'
import './List.css'
import { url, currency } from '../../assets/assets'
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const List = () => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const fetchList = async () => {
    const response = await axios.get(`${url}/api/food/list`)
    if (response.data.success) {
      setList(response.data.data);
      setFilteredList(response.data.data);
    }
    else {
      toast.error("Lỗi lấy danh sách sản phẩm")
    }
  }

  useEffect(() => {
    fetchList();
  }, [])

  useEffect(() => {
    filterProducts();
  }, [searchTerm, filterCategory, list]);

  const filterProducts = () => {
    let filtered = [...list];
    
    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower)
      );
    }
    
    // Lọc theo danh mục
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }
    
    setFilteredList(filtered);
  };

  const removeFood = async (foodId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      const response = await axios.post(`${url}/api/food/remove`, {
        id: foodId
      })
      await fetchList();
      if (response.data.success) {
        toast.success(response.data.message);
      }
      else {
        toast.error("Lỗi xóa sản phẩm")
      }
    }
  }

  const editFood = (id) => {
    navigate(`/edit/${id}`);
  }

  // Lấy danh sách các danh mục duy nhất
  const categories = ['all', ...new Set(list.map(item => item.category))];

  return (
    <div className='list add flex-col'>
      <p>Danh sách sản phẩm</p>
      
      <div className="search-filter-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'Tất cả' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className='list-table'>
        <div className="list-table-format title">
          <b>Hình ảnh</b>
          <b>Tên sản phẩm</b>
          <b>Loại sản phẩm</b>
          <b>Giá sản phẩm</b>
          <b>Thao tác</b>
        </div>
        {filteredList.map((item, index) => {
          return (
            <div key={index} className='list-table-format'>
              <img src={item.image} alt="" />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>{currency}{item.price}</p>
              <div className='action-buttons'>
                <span className='edit-btn cursor' onClick={() => editFood(item._id)}>✎</span>
                <span className='delete-btn cursor' onClick={() => removeFood(item._id)}>✕</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default List
