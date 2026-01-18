import express from 'express';
import { 
    getAllSettings, 
    getSetting, 
    updateSetting, 
    updateSettings,
    getCommissionSettings,
    getPublicSettings,
    uploadSettingsImage 
} from '../controllers/settingsController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { protectAdmin } from '../middlewares/adminAuth.js';
import upload from '../configs/multer.js';

const settingsRouter = express.Router();

// Public routes
settingsRouter.get('/public', getPublicSettings);
settingsRouter.get('/commission', getCommissionSettings);

// Admin routes
settingsRouter.get('/all', authMiddleware, protectAdmin, getAllSettings);
settingsRouter.post('/upload-image', authMiddleware, protectAdmin, upload.single('image'), uploadSettingsImage);
settingsRouter.get('/:key', authMiddleware, protectAdmin, getSetting);
settingsRouter.put('/:key', authMiddleware, protectAdmin, updateSetting);
settingsRouter.put('/', authMiddleware, protectAdmin, updateSettings);

export default settingsRouter;
