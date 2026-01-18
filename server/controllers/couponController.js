import Coupon from '../models/Coupon.js';
import Course from '../models/Course.js';

// Validate coupon code
export const validateCoupon = async (req, res) => {
    try {
        const { code, courseId } = req.body;

        const coupon = await Coupon.findOne({ 
            code: code.toUpperCase(),
            isActive: true 
        });

        if (!coupon) {
            return res.json({ success: false, message: 'Code promo invalide' });
        }

        // Check validity dates
        const now = new Date();
        if (now < coupon.validFrom || now > coupon.validUntil) {
            return res.json({ success: false, message: 'Ce code promo a expiré' });
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.json({ success: false, message: 'Ce code promo a atteint sa limite d\'utilisation' });
        }

        // Check if coupon is applicable to this course
        if (coupon.applicableCourses.length > 0 && !coupon.applicableCourses.includes(courseId)) {
            return res.json({ success: false, message: 'Ce code promo n\'est pas valide pour ce cours' });
        }

        // Get course price
        const course = await Course.findById(courseId);
        if (!course) {
            return res.json({ success: false, message: 'Cours non trouvé' });
        }

        const originalPrice = course.coursePrice - (course.coursePrice * (course.discount || 0) / 100);

        // Check minimum purchase
        if (originalPrice < coupon.minPurchase) {
            return res.json({ 
                success: false, 
                message: `Achat minimum de ${coupon.minPurchase}$ requis pour ce code` 
            });
        }

        // Calculate discount
        let discountAmount;
        if (coupon.discountType === 'percentage') {
            discountAmount = originalPrice * (coupon.discountValue / 100);
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount;
            }
        } else {
            discountAmount = coupon.discountValue;
        }

        const finalPrice = Math.max(0, originalPrice - discountAmount);

        res.json({
            success: true,
            coupon: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                discountAmount: discountAmount.toFixed(2),
                originalPrice: originalPrice.toFixed(2),
                finalPrice: finalPrice.toFixed(2)
            }
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Apply coupon (increment usage count)
export const applyCoupon = async (req, res) => {
    try {
        const { code } = req.body;

        const coupon = await Coupon.findOneAndUpdate(
            { code: code.toUpperCase(), isActive: true },
            { $inc: { usedCount: 1 } },
            { new: true }
        );

        if (!coupon) {
            return res.json({ success: false, message: 'Code promo invalide' });
        }

        res.json({ success: true, message: 'Code promo appliqué' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ============ ADMIN FUNCTIONS ============

// Get all coupons (Admin)
export const getAllCoupons = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        
        let query = {};
        if (status === 'active') query.isActive = true;
        if (status === 'inactive') query.isActive = false;
        if (status === 'expired') query.validUntil = { $lt: new Date() };

        const coupons = await Coupon.find(query)
            .populate('applicableCourses', 'courseTitle')
            .populate('createdBy', 'firstName lastName')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Coupon.countDocuments(query);

        res.json({
            success: true,
            coupons,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Create coupon (Admin)
export const createCoupon = async (req, res) => {
    try {
        const {
            code,
            discountType,
            discountValue,
            minPurchase,
            maxDiscount,
            validFrom,
            validUntil,
            usageLimit,
            applicableCourses
        } = req.body;

        // Check if code already exists
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.json({ success: false, message: 'Ce code promo existe déjà' });
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            discountType,
            discountValue,
            minPurchase: minPurchase || 0,
            maxDiscount,
            validFrom: validFrom || new Date(),
            validUntil,
            usageLimit,
            applicableCourses: applicableCourses || [],
            createdBy: req.user._id
        });

        res.json({ success: true, message: 'Code promo créé', coupon });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update coupon (Admin)
export const updateCoupon = async (req, res) => {
    try {
        const { couponId } = req.params;
        const updateData = req.body;

        if (updateData.code) {
            updateData.code = updateData.code.toUpperCase();
        }

        const coupon = await Coupon.findByIdAndUpdate(couponId, updateData, { new: true });

        if (!coupon) {
            return res.json({ success: false, message: 'Code promo non trouvé' });
        }

        res.json({ success: true, message: 'Code promo mis à jour', coupon });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete coupon (Admin)
export const deleteCoupon = async (req, res) => {
    try {
        const { couponId } = req.params;

        await Coupon.findByIdAndDelete(couponId);

        res.json({ success: true, message: 'Code promo supprimé' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Toggle coupon status (Admin)
export const toggleCouponStatus = async (req, res) => {
    try {
        const { couponId } = req.params;

        const coupon = await Coupon.findById(couponId);
        if (!coupon) {
            return res.json({ success: false, message: 'Code promo non trouvé' });
        }

        coupon.isActive = !coupon.isActive;
        await coupon.save();

        res.json({ 
            success: true, 
            message: coupon.isActive ? 'Code promo activé' : 'Code promo désactivé',
            isActive: coupon.isActive
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
