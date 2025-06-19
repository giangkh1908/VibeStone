import { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./TuViPage.css"; // Import your CSS styles

const API_BASE = "https://vibe-stone-backend.vercel.app/api"; // Change port if needed

function TuViPage() {
  const [activeTab, setActiveTab] = useState("info");
  const [userInfo, setUserInfo] = useState({
    name: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
    birthHour: "",
    birthMinute: "",
    gender: "",
    preferences: "",
  });
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateInput = () => {
    if (!userInfo.name.trim()) {
      setError("Vui lòng nhập họ tên");
      return false;
    }
    if (!userInfo.birthYear) {
      setError("Vui lòng nhập năm sinh");
      return false;
    }
    if (!userInfo.birthMonth) {
      setError("Vui lòng nhập tháng sinh");
      return false;
    }
    if (!userInfo.birthDay) {
      setError("Vui lòng nhập ngày sinh");
      return false;
    }
    if (!userInfo.birthHour) {
      setError("Vui lòng nhập giờ sinh");
      return false;
    }
    if (!userInfo.birthMinute) {
      setError("Vui lòng nhập phút sinh");
      return false;
    }

    // Validate year
    const year = parseInt(userInfo.birthYear);
    if (year < 1900 || year > 2100) {
      setError("Năm sinh phải từ 1900 đến 2100");
      return false;
    }

    // Validate month
    const month = parseInt(userInfo.birthMonth);
    if (month < 1 || month > 12) {
      setError("Tháng sinh phải từ 1 đến 12");
      return false;
    }

    // Validate day
    const day = parseInt(userInfo.birthDay);
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) {
      setError(`Ngày sinh phải từ 1 đến ${daysInMonth} cho tháng ${month}`);
      return false;
    }

    // Validate hour
    const hour = parseInt(userInfo.birthHour);
    if (hour < 0 || hour > 23) {
      setError("Giờ sinh phải từ 0 đến 23");
      return false;
    }

    // Validate minute
    const minute = parseInt(userInfo.birthMinute);
    if (minute <= 0 || minute > 59) {
      setError("Phút sinh phải từ 0 đến 59");
      return false;
    }

    return true;
  };

  const analyzeUser = async () => {
    if (!validateInput()) {
      toast.error(error);
      return;
    }

    setLoading(true);
    setError("");

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
          birthMinute: parseInt(userInfo.birthMinute),
          gender: userInfo.gender || undefined,
          preferences: userInfo.preferences || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Lỗi phân tích");
      }

      if (!data.data) {
        throw new Error("Không nhận được dữ liệu phân tích");
      }

      setAnalysis(data.data);
      setActiveTab("analysis");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      userInfo.name.trim() &&
      userInfo.birthYear &&
      userInfo.birthMonth &&
      userInfo.birthDay &&
      userInfo.birthHour &&
      userInfo.birthMinute
    );
  };

  return (
    <div className="tuvi-app">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <nav className="tuvi-tab-nav">
        <button
          className={activeTab === "info" ? "active" : ""}
          onClick={() => setActiveTab("info")}
        >
          📝 Thông Tin
        </button>
        <button
          className={activeTab === "analysis" ? "active" : ""}
          onClick={() => setActiveTab("analysis")}
        >
          🔍 Phân Tích
        </button>
      </nav>

      <main className="tuvi-app-main">
        {loading && <div className="tuvi-loading-message">⏳ Đang phân tích...</div>}

        {activeTab === "info" && (
          <div className="tuvi-tab-content">
            <div className="tuvi-user-info-form">
              <h2>Thông Tin Cá Nhân</h2>

              <div className="tuvi-form-group">
                <label>Họ Và Tên *</label>
                <input
                  type="text"
                  value={userInfo.name}
                  onChange={(e) =>
                    setUserInfo((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Ví dụ: Nguyễn Văn A"
                />
              </div>

              <div className="tuvi-form-group">
                <label>Ngày Sinh *</label>
                <div className="tuvi-birth-date-group">
                  <div className="tuvi-date-time-inputs">
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={userInfo.birthDay}
                      onChange={(e) =>
                        setUserInfo((prev) => ({
                          ...prev,
                          birthDay: e.target.value,
                        }))
                      }
                      placeholder="Ngày"
                    />
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={userInfo.birthMonth}
                      onChange={(e) =>
                        setUserInfo((prev) => ({
                          ...prev,
                          birthMonth: e.target.value,
                        }))
                      }
                      placeholder="Tháng"
                    />
                    <input
                      type="number"
                      min="1900"
                      max="2100"
                      value={userInfo.birthYear}
                      onChange={(e) =>
                        setUserInfo((prev) => ({
                          ...prev,
                          birthYear: e.target.value,
                        }))
                      }
                      placeholder="Năm"
                    />
                  </div>
                </div>
              </div>

              <div className="tuvi-form-group">
                <label>Giờ Sinh *</label>
                <div className="tuvi-date-time-inputs">
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={userInfo.birthHour}
                    onChange={(e) =>
                      setUserInfo((prev) => ({
                        ...prev,
                        birthHour: e.target.value,
                      }))
                    }
                    placeholder="Giờ (0-23)"
                  />
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={userInfo.birthMinute}
                    onChange={(e) =>
                      setUserInfo((prev) => ({
                        ...prev,
                        birthMinute: e.target.value,
                      }))
                    }
                    placeholder="Phút (0-59)"
                  />
                </div>
              </div>

              <div className="tuvi-form-group">
                <label>Giới tính</label>
                <select
                  value={userInfo.gender}
                  onChange={(e) =>
                    setUserInfo((prev) => ({ ...prev, gender: e.target.value }))
                  }
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>

              {/* <div className="tuvi-form-group">
                <label>Ghi chú</label>
                <textarea
                  value={userInfo.preferences}
                  onChange={(e) =>
                    setUserInfo((prev) => ({
                      ...prev,
                      preferences: e.target.value,
                    }))
                  }
                  placeholder="Ghi chú thêm (tùy chọn)..."
                  rows="3"
                />
              </div> */}

              <button
                className="tuvi-analyze-btn"
                onClick={analyzeUser}
                disabled={loading || !isFormValid()}
              >
                {loading ? "⏳ Đang phân tích..." : "🔍 Phân Tích Mệnh"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "analysis" && (
          <div className="tuvi-tab-content">
            {analysis ? (
              <div className="tuvi-analysis-result">
                <h2>Kết Quả Phân Tích</h2>

                <div className="tuvi-analysis-card">
                  <h3>🌟 Thông Tin Cơ Bản</h3>
                  <div className="tuvi-element-info">
                    <div className="tuvi-element-primary">
                      <span className="tuvi-element-badge">
                        {analysis.element} 
                      </span>
                      <div className="tuvi-element-description">
                        <div className="tuvi-element-desc">
                          <p>{analysis.elementDesc}</p>
                        </div>
                        <div className="tuvi-element-details">
                          <p><strong>Can Chi:</strong> {analysis.can} {analysis.chi}</p>
                          <p><strong>Nạp Âm:</strong> {analysis.napAmFull}</p>
                        </div>
                      </div>
                    </div>
                    <div className="tuvi-personal-info">
                      <div className="tuvi-info-item">
                        <i className="fas fa-user"></i>
                        <div>
                          <label>Họ Và Tên</label>
                          <p>{analysis.name}</p>
                        </div>
                      </div>
                      <div className="tuvi-info-item">
                        <i className="fas fa-calendar"></i>
                        <div>
                          <label>Ngày Sinh</label>
                          <p>{analysis.birthDay}/{analysis.birthMonth}/{analysis.birthYear}</p>
                        </div>
                      </div>
                      <div className="tuvi-info-item">
                        <i className="fas fa-clock"></i>
                        <div>
                          <label>Giờ Sinh</label>
                          <p>{analysis.birthHour}:{analysis.birthMinute}</p>
                        </div>
                      </div>
                      <div className="tuvi-info-item">
                        <i className="fas fa-venus-mars"></i>
                        <div>
                          <label>Giới Tính</label>
                          <p>{analysis.gender === 'male' ? 'Nam' : 'Nữ'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="tuvi-analysis-card">
                  <h3>💫 Tính Cách & Đặc Điểm</h3>
                  <div className="tuvi-characteristics-grid">
                    <div className="tuvi-characteristic-section positive">
                      <h4><i className="fas fa-plus-circle"></i> Điểm Mạnh</h4>
                      <ul>
                        {analysis.strengths.map((strength, idx) => (
                          <li key={idx}><i className="fas fa-check"></i> {strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="tuvi-characteristic-section negative">
                      <h4><i className="fas fa-minus-circle"></i> Điểm Yếu</h4>
                      <ul>
                        {analysis.weaknesses.map((weakness, idx) => (
                          <li key={idx}><i className="fas fa-times"></i> {weakness}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="tuvi-analysis-card">
                  <h3>🎨 Màu Sắc Phù Hợp</h3>
                  <div className="tuvi-color-section">
                    <div>
                      <h4><i className="fas fa-palette"></i> Màu tương hợp:</h4>
                      <div className="tuvi-color-list">
                        {analysis.compatibleColors.map((color, idx) => (
                          <span key={idx} className="tuvi-color-tag compatible">
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4><i className="fas fa-star"></i> Màu có lợi:</h4>
                      <div className="tuvi-color-list">
                        {analysis.beneficialColors.map((color, idx) => (
                          <span key={idx} className="tuvi-color-tag beneficial">
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4><i className="fas fa-ban"></i> Màu nên tránh:</h4>
                      <div className="tuvi-color-list">
                        {analysis.avoidColors.map((color, idx) => (
                          <span key={idx} className="tuvi-color-tag avoid">
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="tuvi-analysis-card">
                  <h3>💼 Nghề Nghiệp Phù Hợp</h3>
                  <div className="tuvi-career-grid">
                    {analysis.careers.map((career, idx) => (
                      <div key={idx} className="tuvi-career-item">
                        <i className="fas fa-briefcase"></i>
                        <span>{career}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="tuvi-analysis-card">
                  <h3>🧭 Hướng & Số May Mắn</h3>
                  <div className="tuvi-luck-info">
                    <div className="tuvi-directions-section">
                      <h4><i className="fas fa-compass"></i> Hướng May Mắn</h4>
                      <div className="tuvi-directions">
                        {analysis.luckyDirections.map((direction, idx) => (
                          <span key={idx} className="tuvi-direction-tag">
                            {direction}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="tuvi-numbers-section">
                      <h4><i className="fas fa-dice"></i> Số May Mắn</h4>
                      <div className="tuvi-numbers">
                        {analysis.luckyNumbers.map((number, idx) => (
                          <span key={idx} className="tuvi-number-tag">
                            {number}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="tuvi-analysis-card">
                  <h3>🔮 Vật Phẩm May Mắn</h3>
                  <div className="tuvi-lucky-items">
                    {analysis.luckyItems.map((item, idx) => (
                      <div key={idx} className="tuvi-lucky-item">
                        <i className="fas fa-gem"></i>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="tuvi-analysis-card">
                  <h3>🌟 Sao Chiếu Mệnh</h3>
                  <div className="tuvi-stars-info">
                    <div className="tuvi-star-section">
                      <h4><i className="fas fa-star"></i> Chính Tinh</h4>
                      {analysis.stars?.chinhTinh?.map((star, idx) => (
                        <div key={idx} className="tuvi-star-item">
                          <h5>{star.name}</h5>
                          <p className="tuvi-star-desc">{star.desc}</p>
                          <div className="tuvi-star-traits">
                            <div className="tuvi-traits-good">
                              <h6>Điểm Mạnh</h6>
                              <ul>
                                {star.good?.map((trait, i) => (
                                  <li key={i}><i className="fas fa-check"></i> {trait}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="tuvi-traits-bad">
                              <h6>Điểm Cần Lưu Ý</h6>
                              <ul>
                                {star.bad?.map((trait, i) => (
                                  <li key={i}><i className="fas fa-times"></i> {trait}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="tuvi-star-section">
                      <h4><i className="fas fa-star-half-alt"></i> Phụ Tinh</h4>
                      {analysis.stars?.phuTinh?.map((star, idx) => (
                        <div key={idx} className="tuvi-star-item">
                          <h5>{star.name}</h5>
                          <p className="tuvi-star-desc">{star.desc}</p>
                          <div className="tuvi-star-traits">
                            <div className="tuvi-traits-good">
                              <h6>Ảnh Hưởng Tích Cực</h6>
                              <ul>
                                {star.good?.map((trait, i) => (
                                  <li key={i}><i className="fas fa-check"></i> {trait}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="tuvi-traits-bad">
                              <h6>Ảnh Hưởng Cần Lưu Ý</h6>
                              <ul>
                                {star.bad?.map((trait, i) => (
                                  <li key={i}><i className="fas fa-times"></i> {trait}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="tuvi-star-section">
                      <h4><i className="fas fa-compass"></i> Cung Giờ</h4>
                      <div className="tuvi-hour-palace">
                        <p>{analysis.stars?.hourPalace}</p>
                      </div>
                    </div>
                  </div>
                </div>
                    
                <div className="tuvi-analysis-card">
                  <h3>📋 Phân Tích Tổng Hợp</h3>
                  <div className="tuvi-analysis-text">
                    {analysis.analysis.split("\n").map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                  </div>
                </div>

                
              </div>
            ) : (
              <div className="tuvi-no-analysis">
                <p>
                  Chưa có kết quả phân tích. Vui lòng nhập thông tin và phân
                  tích mệnh trước.
                </p>
                <button onClick={() => setActiveTab("info")}>
                  📝 Nhập Thông Tin
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default TuViPage;

