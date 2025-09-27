import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
      <div className="footer-content">
        <div className="footer-content-left">
            <img src={assets.logo} alt="Logo" />
            <p>Khám phá bộ sưu tập vật phẩm phong thủy đa dạng, được tuyển chọn kỹ lưỡng từ những chất liệu tinh túy và chế tác bởi đôi tay nghệ nhân lành nghề. Chúng tôi cam kết mang đến sự hài hòa, may mắn và thịnh vượng cho không gian sống và công việc của bạn – từng vật phẩm là một nguồn năng lượng tích cực được gửi gắm với tâm huyết và sự am hiểu sâu sắc về phong thủy.</p>
            <div className="footer-social-icons">
                <a href="https://www.facebook.com/profile.php?id=61576311766928">
                    <img src={assets.facebook_icon} alt="Facebook" />
                </a>
                <a href="https://twitter.com/">
                    <img src={assets.twitter_icon} alt="Twitter" />
                </a>
                <a href="https://www.linkedin.com/">
                    <img src={assets.linkedin_icon} alt="Linkedin" />
                </a>
            </div>
        </div>
        <div className="footer-content-center">
            <h2>Tìm hiểu thêm </h2>
            <ul>
                <li>Trang chủ </li>
                <li>Về chúng tôi  </li>
                <li>Giao hàng </li>
                <li>Chính sách & Bảo mật </li>
            </ul>
        </div>
        <div className="footer-content-right">
            <h2>Liên hệ trực tiếp </h2>
            <ul>
                <li>+84-337-937-3984 </li>
                <li>vibestone.official@gmail.com</li>
            </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">Copyright 2025 © vibestone.com</p>
    </div>
  )
}

export default Footer
