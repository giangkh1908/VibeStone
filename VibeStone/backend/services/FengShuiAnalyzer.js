export class FengShuiAnalyzer {
  constructor() {
    // Danh sách Can và Chi
    this.canList = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
    this.chiList = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

    // Ngũ Hành nạp âm (dựa trên tổ hợp Can Chi)
    this.napAmElements = {
      'Giáp Tý': 'Kim', 'Ất Sửu': 'Kim', 'Bính Dần': 'Hỏa', 'Đinh Mão': 'Hỏa', 'Mậu Thìn': 'Mộc',
      'Kỷ Tỵ': 'Mộc', 'Canh Ngọ': 'Thổ', 'Tân Mùi': 'Thổ', 'Nhâm Thân': 'Kim', 'Quý Dậu': 'Kim',
      'Giáp Tuất': 'Hỏa', 'Ất Hợi': 'Hỏa', 'Bính Tý': 'Thủy', 'Đinh Sửu': 'Thủy', 'Mậu Dần': 'Thổ',
      'Kỷ Mão': 'Thổ', 'Canh Thìn': 'Kim', 'Tân Tỵ': 'Kim', 'Nhâm Ngọ': 'Mộc', 'Quý Mùi': 'Mộc',
      'Giáp Thân': 'Thủy', 'Ất Dậu': 'Thủy', 'Bính Tuất': 'Thổ', 'Đinh Hợi': 'Thổ', 'Mậu Tý': 'Hỏa',
      'Kỷ Sửu': 'Hỏa', 'Canh Dần': 'Mộc', 'Tân Mão': 'Mộc', 'Nhâm Thìn': 'Thủy', 'Quý Tỵ': 'Thủy',
      'Giáp Ngọ': 'Kim', 'Ất Mùi': 'Kim', 'Bính Thân': 'Hỏa', 'Đinh Dậu': 'Hỏa', 'Mậu Tuất': 'Mộc',
      'Kỷ Hợi': 'Mộc', 'Canh Tý': 'Thổ', 'Tân Sửu': 'Thổ', 'Nhâm Dần': 'Kim', 'Quý Mão': 'Kim',
      'Giáp Thìn': 'Hỏa', 'Ất Tỵ': 'Hỏa', 'Bính Ngọ': 'Thủy', 'Đinh Mùi': 'Thủy', 'Mậu Thân': 'Thổ',
      'Kỷ Dậu': 'Thổ', 'Canh Tuất': 'Kim', 'Tân Hợi': 'Kim', 'Nhâm Tý': 'Mộc', 'Quý Sửu': 'Mộc',
      'Giáp Dần': 'Thủy', 'Ất Mão': 'Thủy', 'Bính Thìn': 'Thổ', 'Đinh Tỵ': 'Thổ', 'Mậu Ngọ': 'Hỏa',
      'Kỷ Mùi': 'Hỏa', 'Canh Thân': 'Mộc', 'Tân Dậu': 'Mộc', 'Nhâm Tuất': 'Thủy', 'Quý Hợi': 'Thủy'
    };

    // Ý nghĩa Ngũ Hành
    this.elementMeanings = {
      'Kim': {
        desc: 'Kim tượng trưng cho kim loại, biểu thị sự cứng cáp, kiên định và sắc sảo. Người mệnh Kim thường có tư duy logic, khả năng phân tích tốt và tinh thần độc lập.',
        positive: ['Tư duy sắc bén', 'Ý chí kiên định', 'Trung thành', 'Đáng tin cậy'],
        negative: ['Cứng nhắc', 'Thích cạnh tranh', 'Ít biểu lộ cảm xúc'],
        careers: ['Các ngành liên quan đến tài chính, kinh doanh, kỹ thuật như: ngân hàng, kế toán, kỹ sư, công nghệ thông tin.', 'Nghề đòi hỏi sự chính xác như luật sư, thẩm phán, hoặc các ngành chế tác', 'Các vị trí lãnh đạo, quản lý nhờ khả năng tổ chức']
      },
      'Mộc': {
        desc: 'Mộc tượng trưng cho cây cối, biểu thị sự phát triển, lòng nhân ái, sáng tạo và linh hoạt. Người mệnh Mộc có khả năng thích nghi cao, năng động, giàu ý tưởng và thích khám phá.',
        positive: ['Sáng tạo', 'Hòa đồng', 'Thích nghi cao', 'Linh hoạt', 'Cầu tiến'],
        negative: ['Thiếu quyết đoán', 'Cảm xúc thất thường', 'Quá tham vọng'],
        careers: ['Các ngành sáng tạo như thiết kế, kiến trúc, nghệ thuật, viết lách, truyền thông', 'Ngành liên quan đến giáo dục, nghiên cứu, hoặc nông nghiệp, lâm nghiệp', 'Các công việc liên quan đến phát triển cộng đồng, từ thiện']
      },
      'Thủy': {
        desc: 'Mệnh Thủy tượng trưng cho nước, sự uyển chuyển, thông minh và khả năng thích nghi. Người mệnh Thủy thường sâu sắc, nhạy cảm và giỏi giao tiếp.',
        positive: ['Thông minh', 'Linh hoạt', 'Giao tiếp tốt', 'Trực giác mạnh'],
        negative: ['Thiếu kiên định', 'Hay lo lắng', 'Cuốn theo cảm xúc'],
        careers: ['Các ngành liên quan đến giao tiếp, ngoại giao như quan hệ công chúng, ngoại giao, báo chí', 'Ngành liên quan đến nước như hàng hải, du lịch, vận tải biển', 'Các nghề sáng tạo như âm nhạc, hội họa, hoặc marketing']
      },
      'Hỏa': {
        desc: 'Mệnh Hỏa tượng trưng cho lửa, biểu thị nhiệt huyết, đam mê và năng lượng tích cực. Người mệnh Hỏa thường sôi nổi, dám nghĩ dám làm và đầy nhiệt huyết.',
        positive: ['Năng động', 'Cuốn hút', 'Tinh thần thép'],
        negative: ['Nóng nảy', 'Thiếu kiên nhẫn', 'Tự cao'],
        careers: ['Các ngành năng động như quảng cáo, marketing, truyền thông, tổ chức sự kiện', 'Ngành công nghiệp năng lượng, công nghệ, hoặc các nghề liên quan đến ánh sáng, nhiệt', 'Các nghề đòi hỏi sự dẫn dắt như diễn giả, huấn luyện viên']
      },
      'Thổ': {
        desc: 'Mệnh Thổ tượng trưng cho đất, sự ổn định, nuôi dưỡng và đáng tin cậy. Người mệnh Thổ thường điềm tĩnh, trung thành và có trách nhiệm.',
        positive: ['Đáng tin cậy', 'Trung thành', 'Ổn định', 'Thực tế'],
        negative: ['Bảo thủ', 'Chậm thích nghi', 'Dễ bị lợi dụng'],
        careers: ['Các ngành liên quan đến đất như bất động sản, xây dựng, nông nghiệp', 'Ngành cần sự ổn định như giáo viên, nhân sự, quản lý hành chính', 'Các nghề liên quan đến tư vấn, chăm sóc khách hàng, hoặc công việc từ thiện']
      }
    };

    // Màu sắc theo Ngũ Hành
    this.colorMapping = {
      'Kim': { 
        compatible: ['trắng', 'bạc', 'vàng kim'], 
        beneficial: ['vàng đất', 'nâu đất'], // Thổ sinh Kim
        avoid: ['đỏ', 'hồng', 'tím'] // Hỏa khắc Kim
      },
      'Mộc': { 
        compatible: ['xanh lá', 'đen', 'xanh dương'], 
        beneficial: ['đen', 'xanh dương'], // Thủy sinh Mộc
        avoid: ['trắng', 'bạc', 'vàng kim'] // Kim khắc Mộc
      },
      'Thủy': { 
        compatible: ['đen', 'xanh dương', 'trắng', 'bạc'], 
        beneficial: ['trắng', 'bạc'], // Kim sinh Thủy
        avoid: ['vàng đất', 'nâu đất'] // Thổ khắc Thủy
      },
      'Hỏa': { 
        compatible: ['đỏ', 'hồng', 'tím', 'xanh lá'], 
        beneficial: ['xanh lá', 'đỏ'], // Mộc sinh Hỏa
        avoid: ['đen', 'xanh dương'] // Thủy khắc Hỏa
      },
      'Thổ': { 
        compatible: ['vàng đất', 'nâu đất', 'đỏ', 'hồng'], 
        beneficial: ['đỏ', 'hồng'], // Hỏa sinh Thổ
        avoid: ['xanh lá', 'xanh ngọc'] // Mộc khắc Thổ
      }
    };

    // Hướng tốt theo Ngũ Hành
    this.directionMapping = {
      'Kim': ['Tây', 'Tây Bắc'],
      'Mộc': ['Đông', 'Đông Nam'],
      'Thủy': ['Bắc'],
      'Hỏa': ['Nam'],
      'Thổ': ['Đông Bắc', 'Tây Nam']
    };

    // Số may mắn theo Ngũ Hành
    this.luckyNumbers = {
      'Kim': [7, 8],
      'Mộc': [3, 4],
      'Thủy': [1, 6],
      'Hỏa': [2, 9],
      'Thổ': [0, 5]
    };

    // Vật phẩm phong thủy may mắn theo Ngũ Hành
    this.luckyItems = {
      'Kim': ['Đồ kim loại', 'Đá thạch anh trắng', 'Gương'],
      'Mộc': ['Cây xanh', 'Đồ gỗ', 'Tranh phong cảnh'],
      'Thủy': ['Bể cá', 'Tranh nước', 'Đá thạch anh đen'],
      'Hỏa': ['Đèn đỏ', 'Nến', 'Đá ruby', 'Thạch anh hồng'],
      'Thổ': ['Đồ gốm, sứ', 'Đá thạch anh vàng', 'Tranh sơn thủy']
    };

    // Hệ thống sao
    this.stars = {
      chinhTinh: {
        'Thái Dương': {
          desc: 'Chủ về quyền lực, danh vọng, sự nghiệp',
          good: ['Sáng sủa, nhiệt huyết', 'Có tài lãnh đạo', 'Thành công trong sự nghiệp'],
          bad: ['Kiêu ngạo', 'Nóng nảy', 'Độc đoán']
        },
        'Thái Âm': {
          desc: 'Chủ về tình cảm, gia đình, sự ổn định',
          good: ['Nhạy cảm, tinh tế', 'Quan tâm gia đình', 'Có tài ngoại giao'],
          bad: ['Dễ xúc động', 'Thiếu quyết đoán', 'Hay lo lắng']
        },
        'Mộc Đức': {
          desc: 'Chủ về học vấn, trí tuệ, sự phát triển',
          good: ['Thông minh, sáng tạo', 'Ham học hỏi', 'Có tài văn chương'],
          bad: ['Thiếu thực tế', 'Hay mơ mộng', 'Khó tập trung']
        },
        'Thủy Đức': {
          desc: 'Chủ về tài lộc, kinh doanh, sự linh hoạt',
          good: ['Khéo léo, mềm dẻo', 'Có tài kinh doanh', 'Giao tiếp tốt'],
          bad: ['Thiếu kiên định', 'Dễ thay đổi', 'Hay do dự']
        },
        'Kim Đức': {
          desc: 'Chủ về công danh, địa vị, sự uy nghiêm',
          good: ['Cương nghị, chính trực', 'Có uy tín', 'Đáng tin cậy'],
          bad: ['Cứng nhắc', 'Thiếu linh hoạt', 'Khó gần']
        },
        'Hỏa Đức': {
          desc: 'Chủ về nhiệt huyết, đam mê, sự năng động',
          good: ['Nhiệt tình, năng động', 'Có sức hút', 'Dám nghĩ dám làm'],
          bad: ['Nóng nảy', 'Thiếu kiên nhẫn', 'Dễ bốc đồng']
        },
        'Thổ Đức': {
          desc: 'Chủ về ổn định, thực tế, sự vững chắc',
          good: ['Ổn định, đáng tin', 'Thực tế, cẩn thận', 'Có trách nhiệm'],
          bad: ['Bảo thủ', 'Chậm thích nghi', 'Thiếu sáng tạo']
        }
      },
      phuTinh: {
        'Thiên Đức': {
          desc: 'Sao phúc đức, mang lại may mắn và cơ hội',
          good: ['Gặp nhiều may mắn', 'Được quý nhân giúp đỡ', 'Có cơ hội tốt'],
          bad: ['Dễ bỏ lỡ cơ hội', 'Thiếu quyết đoán khi cần']
        },
        'Thiên Hỷ': {
          desc: 'Sao vui vẻ, mang lại niềm vui và hạnh phúc',
          good: ['Vui vẻ, lạc quan', 'Được yêu mến', 'Có duyên với người khác'],
          bad: ['Dễ bị lừa gạt', 'Thiếu cảnh giác']
        },
        'Thiên Mã': {
          desc: 'Sao di chuyển, mang lại sự thay đổi và cơ hội',
          good: ['Nhiều cơ hội đi xa', 'Dễ thích nghi', 'Có tài ngoại giao'],
          bad: ['Khó ổn định', 'Hay thay đổi công việc']
        },
        'Thiên Khốc': {
          desc: 'Sao buồn bã, mang lại thử thách và bài học',
          good: ['Rèn luyện tính kiên nhẫn', 'Trưởng thành qua khó khăn'],
          bad: ['Dễ buồn bã', 'Gặp nhiều trở ngại']
        },
        'Thiên Hư': {
          desc: 'Sao hư hao, mang lại sự mất mát và bài học',
          good: ['Học cách tiết kiệm', 'Biết quý trọng những gì mình có'],
          bad: ['Dễ hao tài', 'Gặp nhiều mất mát']
        }
      }
    };

    // Cung mệnh theo giờ sinh
    this.hourPalace = {
      'Tý': 'Cung Tý',
      'Sửu': 'Cung Sửu',
      'Dần': 'Cung Dần',
      'Mão': 'Cung Mão',
      'Thìn': 'Cung Thìn',
      'Tỵ': 'Cung Tỵ',
      'Ngọ': 'Cung Ngọ',
      'Mùi': 'Cung Mùi',
      'Thân': 'Cung Thân',
      'Dậu': 'Cung Dậu',
      'Tuất': 'Cung Tuất',
      'Hợi': 'Cung Hợi'
    };
  }

  calculateCanChi(birthYear) {
    // Năm Giáp Tý (1984) là điểm mốc
    const startYear = 1984;
    const offset = (birthYear - startYear) % 60;
    const adjustedOffset = offset < 0 ? (offset + 60) % 60 : offset;

    const canIndex = adjustedOffset % 10;
    const chiIndex = adjustedOffset % 12;

    return {
      can: this.canList[canIndex],
      chi: this.chiList[chiIndex]
    };
  }

  calculateElement(birthYear) {
    const canChi = this.calculateCanChi(birthYear);
    const canChiKey = `${canChi.can} ${canChi.chi}`;
    return this.napAmElements[canChiKey] || 'Không xác định';
  }

  calculateHourPalace(birthHour) {
    const hourIndex = Math.floor(birthHour / 2);
    return this.chiList[hourIndex];
  }

  calculateStars(birthHour, birthDay) {
    try {
      // Đảm bảo birthHour và birthDay là số
      birthHour = parseInt(birthHour) || 0;
      birthDay = parseInt(birthDay) || 1;

      const hourPalace = this.calculateHourPalace(birthHour);
      const dayMod = birthDay % 10;
      const hourMod = birthHour % 12;

      // Tính sao chính tinh
      const chinhTinh = [];
      const starKeys = Object.keys(this.stars.chinhTinh);
      if (starKeys.length > 0) {
        const mainStarIndex = (dayMod + hourMod) % starKeys.length;
        const mainStar = starKeys[mainStarIndex];
        const mainStarInfo = this.stars.chinhTinh[mainStar];
        
        if (mainStarInfo) {
          chinhTinh.push({
            name: mainStar,
            desc: mainStarInfo.desc || 'Không có mô tả',
            good: mainStarInfo.good || [],
            bad: mainStarInfo.bad || []
          });
        }
      }

      // Tính sao phụ tinh
      const phuTinh = [];
      const phuStarKeys = Object.keys(this.stars.phuTinh);
      if (phuStarKeys.length > 0) {
        const phuStarIndex = (dayMod * 2 + hourMod) % phuStarKeys.length;
        const phuStar = phuStarKeys[phuStarIndex];
        const phuStarInfo = this.stars.phuTinh[phuStar];
        
        if (phuStarInfo) {
          phuTinh.push({
            name: phuStar,
            desc: phuStarInfo.desc || 'Không có mô tả',
            good: phuStarInfo.good || [],
            bad: phuStarInfo.bad || []
          });
        }
      }

      // Đảm bảo hourPalace có giá trị
      const hourPalaceValue = this.hourPalace[hourPalace] || 'Không xác định';

      // console.log('Star calculation result:', {
      //   chinhTinh,
      //   phuTinh,
      //   hourPalace: hourPalaceValue
      // });

      return {
        chinhTinh,
        phuTinh,
        hourPalace: hourPalaceValue
      };
    } catch (error) {
      console.error('Error calculating stars:', error);
      return {
        chinhTinh: [],
        phuTinh: [],
        hourPalace: 'Không xác định'
      };
    }
  }

  analyzeByBirthYear(birthYear, birthMonth = 1, birthDay = 1, birthHour = 0, birthMinute = 0, gender, preferences, name) {
    const element = this.calculateElement(birthYear);
    const colorInfo = this.colorMapping[element] || {};
    const luckyDirections = this.directionMapping[element] || [];
    const luckyNumbers = this.luckyNumbers[element] || [];
    const canChi = this.calculateCanChi(birthYear);
    const stars = this.calculateStars(birthHour, birthDay);

    // Lấy nạp âm (ví dụ: Dương Liễu Mộc, Kiếm Phong Kim...) nếu có
    const canChiKey = `${canChi.can} ${canChi.chi}`;
    // Danh sách nạp âm đầy đủ
    const napAmFullMapping = {
      'Giáp Tý': 'Hải Trung Kim', 'Ất Sửu': 'Hải Trung Kim',
      'Bính Dần': 'Lư Trung Hỏa', 'Đinh Mão': 'Lư Trung Hỏa',
      'Mậu Thìn': 'Đại Lâm Mộc', 'Kỷ Tỵ': 'Đại Lâm Mộc',
      'Canh Ngọ': 'Lộ Bàng Thổ', 'Tân Mùi': 'Lộ Bàng Thổ',
      'Nhâm Thân': 'Kiếm Phong Kim', 'Quý Dậu': 'Kiếm Phong Kim',
      'Giáp Tuất': 'Sơn Đầu Hỏa', 'Ất Hợi': 'Sơn Đầu Hỏa',
      'Bính Tý': 'Giản Hạ Thủy', 'Đinh Sửu': 'Giản Hạ Thủy',
      'Mậu Dần': 'Thành Đầu Thổ', 'Kỷ Mão': 'Thành Đầu Thổ',
      'Canh Thìn': 'Bạch Lạp Kim', 'Tân Tỵ': 'Bạch Lạp Kim',
      'Nhâm Ngọ': 'Dương Liễu Mộc', 'Quý Mùi': 'Dương Liễu Mộc',
      'Giáp Thân': 'Tuyền Trung Thủy', 'Ất Dậu': 'Tuyền Trung Thủy',
      'Bính Tuất': 'Ốc Thượng Thổ', 'Đinh Hợi': 'Ốc Thượng Thổ',
      'Mậu Tý': 'Tích Lịch Hỏa', 'Kỷ Sửu': 'Tích Lịch Hỏa',
      'Canh Dần': 'Tùng Bách Mộc', 'Tân Mão': 'Tùng Bách Mộc',
      'Nhâm Thìn': 'Trường Lưu Thủy', 'Quý Tỵ': 'Trường Lưu Thủy',
      'Giáp Ngọ': 'Sa Trung Kim', 'Ất Mùi': 'Sa Trung Kim',
      'Bính Thân': 'Sơn Hạ Hỏa', 'Đinh Dậu': 'Sơn Hạ Hỏa',
      'Mậu Tuất': 'Bình Địa Mộc', 'Kỷ Hợi': 'Bình Địa Mộc',
      'Canh Tý': 'Bích Thượng Thổ', 'Tân Sửu': 'Bích Thượng Thổ',
      'Nhâm Dần': 'Kim Bạch Kim', 'Quý Mão': 'Kim Bạch Kim',
      'Giáp Thìn': 'Phú Đăng Hỏa', 'Ất Tỵ': 'Phú Đăng Hỏa',
      'Bính Ngọ': 'Thiên Hà Thủy', 'Đinh Mùi': 'Thiên Hà Thủy',
      'Mậu Thân': 'Đại Dịch Thổ', 'Kỷ Dậu': 'Đại Dịch Thổ',
      'Canh Tuất': 'Thoa Xuyến Kim', 'Tân Hợi': 'Thoa Xuyến Kim',
      'Nhâm Tý': 'Tang Đố Mộc', 'Quý Sửu': 'Tang Đố Mộc',
      'Giáp Dần': 'Đại Khê Thủy', 'Ất Mão': 'Đại Khê Thủy',
      'Bính Thìn': 'Sa Trung Thổ', 'Đinh Tỵ': 'Sa Trung Thổ',
      'Mậu Ngọ': 'Thiên Thượng Hỏa', 'Kỷ Mùi': 'Thiên Thượng Hỏa',
      'Canh Thân': 'Thạch Lựu Mộc', 'Tân Dậu': 'Thạch Lựu Mộc',
      'Nhâm Tuất': 'Đại Hải Thủy', 'Quý Hợi': 'Đại Hải Thủy',
    };
    const napAmFull = napAmFullMapping[canChiKey] || 'Không xác định';
    // Đảm bảo birthDay và birthMonth luôn là số hợp lệ
    birthDay = parseInt(birthDay) || 1;
    birthMonth = parseInt(birthMonth) || 1;

    // Phân tích ngày sinh
    let birthDayDetail = '';
    if ([1, 11, 21, 31].includes(birthDay)) birthDayDetail = 'Bạn là người mạnh mẽ, quyết đoán, có tố chất lãnh đạo.';
    else if ([2, 12, 22].includes(birthDay)) birthDayDetail = 'Bạn sống tình cảm, biết quan tâm, dễ tạo thiện cảm.';
    else if ([5, 15, 25].includes(birthDay)) birthDayDetail = 'Bạn có tư duy logic, thực tế, đáng tin cậy.';
    else if ([7, 17, 27].includes(birthDay)) birthDayDetail = 'Bạn sáng tạo, thích khám phá, có cá tính riêng.';
    else birthDayDetail = 'Bạn có cá tính cân bằng, hài hòa.';

    // Phân tích tháng sinh
    let birthMonthDetail = '';
    if ([1, 2].includes(birthMonth)) birthMonthDetail = 'Sinh vào mùa Xuân, vận khí tươi mới, hợp với mệnh Mộc.';
    else if ([3, 4, 5].includes(birthMonth)) birthMonthDetail = 'Sinh vào mùa Hạ, năng lượng dồi dào, hợp mệnh Hỏa.';
    else if ([6, 7, 8].includes(birthMonth)) birthMonthDetail = 'Sinh vào mùa Thu, ổn định, hợp mệnh Kim.';
    else if ([9, 10, 11].includes(birthMonth)) birthMonthDetail = 'Sinh vào mùa Đông, sâu sắc, hợp mệnh Thủy.';
    else if (birthMonth === 12) birthMonthDetail = 'Sinh cuối năm, có ý chí vươn lên, hợp mệnh Thổ.';
    else birthMonthDetail = '';

    // Xử lý thông tin sao
    const starAnalysis = {
      chinhTinh: stars.chinhTinh.map(star => ({
        name: star.name,
        desc: star.desc,
        good: star.good,
        bad: star.bad
      })),
      phuTinh: stars.phuTinh.map(star => ({
        name: star.name,
        desc: star.desc,
        good: star.good,
        bad: star.bad
      })),
      hourPalace: stars.hourPalace
    };

    return {
      birthYear,
      element,
      elementDetail: this.elementMeanings[element] || {},
      canChi: {
        ...canChi,
        full: `${canChi.can} ${canChi.chi}`,
        description: `${canChi.can} ${canChi.chi} (${birthYear})`
      },
      napAmFull,
      compatibleColors: colorInfo.compatible || [],
      beneficialColors: colorInfo.beneficial || [],
      avoidColors: colorInfo.avoid || [],
      luckyDirections,
      luckyNumbers,
      luckyItems: this.luckyItems[element] || [],
      birthDayDetail,
      birthMonthDetail,
      stars: starAnalysis,
      analysis: this.generateAnalysisText(element, birthYear, gender, preferences, canChi, starAnalysis)
    };
  }

  generateAnalysisText(element, birthYear, gender, preferences, canChi, stars) {
    let text = this.generateBasicAnalysis(element, birthYear, gender, preferences, canChi);
    
    // Thêm phần phân tích sao
    text += `\n\n🌟 PHÂN TÍCH SAO\n`;
    if (stars && stars.hourPalace) {
      text += `Cung giờ: ${stars.hourPalace}\n\n`;
    }
    
    // Phân tích chính tinh
    if (stars && stars.chinhTinh && stars.chinhTinh.length > 0) {
      text += `Chính tinh:\n`;
      stars.chinhTinh.forEach(star => {
        if (star && star.name) {
          text += `- ${star.name}: ${star.desc || 'Không có mô tả'}\n`;
          if (star.good && star.good.length > 0) {
            text += `  Điểm mạnh:\n`;
            star.good.forEach(point => text += `  + ${point}\n`);
          }
          if (star.bad && star.bad.length > 0) {
            text += `  Điểm cần lưu ý:\n`;
            star.bad.forEach(point => text += `  - ${point}\n`);
          }
        }
      });
    }

    // Phân tích phụ tinh
    if (stars && stars.phuTinh && stars.phuTinh.length > 0) {
      text += `\nPhụ tinh:\n`;
      stars.phuTinh.forEach(star => {
        if (star && star.name) {
          text += `- ${star.name}: ${star.desc || 'Không có mô tả'}\n`;
          if (star.good && star.good.length > 0) {
            text += `  Ảnh hưởng tích cực:\n`;
            star.good.forEach(point => text += `  + ${point}\n`);
          }
          if (star.bad && star.bad.length > 0) {
            text += `  Ảnh hưởng cần lưu ý:\n`;
            star.bad.forEach(point => text += `  - ${point}\n`);
          }
        }
      });
    }

    return text;
  }

  generateBasicAnalysis(element, birthYear, gender, preferences, canChi) {
    const elementInfo = this.elementMeanings[element] || {};

    let text = `🌟 THÔNG TIN TỔNG QUAN\n`;
    text += `Bạn sinh năm ${birthYear}, tuổi ${canChi.chi}\n`;
    text += `Năm sinh: ${canChi.can} ${canChi.chi}\n`;
    text += `Mệnh: ${element}\n\n`;
    
    text += `🎭 TÍNH CÁCH VÀ ĐẶC ĐIỂM\n`;
    text += `${elementInfo.desc || 'Không có thông tin mô tả.'}\n\n`;
    
    // text += `Điểm mạnh:\n`;
    // (elementInfo.positive || []).forEach(point => text += `- ${point}\n`);
    // text += `\nĐiểm cần khắc phục:\n`;
    // (elementInfo.negative || []).forEach(point => text += `- ${point}\n`);
    
    // text += `\nNgành nghề phù hợp:\n`;
    // (elementInfo.careers || []).forEach(career => text += `- ${career}\n`);

    if (gender) {
      text += gender === 'male'
        ? `Là nam mệnh ${element}, bạn nên phát huy khả năng lãnh đạo và sự quyết đoán.\n\n`
        : `Là nữ mệnh ${element}, bạn nên phát triển sự tinh tế và khả năng lắng nghe.\n\n`;
    }

    if (preferences?.trim()) {
      text += `🎯 Gợi ý theo sở thích:\n- Sử dụng màu sắc hợp mệnh (${(this.colorMapping[element]?.compatible || []).join(', ')}) và màu tương sinh (${(this.colorMapping[element]?.beneficial || []).join(', ')}) để tăng tài lộc.\n- Bố trí nhà cửa hoặc bàn làm việc theo hướng tốt (${luckyDirections.join(', ')}).\n- Tận dụng số may mắn (${luckyNumbers.join(', ')}) khi chọn ngày, số điện thoại, biển số, v.v.\n\n`;
    }

    // Bổ sung tri thức nâng cao, không trùng các mục trên
    text += `🔮 KIẾN THỨC PHONG THỦY & PHÁT TRIỂN BẢN THÂN\n`;
    switch (element) {
      case 'Kim':
        text += `- Người mệnh Kim nên sử dụng các vật phẩm phong thủy bằng kim loại như vòng bạc, chuông gió kim loại để tăng cường năng lượng tích cực.\n`;
        text += `- Nên tránh các nơi ẩm thấp, tối tăm, môi trường thiếu ánh sáng.\n`;
        text += `- Khi gặp khó khăn, hãy chủ động kết nối với những người mệnh Thổ hoặc Thủy để nhận được sự hỗ trợ tốt hơn.\n`;
        text += `- Về sức khỏe: nên chú ý các bệnh về phổi, hô hấp, da liễu.\n`;
        text += `- Trong quan hệ, hợp với người mệnh Thổ, Thủy; nên kiềm chế tính cứng nhắc khi tranh luận.\n`;
        text += `- Vật hộ mệnh: vòng bạc, đá thạch anh trắng, mã não trắng.\n`;
        break;
      case 'Mộc':
        text += `- Người mệnh Mộc nên trồng cây xanh trong nhà, bàn làm việc để tăng may mắn.\n`;
        text += `- Nên tránh dùng quá nhiều đồ kim loại hoặc ở môi trường khô nóng.\n`;
        text += `- Khi gặp áp lực, hãy tìm đến thiên nhiên hoặc các hoạt động ngoài trời để cân bằng năng lượng.\n`;
        text += `- Về sức khỏe: chú ý gan, mật, hệ tiêu hóa.\n`;
        text += `- Trong quan hệ, hợp với người mệnh Thủy, Hỏa; nên học cách kiên định hơn khi ra quyết định.\n`;
        text += `- Vật hộ mệnh: vòng gỗ, đá cẩm thạch xanh, cây phong thủy nhỏ.\n`;
        break;
      case 'Thủy':
        text += `- Người mệnh Thủy nên đặt bể cá, tranh nước, hoặc sử dụng các vật phẩm hình sóng nước để tăng cường tài lộc.\n`;
        text += `- Nên tránh các vật sắc nhọn, hình tam giác, màu nóng.\n`;
        text += `- Khi cảm thấy mất cân bằng, hãy nghe nhạc nhẹ hoặc thiền bên nước để lấy lại năng lượng.\n`;
        text += `- Về sức khỏe: chú ý thận, bàng quang, hệ tiết niệu.\n`;
        text += `- Trong quan hệ, hợp với người mệnh Kim, Mộc; nên rèn luyện sự kiên định và ổn định cảm xúc.\n`;
        text += `- Vật hộ mệnh: đá aquamarine, vòng đá xanh biển, chuông gió thủy tinh.\n`;
        break;
      case 'Hỏa':
        text += `- Người mệnh Hỏa nên sử dụng nến thơm, đèn đá muối, hoặc các vật phẩm màu đỏ, cam để tăng động lực.\n`;
        text += `- Nên tránh các vật phẩm màu đen, xanh nước biển, không gian quá lạnh lẽo.\n`;
        text += `- Khi căng thẳng, hãy vận động thể thao, yoga hoặc các hoạt động sáng tạo để giải tỏa năng lượng dư thừa.\n`;
        text += `- Về sức khỏe: chú ý tim mạch, huyết áp, mắt.\n`;
        text += `- Trong quan hệ, hợp với người mệnh Mộc, Thổ; nên kiểm soát cảm xúc nóng vội khi giao tiếp.\n`;
        text += `- Vật hộ mệnh: đá ruby, thạch anh hồng, vòng tay đỏ.\n`;
        break;
      case 'Thổ':
        text += `- Người mệnh Thổ nên sử dụng các vật phẩm bằng gốm sứ, đá tự nhiên để ổn định năng lượng.\n`;
        text += `- Nên tránh dùng quá nhiều đồ gỗ hoặc cây xanh lớn trong nhà.\n`;
        text += `- Khi cảm thấy bất an, hãy thiền hoặc đi bộ ngoài trời, tiếp xúc với đất cát để tăng sự vững vàng.\n`;
        text += `- Về sức khỏe: chú ý dạ dày, tiêu hóa, xương khớp.\n`;
        text += `- Trong quan hệ, hợp với người mệnh Hỏa, Kim; nên linh hoạt hơn trong tư duy để tránh bảo thủ.\n`;
        text += `- Vật hộ mệnh: đá mắt hổ, thạch anh vàng, tượng đất nung nhỏ.\n`;
        break;
      default:
        text += `- Hãy tìm hiểu thêm về phong thủy và áp dụng các mẹo nhỏ vào đời sống để tăng cường vận khí cá nhân.\n`;
        break;
    }
    text += `\n💡 MẸO PHÁT TRIỂN BẢN THÂN\n- Đặt mục tiêu nhỏ mỗi ngày để duy trì động lực.\n- Chọn bạn đời hợp mệnh để gia tăng hòa hợp và may mắn.\n- Thường xuyên đổi mới không gian sống, làm việc để tạo cảm hứng.\n- Học cách cân bằng giữa công việc và nghỉ ngơi.\n- Đọc sách về phát triển bản thân, phong thủy để mở rộng tư duy.\n- Tận dụng các con số, màu sắc, vật phẩm phong thủy phù hợp để hỗ trợ vận khí.\n`;

    return text;
  }
}