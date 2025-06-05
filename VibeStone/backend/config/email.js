import nodemailer from 'nodemailer';
import 'dotenv/config';

// Tạo transporter để gửi email
const createTransporter = () => {
  return nodemailer.createTransport({  // Sửa từ createTransporter thành createTransport
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'quangvu1922@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'sslt kmsd wrhw nwum'
    }
  });
};

// Gửi email xác thực
export const sendVerificationEmail = async (email, verificationToken, userName) => {
  try {
    const transporter = createTransporter();
    
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}&email=${email}`;
    
    const mailOptions = {
      from: `"VibeStone - Cửa hàng phong thủy" <${process.env.EMAIL_USER || 'quangvu1922@gmail.com'}>`,
      to: email,
      subject: '🔮 Xác thực tài khoản VibeStone của bạn',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #f9f7f2; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔮 VibeStone</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Cửa hàng phong thủy uy tín</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Chào mừng ${userName || 'bạn'} đến với VibeStone! 🎉</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Cảm ơn bạn đã đăng ký tài khoản tại VibeStone. Để hoàn tất quá trình đăng ký và bắt đầu khám phá bộ sưu tập vật phẩm phong thủy của chúng tôi, vui lòng xác thực email của bạn.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; 
                        font-weight: bold; font-size: 16px; transition: all 0.3s ease;">
                ✅ Xác Thực Email Ngay
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; line-height: 1.6;">
              <strong>Lưu ý:</strong> Link xác thực này sẽ hết hạn sau 24 giờ. Nếu bạn không thực hiện xác thực trong thời gian này, bạn sẽ cần đăng ký lại.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              Nếu bạn không thể click vào nút trên, hãy copy và paste link sau vào trình duyệt:<br>
              <span style="word-break: break-all;">${verificationUrl}</span>
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © 2024 VibeStone - Mang lại năng lượng tích cực cho cuộc sống của bạn
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Gửi email chào mừng sau khi xác thực thành công
export const sendWelcomeEmail = async (email, userName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"VibeStone - Cửa hàng phong thủy" <${process.env.EMAIL_USER || 'quangvu1922@gmail.com'}>`,
      to: email,
      subject: '🎉 Chào mừng bạn đến với VibeStone!',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #f9f7f2; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Xác thực thành công!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Chào mừng ${userName} đến với VibeStone! 🔮</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Tài khoản của bạn đã được xác thực thành công! Giờ đây bạn có thể:
            </p>
            
            <ul style="color: #666; line-height: 1.8; margin-bottom: 25px;">
              <li>🛍️ Mua sắm tất cả sản phẩm phong thủy</li>
              <li>🔍 Sử dụng tính năng tử vi và phân tích mệnh</li>
              <li>📦 Theo dõi đơn hàng của bạn</li>
              <li>💎 Nhận thông báo về sản phẩm mới và khuyến mãi</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/store" 
                 style="display: inline-block; background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); 
                        color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; 
                        font-weight: bold; font-size: 16px; margin-right: 10px;">
                🛍️ Khám Phá Cửa Hàng
              </a>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/tuvi" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; 
                        font-weight: bold; font-size: 16px;">
                🔮 Xem Tử Vi
              </a>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">🎁 Ưu đãi đặc biệt cho thành viên mới!</h3>
              <p style="color: #666; margin-bottom: 0;">
                Sử dụng mã <strong style="color: #e74c3c;">WELCOME10</strong> để được giảm 10% cho đơn hàng đầu tiên của bạn!
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © 2024 VibeStone - Mang lại may mắn và thịnh vượng cho cuộc sống của bạn
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

// Gửi email xác nhận đơn hàng
export const sendOrderConfirmationEmail = async (orderData) => {
  try {
    const transporter = createTransporter();
    const { address, items, amount, orderId, status } = orderData;
    
    // Format địa chỉ đầy đủ
    const fullAddress = `${address.street}, ${address.ward}, ${address.district}, ${address.city}, ${address.country}`;
    
    // Tạo danh sách sản phẩm HTML
    const itemsHtml = items.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px;">
          <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">
        </td>
        <td style="padding: 10px;">
          <strong>${item.name}</strong><br>
          <small style="color: #666;">Số lượng: ${item.quantity}</small>
        </td>
        <td style="padding: 10px; text-align: right;">
          ${(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ
        </td>
      </tr>
    `).join('');
    
    const mailOptions = {
      from: `"VibeStone - Cửa hàng phong thủy" <${process.env.EMAIL_USER || 'quangvu1922@gmail.com'}>`,
      to: address.email,
      subject: `🛍️ Xác nhận đơn hàng #${orderId} - VibeStone`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #f9f7f2; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🛍️ Đặt hàng thành công!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Cảm ơn bạn đã mua sắm tại VibeStone</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Xin chào ${address.firstName} ${address.lastName}! 👋</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Đơn hàng của bạn đã được xác nhận thành công. Chúng tôi sẽ chuẩn bị và giao hàng trong thời gian sớm nhất.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">📋 Thông tin đơn hàng</h3>
              <p style="margin: 5px 0;"><strong>Mã đơn hàng:</strong> #${orderId}</p>
              <p style="margin: 5px 0;"><strong>Trạng thái:</strong> <span style="color: #27ae60; font-weight: bold;">${status || 'Đang xử lý'}</span></p>
              <p style="margin: 5px 0;"><strong>Tổng tiền:</strong> <span style="color: #e74c3c; font-weight: bold;">${amount.toLocaleString('vi-VN')} VNĐ</span></p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">📍 Địa chỉ giao hàng</h3>
              <p style="margin: 5px 0;"><strong>Người nhận:</strong> ${address.firstName} ${address.lastName}</p>
              <p style="margin: 5px 0;"><strong>Điện thoại:</strong> ${address.phone}</p>
              <p style="margin: 5px 0;"><strong>Địa chỉ:</strong> ${fullAddress}</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">📦 Chi tiết sản phẩm</h3>
              <table style="width: 100%; border-collapse: collapse;">
                ${itemsHtml}
              </table>
            </div>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ffc107;">
              <h3 style="color: #856404; margin-top: 0;">📋 Lưu ý quan trọng</h3>
              <ul style="color: #856404; margin: 0; padding-left: 20px;">
                <li>Đơn hàng sẽ được giao trong vòng 2-5 ngày làm việc</li>
                <li>Thanh toán khi nhận hàng (COD)</li>
                <li>Vui lòng kiểm tra kỹ sản phẩm khi nhận hàng</li>
                <li>Liên hệ hotline nếu có thắc mắc: <strong>1900-1234</strong></li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/myorders" 
                 style="display: inline-block; background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); 
                        color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; 
                        font-weight: bold; font-size: 16px; margin-right: 10px;">
                📱 Theo Dõi Đơn Hàng
              </a>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/store" 
                 style="display: inline-block; background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); 
                        color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; 
                        font-weight: bold; font-size: 16px;">
                🛍️ Tiếp Tục Mua Sắm
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © 2024 VibeStone - Mang lại may mắn và thịnh vượng cho cuộc sống của bạn
              </p>
              <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
                📧 Email: support@vibestone.com | 📞 Hotline: 1900-1234
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error: error.message };
  }
};