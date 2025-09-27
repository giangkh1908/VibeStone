import FengShuiRule from "../models/FengShuiRule.js";

// Thêm một quy tắc mới
const addRule = async (req, res) => {
    try {
        const newRule = new FengShuiRule(req.body);
        await newRule.save();
        res.json({ success: true, message: "Quy tắc đã được thêm thành công." });
    } catch (error) {
        console.error("Error adding rule:", error);
        res.status(500).json({ success: false, message: "Lỗi khi thêm quy tắc." });
    }
};

// Lấy danh sách tất cả các quy tắc
const listRules = async (req, res) => {
    try {
        const rules = await FengShuiRule.find({});
        res.json({ success: true, data: rules });
    } catch (error) {
        console.error("Error listing rules:", error);
        res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách quy tắc." });
    }
};

// Cập nhật một quy tắc
const updateRule = async (req, res) => {
    try {
        const rule = await FengShuiRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!rule) {
            return res.status(404).json({ success: false, message: "Không tìm thấy quy tắc." });
        }
        res.json({ success: true, message: "Quy tắc đã được cập nhật.", data: rule });
    } catch (error) {
        console.error("Error updating rule:", error);
        res.status(500).json({ success: false, message: "Lỗi khi cập nhật quy tắc." });
    }
};

// Xóa một quy tắc
const removeRule = async (req, res) => {
    try {
        const rule = await FengShuiRule.findByIdAndDelete(req.params.id);
        if (!rule) {
            return res.status(404).json({ success: false, message: "Không tìm thấy quy tắc." });
        }
        res.json({ success: true, message: "Quy tắc đã được xóa." });
    } catch (error) {
        console.error("Error removing rule:", error);
        res.status(500).json({ success: false, message: "Lỗi khi xóa quy tắc." });
    }
};

export { addRule, listRules, updateRule, removeRule };
