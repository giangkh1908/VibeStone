import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './FengShuiRules.css'; // We will create this CSS file
import { url } from '../../assets/assets';

const FengShuiRules = () => {
    const [rules, setRules] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRule, setCurrentRule] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const fetchRules = async () => {
        try {
            const response = await axios.get(`${url}/api/fengshui-rules`);
            if (response.data.success) {
                setRules(response.data.data);
            }
        } catch (error) {
            toast.error("Không thể tải danh sách quy tắc.");
        }
    };

    useEffect(() => {
        fetchRules();
    }, []);

    const handleOpenModal = (rule = null) => {
        setIsEditing(!!rule);
        setCurrentRule(rule ? { ...rule } : { element: '', compatible_colors: [], beneficial_colors: [], avoid_colors: [] });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentRule(null);
    };

    const handleSaveRule = async () => {
        try {
            if (isEditing) {
                await axios.put(`${url}/api/fengshui-rules/${currentRule._id}`, currentRule);
                toast.success('Cập nhật quy tắc thành công!');
            } else {
                await axios.post(`${url}/api/fengshui-rules`, currentRule);
                toast.success('Thêm quy tắc thành công!');
            }
            fetchRules();
            handleCloseModal();
        } catch (error) {
            toast.error('Lưu quy tắc thất bại.');
        }
    };

    const handleDeleteRule = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa quy tắc này?')) {
            try {
                await axios.delete(`${url}/api/fengshui-rules/${id}`);
                toast.success('Xóa quy tắc thành công!');
                fetchRules();
            } catch (error) {
                toast.error('Xóa quy tắc thất bại.');
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // For array fields, split by comma
        if (['compatible_colors', 'beneficial_colors', 'avoid_colors', 'lucky_numbers', 'recommended_stones'].includes(name)) {
            setCurrentRule({ ...currentRule, [name]: value.split(',').map(item => item.trim()) });
        } else {
            setCurrentRule({ ...currentRule, [name]: value });
        }
    };

    return (
        <div className='fengshui-rules list add flex-col'>
            <h2>Quản Lý Quy Tắc Phong Thủy</h2>
            <button onClick={() => handleOpenModal()} className='add-rule-btn'>Thêm Quy Tắc Mới</button>
            <div className='list-table'>
                <div className="list-table-format title">
                    <b>Mệnh</b>
                    <b>Màu Tương Hợp</b>
                    <b>Màu Tương Sinh</b>
                    <b>Màu Kỵ</b>
                    <b>Thao tác</b>
                </div>
                {rules.map((rule) => (
                    <div key={rule._id} className='list-table-format'>
                        <p>{rule.element}</p>
                        <p>{rule.compatible_colors.join(', ')}</p>
                        <p>{rule.beneficial_colors.join(', ')}</p>
                        <p>{rule.avoid_colors.join(', ')}</p>
                        <div className='action-buttons'>
                            <span className='edit-btn cursor' onClick={() => handleOpenModal(rule)}>✎</span>
                            <span className='delete-btn cursor' onClick={() => handleDeleteRule(rule._id)}>✕</span>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className='modal-overlay'>
                    <div className='modal-content'>
                        <h3>{isEditing ? 'Chỉnh Sửa Quy Tắc' : 'Thêm Quy Tắc Mới'}</h3>
                        <input name="element" value={currentRule.element} onChange={handleInputChange} placeholder="Mệnh (ví dụ: Kim)" />
                        <textarea name="compatible_colors" value={currentRule.compatible_colors.join(', ')} onChange={handleInputChange} placeholder="Màu tương hợp (cách nhau bởi dấu phẩy)" />
                        <textarea name="beneficial_colors" value={currentRule.beneficial_colors.join(', ')} onChange={handleInputChange} placeholder="Màu tương sinh (cách nhau bởi dấu phẩy)" />
                        <textarea name="avoid_colors" value={currentRule.avoid_colors.join(', ')} onChange={handleInputChange} placeholder="Màu kỵ (cách nhau bởi dấu phẩy)" />
                        <textarea name="lucky_directions" value={currentRule.lucky_directions?.join(', ')} onChange={handleInputChange} placeholder="Hướng tốt (cách nhau bởi dấu phẩy)" />
                        <textarea name="lucky_numbers" value={currentRule.lucky_numbers?.join(', ')} onChange={handleInputChange} placeholder="Số may mắn (cách nhau bởi dấu phẩy)" />
                        <textarea name="characteristics" value={currentRule.characteristics} onChange={handleInputChange} placeholder="Đặc điểm tính cách" />
                        <textarea name="career_advice" value={currentRule.career_advice} onChange={handleInputChange} placeholder="Lời khuyên sự nghiệp" />
                        <textarea name="health_advice" value={currentRule.health_advice} onChange={handleInputChange} placeholder="Lời khuyên sức khỏe" />
                        <textarea name="relationship_advice" value={currentRule.relationship_advice} onChange={handleInputChange} placeholder="Lời khuyên tình duyên" />
                        <textarea name="wealth_advice" value={currentRule.wealth_advice} onChange={handleInputChange} placeholder="Lời khuyên tài lộc" />
                        <textarea name="recommended_stones" value={currentRule.recommended_stones?.join(', ')} onChange={handleInputChange} placeholder="Đá gợi ý (cách nhau bởi dấu phẩy)" />
                        <div className='modal-actions'>
                            <button onClick={handleSaveRule}>Lưu</button>
                            <button onClick={handleCloseModal}>Hủy</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FengShuiRules;
