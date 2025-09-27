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
    const [uploadProgress, setUploadProgress] = useState(0);
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
                console.log("Fetching product with ID:", id);
                const response = await axios.get(`${url}/api/food/list`);
                if (response.data.success) {
                    const product = response.data.data.find(item => item._id === id);
                    if (product) {
                        console.log("Product found:", product);
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

    // Upload trực tiếp lên Cloudinary (copy từ Add.jsx)
    const uploadImageToCloudinary = async (file) => {
        try {
            // Lấy signature từ backend
            const signatureResponse = await axios.post(`${url}/api/upload/signature`);
            const { signature, timestamp, cloudName, apiKey, folder } = signatureResponse.data;

            // Tạo FormData để upload lên Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('signature', signature);
            formData.append('timestamp', timestamp);
            formData.append('api_key', apiKey);
            formData.append('folder', folder);
            formData.append('transformation', 'w_800,h_600,c_limit,q_auto,f_auto');

            // Upload trực tiếp lên Cloudinary
            const uploadResponse = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                formData,
                {
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percentCompleted);
                    }
                }
            );

            return {
                success: true,
                imageUrl: uploadResponse.data.secure_url,
                cloudinaryId: uploadResponse.data.public_id
            };
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        
        if (!id) {
            toast.error("Missing product ID");
            return;
        }

        console.log("Starting edit with ID:", id);
        setSubmitting(true);
        setUploadProgress(0);
        
        try {
            let imageUrl = currentImage;
            let cloudinaryId = null;

            // Nếu có ảnh mới, upload lên Cloudinary trước
            if (image) {
                // Kiểm tra kích thước file
                if (image.size > 5 * 1024 * 1024) {
                    toast.error('File ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB');
                    return;
                }

                toast.info('Đang upload ảnh...');
                const uploadResult = await uploadImageToCloudinary(image);
                
                if (!uploadResult.success) {
                    throw new Error(uploadResult.error);
                }

                imageUrl = uploadResult.imageUrl;
                cloudinaryId = uploadResult.cloudinaryId;
            }

            // Gửi thông tin sản phẩm (chỉ JSON, không có file)
            const productData = {
                id: id,
                name: data.name,
                description: data.description,
                price: Number(data.price),
                category: data.category,
                imageUrl: imageUrl,
                cloudinaryId: cloudinaryId
            };

            console.log("Sending product data:", productData);

            const response = await axios.post(`${url}/api/food/edit`, productData, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000 // 30 seconds (đủ vì không upload file)
            });
            
            console.log("Full response:", response.data);
            
            if (response.data.success) {
                toast.success('Sản phẩm đã được cập nhật thành công!');
                setTimeout(() => {
                    navigate('/list');
                }, 1000);
            } else {
                console.error("Backend error:", response.data.message);
                toast.error(response.data.message || 'Cập nhật sản phẩm thất bại');
            }
            
        } catch (error) {
            console.error('Edit error:', error);
            if (error.response) {
                toast.error(`Server error: ${error.response.data.message || error.response.status}`);
            } else {
                toast.error('Network error: ' + error.message);
            }
        } finally {
            setSubmitting(false);
            setUploadProgress(0);
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
                            New image: {image.name} ({(image.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                    )}
                    {submitting && uploadProgress > 0 && (
                        <div style={{marginTop: '10px'}}>
                            <div style={{
                                width: '100%',
                                height: '4px',
                                backgroundColor: '#f0f0f0',
                                borderRadius: '2px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${uploadProgress}%`,
                                    height: '100%',
                                    backgroundColor: '#4CAF50',
                                    transition: 'width 0.3s ease'
                                }}></div>
                            </div>
                            <p style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>
                                Uploading: {uploadProgress}%
                            </p>
                        </div>
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
                    {submitting ? `Đang xử lý...` : 'Cập nhật sản phẩm'}
                </button>
            </form>
        </div>
    );
};

export default Edit;
