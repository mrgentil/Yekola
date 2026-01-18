import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: { 
        type: String, 
        enum: ['percentage', 'fixed'], 
        default: 'percentage' 
    },
    discountValue: { type: Number, required: true },
    minPurchase: { type: Number, default: 0 },
    maxDiscount: { type: Number }, // Pour les pourcentages, limite max
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },
    usageLimit: { type: Number, default: null }, // null = illimité
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    applicableCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }], // Vide = tous les cours
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
