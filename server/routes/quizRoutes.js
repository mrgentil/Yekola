import express from 'express';
import { authMiddleware, protectEducator } from '../middlewares/authMiddleware.js';
import {
    createQuiz,
    updateQuiz,
    deleteQuiz,
    getCourseQuizzes,
    getQuizForStudent,
    submitQuiz,
    getUserQuizResults,
    getEducatorQuizzes
} from '../controllers/quizController.js';

const quizRouter = express.Router();

// Public routes
quizRouter.get('/course/:courseId', getCourseQuizzes);

// Student routes (requires login)
quizRouter.get('/take/:quizId', authMiddleware, getQuizForStudent);
quizRouter.post('/submit/:quizId', authMiddleware, submitQuiz);
quizRouter.get('/results/:courseId', authMiddleware, getUserQuizResults);

// Educator routes
quizRouter.post('/create', authMiddleware, protectEducator, createQuiz);
quizRouter.put('/update/:quizId', authMiddleware, protectEducator, updateQuiz);
quizRouter.delete('/delete/:quizId', authMiddleware, protectEducator, deleteQuiz);
quizRouter.get('/educator/all', authMiddleware, protectEducator, getEducatorQuizzes);

export default quizRouter;
