import React, { useState, useEffect } from 'react'
import './Edit.css'
import { assets, url } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

const Edit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [image, setImage] = useState(false);
    const [currentImage, setCurrentImage] = useState('');
    const [data, setData] = useState({
        name: "",
        description: "",
        price: "",
        category: ""
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                console.log("Fetching product with ID:", id); // Debug log
                const response = await axios.get(`${url}/api/food/list`);
                if (response.data.success) {
                    const product = response.data.data.find(item => item._id === id);
                    if (product) {
                        console.log("Product found:", product); // Debug log
                        setData({
                            name: product.name,
                            description: product.description,
                            price: product.price,
                            category: product.category
                        });
                        setCurrentImage(product.image);
                        setLoading(false);
                    } else {
                        toast.error("Product not found");
                        navigate('/list');
                    }
                } else {
                    toast.error("Error loading product");
                    navigate('/list');
                }
            } catch (error) {
                console.error('Fetch error:', error);
                toast.error("Error loading product");
                navigate('/list');
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id, navigate]);

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        
        // Validate ID trước khi gửi
        if (!id) {
            toast.error("Missing product ID");
            return;
        }

        console.log("Starting edit with ID:", id); // Debug log
        console.log("Form data:", data); // Debug log
        
        setSubmitting(true);
        
        try {
            const formData = new FormData();
            
            // Explicitly append ID first
            formData.append("id", id);
            formData.append("name", data.name);
            formData.append("description", data.description);
            formData.append("price", Number(data.price));
            formData.append("category", data.category);
            
            if (image) {
                formData.append("image", image);
                console.log("New image selected:", image.name);
            }

            // Log FormData contents
            console.log("FormData contents:");
            for (let [key, value] of formData.entries()) {
                console.log(key, ":", value);
            }

            console.log("Sending edit request to:", `${url}/api/food/edit`);
            
            const response = await axios.post(`${url}/api/food/edit`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 30000 // 30 second timeout
            });
            
            console.log("Response:", response.data);
            
            if (response.data.success) {
                toast.success('Sản phẩm đã được cập nhật thành công!');
                navigate('/list');
            } else {
                toast.error(response.data.message || 'Cập nhật sản phẩm thất bại');
            }
        } catch (error) {
            console.error('Edit error:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                toast.error(`Server error: ${error.response.data.message || error.response.status}`);
            } else if (error.request) {
                toast.error('Network error. Please check your connection.');
            } else {
                toast.error('Error: ' + error.message);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }));
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className='add'>
            <form className='flex-col' onSubmit={onSubmitHandler}>
                <div className='add-img-upload flex-col'>
                    <p>Hình ảnh sản phẩm</p>
                    <input 
                        onChange={(e) => { 
                            setImage(e.target.files[0]); 
                            e.target.value = '' 
                        }} 
                        type="file" 
                        accept="image/*" 
                        id="image" 
                        hidden 
                        disabled={submitting}
                    />
                    <label htmlFor="image">
                        <img src={!image ? currentImage : URL.createObjectURL(image)} alt="" />
                    </label>
                    {image && (
                        <p style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>
                            New image: {image.name}
                        </p>
                    )}
                </div>
                <div className='add-product-name flex-col'>
                    <p>Tên sản phẩm</p>
                    <input 
                        name='name' 
                        onChange={onChangeHandler} 
                        value={data.name} 
                        type="text" 
                        placeholder='Viết tên sản phẩm ở đây!' 
                        required 
                        disabled={submitting}
                    />
                </div>
                <div className='add-product-description flex-col'>
                    <p>Mô tả sản phẩm</p>
                    <textarea 
                        name='description' 
                        onChange={onChangeHandler} 
                        value={data.description} 
                        rows={6} 
                        placeholder='Viết nội dung mô tả sản phẩm ở đây!' 
                        required 
                        disabled={submitting}
                    />
                </div>
                <div className='add-category-price'>
                    <div className='add-category flex-col'>
                        <p>Loại sản phẩm</p>
                        <select 
                            name='category' 
                            onChange={onChangeHandler} 
                            value={data.category}
                            disabled={submitting}
                        >
                            <option value="Hũ Đá">Hũ Đá</option>
                            <option value="Vòng Tay">Vòng Tay</option>
                            <option value="Móc Khóa">Móc Khóa</option>
                            <option value="Cây Đá">Cây Đá</option>
                            <option value="Cầu Thủy Tinh">Cầu Thủy Tinh</option>
                            <option value="Nhẫn">Nhẫn</option>
                            <option value="Vòng Cổ">Vòng Cổ</option>
                            <option value="Tượng">Tượng</option>
                        </select>
                    </div>
                    <div className='add-price flex-col'>
                        <p>Giá sản phẩm</p>
                        <input 
                            type="number" 
                            name='price' 
                            onChange={onChangeHandler} 
                            value={data.price} 
                            placeholder='25000' 
                            required 
                            disabled={submitting}
                        />
                    </div>
                </div>
                <button type='submit' className='add-btn' disabled={submitting}>
                    {submitting ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
                </button>
            </form>
        </div>
    );
};

export default Edit;
