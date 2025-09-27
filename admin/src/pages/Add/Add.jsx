import React, { useState } from 'react'
import './Add.css'
import { assets, url } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const Add = () => {
    const [image, setImage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [data, setData] = useState({
        name: "",
        description: "",
        price: "",
        category: "Hũ Đá"
    });

    // Upload trực tiếp lên Cloudinary
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
        
        if (!image) {
            toast.error('Vui lòng chọn hình ảnh');
            return;
        }

        // Kiểm tra kích thước file
        if (image.size > 5 * 1024 * 1024) {
            toast.error('File ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB');
            return;
        }

        setLoading(true);
        setUploadProgress(0);

        try {
            // Upload ảnh trực tiếp lên Cloudinary
            toast.info('Đang upload ảnh...');
            const uploadResult = await uploadImageToCloudinary(image);
            
            if (!uploadResult.success) {
                throw new Error(uploadResult.error);
            }

            // Gửi thông tin sản phẩm kèm URL ảnh về backend
            const productData = {
                name: data.name,
                description: data.description,
                price: Number(data.price),
                category: data.category,
                imageUrl: uploadResult.imageUrl,
                cloudinaryId: uploadResult.cloudinaryId
            };

            const response = await axios.post(`${url}/api/food/add`, productData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.data.success) {
                toast.success('Sản phẩm đã được thêm thành công!');
                setData({
                    name: "",
                    description: "",
                    price: "",
                    category: data.category
                });
                setImage(false);
                setUploadProgress(0);
            } else {
                toast.error(response.data.message || 'Thêm sản phẩm thất bại');
            }
            
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Lỗi khi thêm sản phẩm: ' + error.message);
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }));
    };

    return (
        <div className='add'>
            <form className='flex-col' onSubmit={onSubmitHandler}>
                <div className='add-img-upload flex-col'>
                    <p>Tải hình ảnh</p>
                    <input 
                        onChange={(e) => { 
                            setImage(e.target.files[0]); 
                            e.target.value = '' 
                        }} 
                        type="file" 
                        accept="image/*" 
                        id="image" 
                        hidden 
                        disabled={loading}
                    />
                    <label htmlFor="image">
                        <img src={!image ? assets.upload_area : URL.createObjectURL(image)} alt="" />
                    </label>
                    {image && (
                        <p style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>
                            File: {image.name} ({(image.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                    )}
                    {loading && uploadProgress > 0 && (
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
                        disabled={loading}
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
                        disabled={loading}
                    />
                </div>
                
                <div className='add-category-price'>
                    <div className='add-category flex-col'>
                        <p>Loại sản phẩm</p>
                        <select name='category' onChange={onChangeHandler} disabled={loading}>
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
                            disabled={loading}
                        />
                    </div>
                </div>
                
                <button type='submit' className='add-btn' disabled={loading}>
                    {loading ? `Đang xử lý...` : 'Thêm vào gian hàng'}
                </button>
            </form>
        </div>
    )
}

export default Add
