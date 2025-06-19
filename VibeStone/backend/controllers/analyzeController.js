import { FengShuiAnalyzer } from "../services/FengShuiAnalyzer.js";

const analyzer = new FengShuiAnalyzer();

export const analyzeUser = async (req, res) => {
  try {
    const { name, birthYear, birthMonth, birthDay, birthHour, birthMinute, gender, preferences } = req.body;

    // Validate required fields
    if (!name || birthYear === undefined || birthYear === null || 
        birthMonth === undefined || birthMonth === null ||
        birthDay === undefined || birthDay === null ||
        birthHour === undefined || birthHour === null ||
        birthMinute === undefined || birthMinute === null) {
      return res.status(400).json({
        success: false,
        error: "Vui lòng điền đầy đủ thông tin bắt buộc"
      });
    }

    // Validate year range
    if (birthYear < 1900 || birthYear > 2100) {
      return res.status(400).json({
        success: false,
        error: "Năm sinh phải từ 1900 đến 2100"
      });
    }

    // Validate month
    if (birthMonth < 1 || birthMonth > 12) {
      return res.status(400).json({
        success: false,
        error: "Tháng sinh phải từ 1 đến 12"
      });
    }

    // Validate day
    const daysInMonth = new Date(birthYear, birthMonth, 0).getDate();
    if (birthDay < 1 || birthDay > daysInMonth) {
      return res.status(400).json({
        success: false,
        error: `Ngày sinh phải từ 1 đến ${daysInMonth} cho tháng ${birthMonth}`
      });
    }

    // Validate hour
    if (birthHour < 0 || birthHour > 23) {
      return res.status(400).json({
        success: false,
        error: "Giờ sinh phải từ 0 đến 23"
      });
    }

    // Validate minute
    if (birthMinute < 0 || birthMinute > 59) {
      return res.status(400).json({
        success: false,
        error: "Phút sinh phải từ 0 đến 59"
      });
    }

    // Perform analysis
    const analysis = analyzer.analyzeByBirthYear(
      birthYear,
      birthMonth,
      birthDay,
      birthHour,
      birthMinute,
      gender,
      preferences,
      name
    );

    // Return the analysis result
    return res.json({
      success: true,
      data: {
        name,
        birthYear,
        birthMonth,
        birthDay,
        birthHour,
        birthMinute,
        gender,
        element: analysis.element,
        napAmFull: analysis.napAmFull,
        can: analysis.canChi.can,
        chi: analysis.canChi.chi,
        elementDesc: analysis.elementDetail.desc || '',
        strengths: analysis.elementDetail.positive || [],
        weaknesses: analysis.elementDetail.negative || [],
        compatibleColors: analysis.compatibleColors || [],
        beneficialColors: analysis.beneficialColors || [],
        avoidColors: analysis.avoidColors || [],
        careers: analysis.elementDetail.careers || [],
        luckyDirections: analysis.luckyDirections || [],
        luckyNumbers: analysis.luckyNumbers || [],
        luckyItems: analysis.luckyItems || [],
        stars: analysis.stars,
        analysis: analysis.analysis
      }
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return res.status(500).json({
      success: false,
      error: "Lỗi khi phân tích thông tin"
    });
  }
}; 