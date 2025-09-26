import { Lunar } from 'lunar-calendar-ts-vi';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to read JSON data with detailed error logging
const loadJsonData = (fileName) => {
  const filePath = path.resolve(__dirname, '..', 'data', fileName);
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`FATAL: Could not read data file at ${filePath}`);
    console.error('Error details:', error);
    // Re-throw the error to crash the server, making the problem visible
    throw new Error(`Failed to load data file: ${fileName}`);
  }
};

export class FengShuiAnalyzer {
  constructor() {
    this.lunar = new Lunar();
    // Load data from JSON files
    this.nguHanhData = loadJsonData('nguHanh.json');
    this.thienCanData = loadJsonData('thienCan.json');
    this.diaChiData = loadJsonData('diaChi.json');
    this.napAmData = loadJsonData('napAm.json');
    this.cungMenhData = loadJsonData('cungMenh.json');
  }

  /**
   * Converts a solar date to a lunar date object.
   * @param {number} year - Solar year.
   * @param {number} month - Solar month (1-12).
   * @param {number} day - Solar day.
   * @param {number} hour - Solar hour (0-23).
   * @returns {object} Lunar date information.
   */
  convertSolarToLunar(year, month, day, hour) {
    // Pad month and day with a leading zero if they are single-digit
    const paddedMonth = month.toString().padStart(2, '0');
    const paddedDay = day.toString().padStart(2, '0');
    const formattedDate = `${year}-${paddedMonth}-${paddedDay}`;
    console.log(`Attempting to convert solar date: ${formattedDate}, hour: ${hour}`);
    const lunarDate = this.lunar.getBlockLunarDate(formattedDate, hour);
    console.log('Lunar conversion result:', lunarDate);
    return lunarDate;
  }

  /**
   * Gets the Nạp Âm for a given Can and Chi of the year.
   * @param {string} canNam - Can of the year.
   * @param {string} chiNam - Chi of the year.
   * @returns {string} The Nạp Âm.
   */
  getNapAm(canNam, chiNam) {
    const key = `${canNam} ${chiNam}`;
    return this.napAmData[key] || 'Không xác định';
  }

  /**
   * Gets the Cung Mệnh based on the lunar birth year and gender.
   * @param {number} lunarYear - Lunar birth year.
   * @param {string} gender - 'male' or 'female'.
   * @returns {string} The Cung Mệnh.
   */
  getCungMenh(lunarYear, gender) {
    const yearDigits = lunarYear.toString().split('').map(Number);
    const sum = yearDigits.reduce((a, b) => a + b, 0);
    const remainder = sum % 9 === 0 ? 9 : sum % 9;
    
    const genderKey = gender === 'male' ? 'Nam' : 'Nữ';
    return this.cungMenhData[genderKey][remainder] || 'Không xác định';
  }

  /**
   * Gets the Can Chi of the hour based on birth hour and day's Can.
   * @param {number} birthHour - Solar birth hour (0-23).
   * @param {string} canNgay - Can of the day.
   * @returns {object} An object containing can and chi of the hour.
   */
  getCanChiOfHour(birthHour, canNgay) {
    const chiMap = {
      23: 'Tý', 0: 'Tý',
      1: 'Sửu', 2: 'Sửu',
      3: 'Dần', 4: 'Dần',
      5: 'Mão', 6: 'Mão',
      7: 'Thìn', 8: 'Thìn',
      9: 'Tỵ', 10: 'Tỵ',
      11: 'Ngọ', 12: 'Ngọ',
      13: 'Mùi', 14: 'Mùi',
      15: 'Thân', 16: 'Thân',
      17: 'Dậu', 18: 'Dậu',
      19: 'Tuất', 20: 'Tuất',
      21: 'Hợi', 22: 'Hợi',
    };

    const chiGio = chiMap[birthHour];

    const canHourMap = {
      'Giáp': {
        'Tý': 'Giáp', 'Sửu': 'Ất', 'Dần': 'Bính', 'Mão': 'Đinh', 'Thìn': 'Mậu', 'Tỵ': 'Kỷ',
        'Ngọ': 'Canh', 'Mùi': 'Tân', 'Thân': 'Nhâm', 'Dậu': 'Quý', 'Tuất': 'Giáp', 'Hợi': 'Ất'
      },
      'Kỷ': {
        'Tý': 'Giáp', 'Sửu': 'Ất', 'Dần': 'Bính', 'Mão': 'Đinh', 'Thìn': 'Mậu', 'Tỵ': 'Kỷ',
        'Ngọ': 'Canh', 'Mùi': 'Tân', 'Thân': 'Nhâm', 'Dậu': 'Quý', 'Tuất': 'Giáp', 'Hợi': 'Ất'
      },
      'Ất': {
        'Tý': 'Bính', 'Sửu': 'Đinh', 'Dần': 'Mậu', 'Mão': 'Kỷ', 'Thìn': 'Canh', 'Tỵ': 'Tân',
        'Ngọ': 'Nhâm', 'Mùi': 'Quý', 'Thân': 'Giáp', 'Dậu': 'Ất', 'Tuất': 'Bính', 'Hợi': 'Đinh'
      },
      'Canh': {
        'Tý': 'Bính', 'Sửu': 'Đinh', 'Dần': 'Mậu', 'Mão': 'Kỷ', 'Thìn': 'Canh', 'Tỵ': 'Tân',
        'Ngọ': 'Nhâm', 'Mùi': 'Quý', 'Thân': 'Giáp', 'Dậu': 'Ất', 'Tuất': 'Bính', 'Hợi': 'Đinh'
      },
      'Bính': {
        'Tý': 'Mậu', 'Sửu': 'Kỷ', 'Dần': 'Canh', 'Mão': 'Tân', 'Thìn': 'Nhâm', 'Tỵ': 'Quý',
        'Ngọ': 'Giáp', 'Mùi': 'Ất', 'Thân': 'Bính', 'Dậu': 'Đinh', 'Tuất': 'Mậu', 'Hợi': 'Kỷ'
      },
      'Tân': {
        'Tý': 'Mậu', 'Sửu': 'Kỷ', 'Dần': 'Canh', 'Mão': 'Tân', 'Thìn': 'Nhâm', 'Tỵ': 'Quý',
        'Ngọ': 'Giáp', 'Mùi': 'Ất', 'Thân': 'Bính', 'Dậu': 'Đinh', 'Tuất': 'Mậu', 'Hợi': 'Kỷ'
      },
      'Đinh': {
        'Tý': 'Canh', 'Sửu': 'Tân', 'Dần': 'Nhâm', 'Mão': 'Quý', 'Thìn': 'Giáp', 'Tỵ': 'Ất',
        'Ngọ': 'Bính', 'Mùi': 'Đinh', 'Thân': 'Mậu', 'Dậu': 'Kỷ', 'Tuất': 'Canh', 'Hợi': 'Tân'
      },
      'Nhâm': {
        'Tý': 'Canh', 'Sửu': 'Tân', 'Dần': 'Nhâm', 'Mão': 'Quý', 'Thìn': 'Giáp', 'Tỵ': 'Ất',
        'Ngọ': 'Bính', 'Mùi': 'Đinh', 'Thân': 'Mậu', 'Dậu': 'Kỷ', 'Tuất': 'Canh', 'Hợi': 'Tân'
      },
      'Mậu': {
        'Tý': 'Nhâm', 'Sửu': 'Quý', 'Dần': 'Giáp', 'Mão': 'Ất', 'Thìn': 'Bính', 'Tỵ': 'Đinh',
        'Ngọ': 'Mậu', 'Mùi': 'Kỷ', 'Thân': 'Canh', 'Dậu': 'Tân', 'Tuất': 'Nhâm', 'Hợi': 'Quý'
      },
      'Quý': {
        'Tý': 'Nhâm', 'Sửu': 'Quý', 'Dần': 'Giáp', 'Mão': 'Ất', 'Thìn': 'Bính', 'Tỵ': 'Đinh',
        'Ngọ': 'Mậu', 'Mùi': 'Kỷ', 'Thân': 'Canh', 'Dậu': 'Tân', 'Tuất': 'Nhâm', 'Hợi': 'Quý'
      },
    };

    const canGio = canHourMap[canNgay] ? canHourMap[canNgay][chiGio] : 'Không xác định';

    return { can: canGio, chi: chiGio };
  }

  /**
   * Analyzes user's birth information.
   * @param {object} userInfo - User's information.
   * @returns {object} The analysis result.
   */
  analyze(userInfo) {
    const { birthYear, birthMonth, birthDay, birthHour, gender } = userInfo;

    // 1. Convert Solar to Lunar
    const lunarDate = this.convertSolarToLunar(birthYear, birthMonth, birthDay, birthHour);

    // Guard clause to check for invalid date conversion
    if (!lunarDate || !lunarDate.lunarYear) {
      throw new Error("Ngày tháng năm sinh không hợp lệ. Vui lòng kiểm tra lại.");
    }

    // 2. Get Can Chi for year, month, day, hour
    const canChiNam = lunarDate.lunarYearStr.split(' ')[0];
    const chiNam = lunarDate.lunarYearStr.split(' ')[1];
    const canChiThang = lunarDate.lunarMonthStr.split(' ')[0];
    const chiThang = lunarDate.lunarMonthStr.split(' ')[1];
    const canChiNgay = lunarDate.lunarDateStr.split(' ')[0];
    const chiNgay = lunarDate.lunarDateStr.split(' ')[1];

    const { can: canChiGio, chi: chiGio } = this.getCanChiOfHour(birthHour, canChiNgay);

    // 3. Determine Mệnh (Ngũ Hành Nạp Âm)
    const napAm = this.getNapAm(canChiNam, chiNam);
    const menh = Object.keys(this.nguHanhData).find(key => napAm.includes(key)) || 'Không xác định';
    const menhInfo = this.nguHanhData[menh];

    // 4. Determine Cung Mệnh
    const cungMenh = this.getCungMenh(lunarDate.lunarYear, gender);

    // 5. Build the result object
    const result = {
      solarDate: `${birthDay}/${birthMonth}/${birthYear}`,
      lunarDate: `${lunarDate.lunarDate}/${lunarDate.lunarMonth}/${lunarDate.lunarYear}`,
      tuTru: {
        nam: { can: canChiNam, chi: chiNam },
        thang: { can: canChiThang, chi: chiThang },
        ngay: { can: canChiNgay, chi: chiNgay },
        gio: { can: canChiGio, chi: chiGio },
      },
      menh: {
        napAm: napAm,
        nguHanh: menh,
        ...menhInfo,
      },
      cungMenh: cungMenh,
    };

    return result;
  }
}

export default FengShuiAnalyzer;
