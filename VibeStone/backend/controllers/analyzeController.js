import { FengShuiAnalyzer } from "../services/FengShuiAnalyzer.js";

const analyzer = new FengShuiAnalyzer();

export const analyzeUser = async (req, res) => {
  try {
    const { name, birthYear, birthMonth, birthDay, birthHour, gender } = req.body;

    // Basic validation
    if (!name || !birthYear || !birthMonth || !birthDay || !birthHour || !gender) {
      return res.status(400).json({
        success: false,
        error: "Vui lòng điền đầy đủ thông tin: tên, ngày giờ sinh, giới tính."
      });
    }

    // Perform analysis with the new analyzer
    const analysisResult = analyzer.analyze({
      birthYear: parseInt(birthYear),
      birthMonth: parseInt(birthMonth),
      birthDay: parseInt(birthDay),
      birthHour: parseInt(birthHour),
      gender: gender, // 'male' or 'female'
    });

    // Return the new structured data
    return res.json({
      success: true,
      data: {
        name,
        ...analysisResult
      }
    });

  } catch (error) {
    console.error("Analysis error:", error);
    return res.status(500).json({
      success: false,
      error: "Lỗi máy chủ khi phân tích thông tin."
    });
  }
};