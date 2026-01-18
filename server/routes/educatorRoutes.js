import express from 'express'

import { addCourse, educatorDashboardData, getEducatorCourses, getEnrolledStudentsData, updateRoleToEducator, deleteCourse, getEducatorEarnings } from '../controllers/educatorController.js'
import { authMiddleware, protectEducator } from '../middlewares/authMiddleware.js';
import upload from '../configs/multer.js';

const educatorRouter = express.Router()

// add educator role
educatorRouter.get('/update-role', authMiddleware, updateRoleToEducator);
educatorRouter.post('/add-course', authMiddleware, upload.single('image'), protectEducator, addCourse);
educatorRouter.get('/courses', authMiddleware, protectEducator, getEducatorCourses);
educatorRouter.get('/dashboard', authMiddleware, protectEducator, educatorDashboardData);
educatorRouter.get('/enrolled-students', authMiddleware, protectEducator, getEnrolledStudentsData);
educatorRouter.delete('/course/:courseId', authMiddleware, protectEducator, deleteCourse);
educatorRouter.get('/earnings', authMiddleware, protectEducator, getEducatorEarnings);

export default educatorRouter;