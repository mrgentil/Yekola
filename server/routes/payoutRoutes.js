import express from 'express';
import { authMiddleware, protectEducator } from '../middlewares/authMiddleware.js';
import { protectAdmin } from '../middlewares/adminAuth.js';
import {
    requestPayout,
    getMyPayoutRequests,
    getAllPayoutRequests,
    approvePayout,
    rejectPayout,
    markAsProcessing
} from '../controllers/payoutController.js';

const payoutRouter = express.Router();

// Educator routes
payoutRouter.post('/request', authMiddleware, protectEducator, requestPayout);
payoutRouter.get('/my-requests', authMiddleware, protectEducator, getMyPayoutRequests);

// Admin routes
payoutRouter.get('/admin/all', authMiddleware, protectAdmin, getAllPayoutRequests);
payoutRouter.post('/admin/approve/:requestId', authMiddleware, protectAdmin, approvePayout);
payoutRouter.post('/admin/reject/:requestId', authMiddleware, protectAdmin, rejectPayout);
payoutRouter.post('/admin/processing/:requestId', authMiddleware, protectAdmin, markAsProcessing);

export default payoutRouter;
