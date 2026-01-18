import express from 'express';
import { 
    validateCoupon, 
    applyCoupon, 
    getAllCoupons, 
    createCoupon, 
    updateCoupon, 
    deleteCoupon,
    toggleCouponStatus 
} from '../controllers/couponController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { protectAdmin } from '../middlewares/adminAuth.js';

const couponRouter = express.Router();

// Public routes
couponRouter.post('/validate', validateCoupon);

// Protected routes
couponRouter.post('/apply', authMiddleware, applyCoupon);

// Admin routes
couponRouter.get('/all', authMiddleware, protectAdmin, getAllCoupons);
couponRouter.post('/create', authMiddleware, protectAdmin, createCoupon);
couponRouter.put('/:couponId', authMiddleware, protectAdmin, updateCoupon);
couponRouter.delete('/:couponId', authMiddleware, protectAdmin, deleteCoupon);
couponRouter.patch('/:couponId/toggle', authMiddleware, protectAdmin, toggleCouponStatus);

export default couponRouter;
