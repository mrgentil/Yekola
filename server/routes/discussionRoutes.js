import express from 'express';
import { authMiddleware, protectEducator } from '../middlewares/authMiddleware.js';
import {
    createDiscussion,
    getCourseDiscussions,
    getDiscussion,
    addReply,
    toggleLikeDiscussion,
    markResolved,
    togglePinDiscussion,
    deleteDiscussion,
    getInstructorQuestions
} from '../controllers/discussionController.js';

const discussionRouter = express.Router();

// Public routes
discussionRouter.get('/course/:courseId', getCourseDiscussions);
discussionRouter.get('/:discussionId', getDiscussion);

// Protected routes (requires login)
discussionRouter.post('/create', authMiddleware, createDiscussion);
discussionRouter.post('/reply/:discussionId', authMiddleware, addReply);
discussionRouter.post('/like/:discussionId', authMiddleware, toggleLikeDiscussion);
discussionRouter.delete('/:discussionId', authMiddleware, deleteDiscussion);

// Instructor routes
discussionRouter.post('/resolve/:discussionId', authMiddleware, markResolved);
discussionRouter.post('/pin/:discussionId', authMiddleware, togglePinDiscussion);
discussionRouter.get('/instructor/questions', authMiddleware, protectEducator, getInstructorQuestions);

export default discussionRouter;
