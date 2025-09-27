import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Không bắt buộc cho Facebook users
    facebookId: { type: String, unique: true, sparse: true }, // Thêm field này
    isVerified: { type: Boolean, default: true }, // Facebook users tự động verified
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    cartData: { type: Object, default: {} }
}, { minimize: false })

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;