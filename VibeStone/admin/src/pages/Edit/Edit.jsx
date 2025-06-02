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

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`${url}/api/food/list`);
                if (response.data.success) {
                    const product = response.data.data.find(item => item._id === id);
                    if (product) {
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
                console.error(error);
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

        const formData = new FormData();
        formData.append("id", id);
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("price", Number(data.price));
        formData.append("category", data.category);
        
        if (image) {
            formData.append("image", image);
        }

        try {
            const response = await axios.post(`${url}/api/food/edit`, formData);
            if (response.data.success) {
                toast.success(response.data.message);
                navigate('/list');
            } else {
                toast.error(response.data.message || "Error updating product");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error updating product");
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
                    <input onChange={(e) => { setImage(e.target.files[0]); e.target.value = '' }} type="file" accept="image/*" id="image" hidden />
                    <label htmlFor="image">
                        <img src={!image ? currentImage : URL.createObjectURL(image)} alt="" />
                    </label>
                </div>
                <div className='add-product-name flex-col'>
                    <p>Tên sản phẩm</p>
                    <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Viết tên sản phẩm ở đây!' required />
                </div>
                <div className='add-product-description flex-col'>
                    <p>Mô tả sản phẩm</p>
                    <textarea name='description' onChange={onChangeHandler} value={data.description} type="text" rows={6} placeholder='Viết nội dung mô tả sản phẩm ở đây!' required />
                </div>
                <div className='add-category-price'>
                    <div className='add-category flex-col'>
                        <p>Loại sản phẩm</p>
                        <select name='category' onChange={onChangeHandler} value={data.category}>
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
                        <input type="Number" name='price' onChange={onChangeHandler} value={data.price} placeholder='25000' required />
                    </div>
                </div>
                <button type='submit' className='add-btn'>Cập nhật sản phẩm</button>
            </form>
        </div>
    );
};

export default Edit;
