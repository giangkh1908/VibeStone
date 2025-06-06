import { useState } from "react";
import "./TuViPage.css"; // Import your CSS styles

const API_BASE = "http://localhost:5000/api"; // Change port if needed

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
    if (minute < 0 || minute > 59) {
      setError("Phút sinh phải từ 0 đến 59");
      return false;
    }

    return true;
  };

  const analyzeUser = async () => {
    if (!validateInput()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Sending request with data:", userInfo);
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
      console.log("Received response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Lỗi phân tích");
      }

      if (!data.data) {
        throw new Error("Không nhận được dữ liệu phân tích");
      }

      setAnalysis(data.data);
      setActiveTab("analysis");
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <nav className="tab-nav">
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

      <main className="app-main">
        {error && <div className="error-message">⚠️ {error}</div>}
        {loading && <div className="loading-message">⏳ Đang phân tích...</div>}

        {activeTab === "info" && (
          <div className="tab-content">
            <div className="user-info-form">
              <h2>Thông Tin Cá Nhân</h2>

              <div className="form-group">
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

              <div className="form-group">
                <label>Ngày Sinh *</label>
                <div className="birth-date-group">
                  <div className="date-time-inputs">
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

              <div className="form-group">
                <label>Giờ Sinh *</label>
                <div className="date-time-inputs">
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

              <div className="form-group">
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

              <div className="form-group">
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
              </div>

              <button
                className="analyze-btn"
                onClick={analyzeUser}
                disabled={loading}
              >
                {loading ? "⏳ Đang phân tích..." : "🔍 Phân Tích Mệnh"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "analysis" && (
          <div className="tab-content">
            {analysis ? (
              <div className="analysis-result">
                <h2>Kết Quả Phân Tích</h2>

                <div className="analysis-card">
                  <h3>🌟 Thông Tin Cơ Bản</h3>
                  <div className="element-info">
                    <div className="element-primary">
                      <span className="element-badge">
                        {analysis.element} 
                      </span>
                      <div className="element-description">
                        <div className="element-desc">
                          <p>{analysis.elementDesc}</p>
                        </div>
                        <div className="element-details">
                          <p><strong>Can Chi:</strong> {analysis.can} {analysis.chi}</p>
                          <p><strong>Nạp Âm:</strong> {analysis.napAmFull}</p>
                        </div>
                      </div>
                    </div>
                    <div className="personal-info">
                      <div className="info-item">
                        <i className="fas fa-user"></i>
                        <div>
                          <label>Họ Và Tên</label>
                          <p>{analysis.name}</p>
                        </div>
                      </div>
                      <div className="info-item">
                        <i className="fas fa-calendar"></i>
                        <div>
                          <label>Ngày Sinh</label>
                          <p>{analysis.birthDay}/{analysis.birthMonth}/{analysis.birthYear}</p>
                        </div>
                      </div>
                      <div className="info-item">
                        <i className="fas fa-clock"></i>
                        <div>
                          <label>Giờ Sinh</label>
                          <p>{analysis.birthHour}:{analysis.birthMinute}</p>
                        </div>
                      </div>
                      <div className="info-item">
                        <i className="fas fa-venus-mars"></i>
                        <div>
                          <label>Giới Tính</label>
                          <p>{analysis.gender === 'male' ? 'Nam' : 'Nữ'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="analysis-card">
                  <h3>💫 Tính Cách & Đặc Điểm</h3>
                  <div className="characteristics-grid">
                    <div className="characteristic-section positive">
                      <h4><i className="fas fa-plus-circle"></i> Điểm Mạnh</h4>
                      <ul>
                        {analysis.strengths.map((strength, idx) => (
                          <li key={idx}><i className="fas fa-check"></i> {strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="characteristic-section negative">
                      <h4><i className="fas fa-minus-circle"></i> Điểm Yếu</h4>
                      <ul>
                        {analysis.weaknesses.map((weakness, idx) => (
                          <li key={idx}><i className="fas fa-times"></i> {weakness}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="analysis-card">
                  <h3>🎨 Màu Sắc & Vật Phẩm</h3>
                  <div className="color-section">
                    <div>
                      <h4><i className="fas fa-palette"></i> Màu tương hợp:</h4>
                      <div className="color-list">
                        {analysis.compatibleColors.map((color, idx) => (
                          <span key={idx} className="color-tag compatible">
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4><i className="fas fa-star"></i> Màu có lợi:</h4>
                      <div className="color-list">
                        {analysis.beneficialColors.map((color, idx) => (
                          <span key={idx} className="color-tag beneficial">
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4><i className="fas fa-ban"></i> Màu nên tránh:</h4>
                      <div className="color-list">
                        {analysis.avoidColors.map((color, idx) => (
                          <span key={idx} className="color-tag avoid">
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="analysis-card">
                  <h3>💼 Nghề Nghiệp Phù Hợp</h3>
                  <div className="career-grid">
                    {analysis.careers.map((career, idx) => (
                      <div key={idx} className="career-item">
                        <i className="fas fa-briefcase"></i>
                        <span>{career}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="analysis-card">
                  <h3>🧭 Hướng & Số May Mắn</h3>
                  <div className="luck-info">
                    <div className="directions-section">
                      <h4><i className="fas fa-compass"></i> Hướng May Mắn</h4>
                      <div className="directions">
                        {analysis.luckyDirections.map((direction, idx) => (
                          <span key={idx} className="direction-tag">
                            {direction}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="numbers-section">
                      <h4><i className="fas fa-dice"></i> Số May Mắn</h4>
                      <div className="numbers">
                        {analysis.luckyNumbers.map((number, idx) => (
                          <span key={idx} className="number-tag">
                            {number}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="analysis-card">
                  <h3>🔮 Vật Phẩm May Mắn</h3>
                  <div className="lucky-items">
                    {analysis.luckyItems.map((item, idx) => (
                      <div key={idx} className="lucky-item">
                        <i className="fas fa-gem"></i>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="analysis-card">
                  <h3>🌟 Phân Tích Sao</h3>
                  <div className="stars-info">
                    <div className="star-section">
                      <h4><i className="fas fa-star"></i> Chính Tinh</h4>
                      {analysis.stars?.chinhTinh?.map((star, idx) => (
                        <div key={idx} className="star-item">
                          <h5>{star.name}</h5>
                          <p className="star-desc">{star.desc}</p>
                          <div className="star-traits">
                            <div className="traits-good">
                              <h6>Điểm Mạnh</h6>
                              <ul>
                                {star.good?.map((trait, i) => (
                                  <li key={i}><i className="fas fa-check"></i> {trait}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="traits-bad">
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

                    <div className="star-section">
                      <h4><i className="fas fa-star-half-alt"></i> Phụ Tinh</h4>
                      {analysis.stars?.phuTinh?.map((star, idx) => (
                        <div key={idx} className="star-item">
                          <h5>{star.name}</h5>
                          <p className="star-desc">{star.desc}</p>
                          <div className="star-traits">
                            <div className="traits-good">
                              <h6>Ảnh Hưởng Tích Cực</h6>
                              <ul>
                                {star.good?.map((trait, i) => (
                                  <li key={i}><i className="fas fa-check"></i> {trait}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="traits-bad">
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

                    <div className="star-section">
                      <h4><i className="fas fa-compass"></i> Cung Giờ</h4>
                      <div className="hour-palace">
                        <p>{analysis.stars?.hourPalace}</p>
                      </div>
                    </div>
                  </div>
                </div>
                    
                <div className="analysis-card">
                  <h3>📋 Phân Tích Tổng Hợp</h3>
                  <div className="analysis-text">
                    {analysis.analysis.split("\n").map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                  </div>
                </div>

                
              </div>
            ) : (
              <div className="no-analysis">
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

