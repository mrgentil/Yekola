import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
    checkAndCreateCertificate,
    getUserCertificates,
    getCertificate,
    verifyCertificate,
    markCertificateDownloaded
} from '../controllers/certificateController.js';

const certificateRouter = express.Router();

// Protected routes
certificateRouter.post('/check', authMiddleware, checkAndCreateCertificate);
certificateRouter.get('/my-certificates', authMiddleware, getUserCertificates);
certificateRouter.get('/:certificateId', authMiddleware, getCertificate);
certificateRouter.post('/downloaded/:certificateId', authMiddleware, markCertificateDownloaded);

// Public route for verification
certificateRouter.get('/verify/:certificateNumber', verifyCertificate);

export default certificateRouter;
