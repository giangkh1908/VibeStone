import { FengShuiAnalyzer } from '../services/FengShuiAnalyzer.js';

const analyzeUser = async (req, res) => {
  console.log('Analyze user request received:', req.body);
  
  try {
    const {
      name,
      birthYear,
      birthMonth,
      birthDay,
      birthHour,
      birthMinute,
      gender,
      preferences
    } = req.body;

    // Validate required fields
    if (!name || !birthYear || !birthMonth || !birthDay || birthHour === undefined || birthMinute === undefined) {
      console.log('Missing required fields:', { name, birthYear, birthMonth, birthDay, birthHour, birthMinute });
      return res.status(400).json({
        success: false,
        error: "Thiếu thông tin bắt buộc: tên, ngày sinh, giờ sinh, phút sinh"
      });
    }

    // Convert to numbers and validate
    const year = parseInt(birthYear);
    const month = parseInt(birthMonth);
    const day = parseInt(birthDay);
    const hour = parseInt(birthHour);
    const minute = parseInt(birthMinute);

    // Validate ranges
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1900 || year > currentYear) {
      return res.status(400).json({
        success: false,
        error: "Năm sinh phải từ 1900 đến hiện tại"
      });
    }

    if (isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        error: "Tháng sinh phải từ 1 đến 12"
      });
    }

    if (isNaN(day) || day < 1 || day > 31) {
      return res.status(400).json({
        success: false,
        error: "Ngày sinh không hợp lệ"
      });
    }

    if (isNaN(hour) || hour < 0 || hour > 23) {
      return res.status(400).json({
        success: false,
        error: "Giờ sinh phải từ 0 đến 23"
      });
    }

    if (isNaN(minute) || minute < 0 || minute > 59) {
      return res.status(400).json({
        success: false,
        error: "Phút sinh phải từ 0 đến 59"
      });
    }

    console.log('Creating FengShuiAnalyzer instance...');

    // Create analyzer instance with error handling
    let analyzer;
    try {
      analyzer = new FengShuiAnalyzer();
      console.log('FengShuiAnalyzer created successfully');
    } catch (error) {
      console.error('Error creating FengShuiAnalyzer:', error);
      return res.status(500).json({
        success: false,
        error: "Lỗi khởi tạo hệ thống phân tích: " + error.message
      });
    }

    console.log('Starting analysis with data:', {
      name,
      birthYear: year,
      birthMonth: month,
      birthDay: day,
      birthHour: hour,
      birthMinute: minute,
      gender: gender || 'nam'
    });

    // Perform analysis with error handling
    let analysis;
    try {
      analysis = analyzer.analyzeByBirthYear(
        year,
        month,
        day,
        hour,
        minute,
        gender || 'nam',
        preferences || '',
        name
      );
      console.log('Analysis completed successfully');
    } catch (error) {
      console.error('Error during analysis:', error);
      return res.status(500).json({
        success: false,
        error: "Lỗi trong quá trình phân tích: " + error.message
      });
    }

    // Prepare response data
    const responseData = {
      name: analysis.name || name,
      element: analysis.element,
      elementDesc: analysis.elementDetail?.desc || '',
      birthYear: year,
      birthMonth: month,
      birthDay: day,
      birthHour: hour,
      birthMinute: minute,
      gender: gender || 'nam',
      can: analysis.canChi?.can || '',
      chi: analysis.canChi?.chi || '',
      napAm: analysis.element,
      napAmFull: analysis.napAmFull || '',
      strengths: analysis.elementDetail?.positive || [],
      weaknesses: analysis.elementDetail?.negative || [],
      compatibleColors: analysis.compatibleColors || [],
      beneficialColors: analysis.beneficialColors || [],
      avoidColors: analysis.avoidColors || [],
      luckyDirections: analysis.luckyDirections || [],
      luckyItems: analysis.luckyItems || [],
      stars: analysis.stars || {},
      analysis: analysis.analysis || ''
    };

    console.log('Sending response...');

    // Return successful response
    return res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error("Unexpected error in analyzeUser:", error);
    console.error("Error stack:", error.stack);
    
    return res.status(500).json({
      success: false,
      error: "Lỗi hệ thống không xác định: " + error.message
    });
  }
};

export { analyzeUser };
