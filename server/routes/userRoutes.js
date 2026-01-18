import express from "express";
import { 
    addUserRating, 
    getUserCourseProgress, 
    getUserData, 
    getCoursePaymentInfo,
    submitPaymentRequest,
    getUserPaymentRequests,
    getPendingPaymentRequests,
    approvePaymentRequest,
    rejectPaymentRequest,
    updateUserCourseProgress, 
    userEnrolledCourses,
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    verifyUserEmail,
    getAllUsers,
    processPendingPurchases,
    manuallyEnrollUser,
    debugUserEnrollment,
    getWishlist,
    addToWishlist,
    removeFromWishlist
} from "../controllers/userController.js";
import { authMiddleware, protectEducator } from '../middlewares/authMiddleware.js';

const userRouter = express.Router();

// Public routes (no auth required)
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/all', getAllUsers);

// Protected routes (auth required)
userRouter.get('/profile', authMiddleware, getUserProfile);
userRouter.put('/profile', authMiddleware, updateUserProfile);
userRouter.post('/verify-email', authMiddleware, verifyUserEmail);
userRouter.get('/data', authMiddleware, getUserData);
userRouter.get('/enrolled-courses', authMiddleware, userEnrolledCourses);

// Mobile Money Payment routes
userRouter.get('/payment-info/:courseId', authMiddleware, getCoursePaymentInfo);
userRouter.post('/submit-payment', authMiddleware, submitPaymentRequest);
userRouter.get('/my-payment-requests', authMiddleware, getUserPaymentRequests);

// Admin payment management routes
userRouter.get('/admin/pending-payments', authMiddleware, protectEducator, getPendingPaymentRequests);
userRouter.post('/admin/approve-payment/:requestId', authMiddleware, protectEducator, approvePaymentRequest);
userRouter.post('/admin/reject-payment/:requestId', authMiddleware, protectEducator, rejectPaymentRequest);

userRouter.post('/process-pending-purchases', authMiddleware, processPendingPurchases);
userRouter.post('/update-course-progress', authMiddleware, updateUserCourseProgress);
userRouter.post('/get-course-progress', authMiddleware, getUserCourseProgress);
userRouter.post('/add-rating', authMiddleware, addUserRating);
userRouter.post('/manual-enroll', authMiddleware, manuallyEnrollUser);
userRouter.get('/debug-enrollment', authMiddleware, debugUserEnrollment);

// Wishlist routes
userRouter.get('/wishlist', authMiddleware, getWishlist);
userRouter.post('/wishlist/:courseId', authMiddleware, addToWishlist);
userRouter.delete('/wishlist/:courseId', authMiddleware, removeFromWishlist);

export default userRouter;