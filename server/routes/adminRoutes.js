import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { protectAdmin } from '../middlewares/adminAuth.js';
import {
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
    getAllCourses,
    deleteCourse,
    getDashboardStats,
    getAllPayments
} from '../controllers/adminController.js';

const router = express.Router();

// All routes require authentication + admin role
router.use(authMiddleware);
router.use(protectAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Users management
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserById);
router.put('/users/:userId/role', updateUserRole);
router.delete('/users/:userId', deleteUser);

// Courses management
router.get('/courses', getAllCourses);
router.delete('/courses/:courseId', deleteCourse);

// Payments
router.get('/payments', getAllPayments);

export default router;
