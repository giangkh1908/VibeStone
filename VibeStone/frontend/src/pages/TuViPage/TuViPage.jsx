import { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./TuViPage.css"; // Import your CSS styles

const API_BASE = "http://localhost:5000/api";

function TuViPage() {
  const [activeTab, setActiveTab] = useState("info");
  const [userInfo, setUserInfo] = useState({
    name: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
    birthHour: "",
    gender: "",
  });
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateInput = () => {
    const { name, birthYear, birthMonth, birthDay, birthHour, gender } = userInfo;
    if (!name.trim() || !birthYear || !birthMonth || !birthDay || !birthHour || !gender) {
      toast.error("Vui lòng điền đầy đủ tất cả các trường.");
      return false;
    }

    const year = parseInt(birthYear);
    const month = parseInt(birthMonth);
    const day = parseInt(birthDay);
    const hour = parseInt(birthHour);

    if (isNaN(year) || year < 1900 || year > 2100) {
      toast.error("Năm sinh phải là một số hợp lệ từ 1900 đến 2100.");
      return false;
    }
    if (isNaN(month) || month < 1 || month > 12) {
      toast.error("Tháng sinh phải là một số hợp lệ từ 1 đến 12.");
      return false;
    }
    if (isNaN(day) || day < 1 || day > 31) {
      toast.error("Ngày sinh phải là một số hợp lệ từ 1 đến 31.");
      return false;
    }
    // Check for days in month
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day > daysInMonth) {
      toast.error(`Tháng ${month} năm ${year} chỉ có ${daysInMonth} ngày.`);
      return false;
    }
    if (isNaN(hour) || hour < 0 || hour > 23) {
      toast.error("Giờ sinh phải là một số hợp lệ từ 0 đến 23.");
      return false;
    }

    return true;
  };

  const analyzeUser = async () => {
    if (!validateInput()) return;

    setLoading(true);
    setAnalysis(null);

    try {
      const response = await fetch(`${API_BASE}/analyze-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userInfo.name,
          birthYear: parseInt(userInfo.birthYear),
          birthMonth: parseInt(userInfo.birthMonth),
          birthDay: parseInt(userInfo.birthDay),
          birthHour: parseInt(userInfo.birthHour),
          gender: userInfo.gender,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Lỗi không xác định từ server.");
      }

      setAnalysis(data.data);
      setActiveTab("analysis");
      toast.success("Phân tích thành công!");

    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    const { name, birthYear, birthMonth, birthDay, birthHour, gender } = userInfo;
    return name.trim() && birthYear && birthMonth && birthDay && birthHour && gender;
  };

  const renderAnalysisResult = () => {
    if (!analysis) {
      return (
        <div className="tuvi-no-analysis">
          <p>Chưa có kết quả. Vui lòng nhập thông tin và bắt đầu phân tích.</p>
          <button onClick={() => setActiveTab("info")}>📝 Nhập Thông Tin</button>
        </div>
      );
    }

    const { name, solarDate, lunarDate, tuTru, menh, cungMenh } = analysis;

    return (
      <div className="tuvi-analysis-result">
        <h2>Kết Quả Phân Tích cho: {name}</h2>

        <div className="tuvi-analysis-grid">
          {/* Basic Info Card */}
          <div className="tuvi-analysis-card">
            <h3>📅 Thông Tin Cơ Bản</h3>
            <p><strong>Dương Lịch:</strong> {solarDate}</p>
            <p><strong>Âm Lịch:</strong> {lunarDate}</p>
            <p><strong>Giới Tính:</strong> {userInfo.gender === 'male' ? 'Nam' : 'Nữ'}</p>
          </div>

          {/* Mệnh & Cung Mệnh Card */}
          <div className="tuvi-analysis-card">
            <h3>☯️ Mệnh & Cung</h3>
            <p><strong>Nạp Âm:</strong> {menh.napAm}</p>
            <p><strong>Ngũ Hành Mệnh:</strong> {menh.nguHanh}</p>
            <p><strong>Cung Mệnh:</strong> {cungMenh}</p>
          </div>

          {/* Tứ Trụ Card */}
          <div className="tuvi-analysis-card full-width">
            <h3>🏛️ Tứ Trụ</h3>
            <div className="tuvi-tutru-grid">
              <div className="tuvi-tutru-item"><h4>Năm</h4><p>{tuTru.nam.can} {tuTru.nam.chi}</p></div>
              <div className="tuvi-tutru-item"><h4>Tháng</h4><p>{tuTru.thang.can} {tuTru.thang.chi}</p></div>
              <div className="tuvi-tutru-item"><h4>Ngày</h4><p>{tuTru.ngay.can} {tuTru.ngay.chi}</p></div>
              <div className="tuvi-tutru-item"><h4>Giờ</h4><p>{tuTru.gio.can} {tuTru.gio.chi}</p></div>
            </div>
          </div>

          {/* Mệnh Details Card */}
          <div className="tuvi-analysis-card full-width">
            <h3>📖 Chi Tiết Mệnh {menh.nguHanh}</h3>
            <p>{menh.desc}</p>
            <div className="tuvi-details-grid">
              <div>
                <h4>👍 Điểm Mạnh</h4>
                <ul>{menh.positive.map((item, i) => <li key={i}>{item}</li>)}</ul>
              </div>
              <div>
                <h4>👎 Điểm Yếu</h4>
                <ul>{menh.negative.map((item, i) => <li key={i}>{item}</li>)}</ul>
              </div>
            </div>
          </div>

          {/* Feng Shui Card */}
          <div className="tuvi-analysis-card full-width">
            <h3>🔮 Phong Thủy & May Mắn</h3>
            <div className="tuvi-fengshui-grid">
              <div>
                <h4>🎨 Màu Sắc</h4>
                <p><strong>Hợp:</strong> {menh.colors.compatible.join(', ')}</p>
                <p><strong>Tương sinh:</strong> {menh.colors.beneficial.join(', ')}</p>
                <p><strong>Kỵ:</strong> {menh.colors.avoid.join(', ')}</p>
              </div>
              <div>
                <h4>🧭 Hướng Tốt</h4>
                <p>{menh.directions.join(', ')}</p>
              </div>
              <div>
                <h4>🔢 Con Số May Mắn</h4>
                <p>{menh.numbers.join(', ')}</p>
              </div>
            </div>
          </div>

           {/* Careers Card */}
           <div className="tuvi-analysis-card full-width">
            <h3>💼 Ngành Nghề Phù Hợp</h3>
            <div className="tuvi-careers-list">
              {menh.careers.map((career, i) => <span key={i} className="tuvi-career-tag">{career}</span>)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="tuvi-app">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={true} />
      <nav className="tuvi-tab-nav">
        <button className={activeTab === "info" ? "active" : ""} onClick={() => setActiveTab("info")}>📝 Thông Tin</button>
        <button className={activeTab === "analysis" ? "active" : ""} onClick={() => setActiveTab("analysis")}>🔍 Phân Tích</button>
      </nav>

      <main className="tuvi-app-main">
        {loading && <div className="tuvi-loading-message">⏳ Đang phân tích...</div>}

        {activeTab === "info" && (
          <div className="tuvi-tab-content">
            <div className="tuvi-user-info-form">
              <h2>Thông Tin Cá Nhân</h2>
              <div className="tuvi-form-group">
                <label>Họ Và Tên *</label>
                <input type="text" value={userInfo.name} onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })} placeholder="Ví dụ: Nguyễn Văn A" />
              </div>
              <div className="tuvi-form-group">
                <label>Ngày Sinh (Dương Lịch) *</label>
                <div className="tuvi-birth-date-group">
                  <input type="number" value={userInfo.birthDay} onChange={(e) => setUserInfo({ ...userInfo, birthDay: e.target.value })} placeholder="Ngày" />
                  <input type="number" value={userInfo.birthMonth} onChange={(e) => setUserInfo({ ...userInfo, birthMonth: e.target.value })} placeholder="Tháng" />
                  <input type="number" value={userInfo.birthYear} onChange={(e) => setUserInfo({ ...userInfo, birthYear: e.target.value })} placeholder="Năm" />
                </div>
              </div>
              <div className="tuvi-form-group">
                <label>Giờ Sinh *</label>
                <select value={userInfo.birthHour} onChange={(e) => setUserInfo({ ...userInfo, birthHour: e.target.value })}>
                  <option value="">Chọn giờ sinh</option>
                  <option value="0">Tý (00h00 - 01h59)</option>
                  <option value="2">Sửu (02h00 - 03h59)</option>
                  <option value="4">Dần (04h00 - 05h59)</option>
                  <option value="6">Mão (06h00 - 07h59)</option>
                  <option value="8">Thìn (08h00 - 09h59)</option>
                  <option value="10">Tỵ (10h00 - 11h59)</option>
                  <option value="12">Ngọ (12h00 - 13h59)</option>
                  <option value="14">Mùi (14h00 - 15h59)</option>
                  <option value="16">Thân (16h00 - 17h59)</option>
                  <option value="18">Dậu (18h00 - 19h59)</option>
                  <option value="20">Tuất (20h00 - 21h59)</option>
                  <option value="22">Hợi (22h00 - 23h59)</option>
                </select>
              </div>
              <div className="tuvi-form-group">
                <label>Giới tính *</label>
                <select value={userInfo.gender} onChange={(e) => setUserInfo({ ...userInfo, gender: e.target.value })}>
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>
              <button className="tuvi-analyze-btn" onClick={analyzeUser} disabled={loading || !isFormValid()}>
                {loading ? "⏳ Đang phân tích..." : "🔍 Phân Tích Mệnh"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "analysis" && (
          <div className="tuvi-tab-content">
            {renderAnalysisResult()}
          </div>
        )}
      </main>
    </div>
  );
}

export default TuViPage;