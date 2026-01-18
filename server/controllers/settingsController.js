import Settings from '../models/Settings.js';
import { v2 as cloudinary } from 'cloudinary';

// Get public settings (no auth required)
export const getPublicSettings = async (req, res) => {
    try {
        const allSettings = await Settings.getAllSettings();
        
        // Extract only public values
        const publicSettings = {
            siteName: allSettings.siteName?.value || 'LearnHub',
            siteTagline: allSettings.siteTagline?.value || '',
            siteLogo: allSettings.siteLogo?.value || '',
            siteFavicon: allSettings.siteFavicon?.value || '',
            supportEmail: allSettings.supportEmail?.value || '',
            supportPhone: allSettings.supportPhone?.value || '',
            address: allSettings.address?.value || '',
            socialFacebook: allSettings.socialFacebook?.value || '',
            socialTwitter: allSettings.socialTwitter?.value || '',
            socialLinkedin: allSettings.socialLinkedin?.value || '',
            socialYoutube: allSettings.socialYoutube?.value || '',
            socialWhatsapp: allSettings.socialWhatsapp?.value || '',
            heroSlides: allSettings.heroSlides?.value || [],
            showCompanies: allSettings.showCompanies?.value ?? true,
            showTrending: allSettings.showTrending?.value ?? true,
            showTestimonials: allSettings.showTestimonials?.value ?? true,
            footerAbout: allSettings.footerAbout?.value || '',
            copyrightText: allSettings.copyrightText?.value || '',
            mpesaNumber: allSettings.mpesaNumber?.value || '',
            orangeMoneyNumber: allSettings.orangeMoneyNumber?.value || '',
            airtelMoneyNumber: allSettings.airtelMoneyNumber?.value || '',
            currency: allSettings.currency?.value || 'USD'
        };
        
        res.json({ success: true, settings: publicSettings });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get all settings
export const getAllSettings = async (req, res) => {
    try {
        const settings = await Settings.getAllSettings();
        res.json({ success: true, settings });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get single setting
export const getSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const value = await Settings.getSetting(key);
        res.json({ success: true, key, value });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update setting
export const updateSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;
        
        const setting = await Settings.setSetting(key, value, req.user._id);
        res.json({ success: true, message: 'Paramètre mis à jour', setting });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update multiple settings
export const updateSettings = async (req, res) => {
    try {
        const { settings } = req.body;
        
        for (const [key, value] of Object.entries(settings)) {
            await Settings.setSetting(key, value, req.user._id);
        }
        
        res.json({ success: true, message: 'Paramètres mis à jour' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get commission settings (public for educators)
export const getCommissionSettings = async (req, res) => {
    try {
        const platformCommission = await Settings.getSetting('platformCommission');
        const educatorShare = await Settings.getSetting('educatorShare');
        const minPayout = await Settings.getSetting('minPayout');
        
        res.json({ 
            success: true, 
            commission: {
                platformCommission,
                educatorShare,
                minPayout
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Upload image for settings (logo, slider, etc.)
export const uploadSettingsImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.json({ success: false, message: 'Aucune image fournie' });
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'learnhub/settings',
            transformation: [
                { width: 1920, height: 1080, crop: 'limit' },
                { quality: 'auto:good' }
            ]
        });

        res.json({ 
            success: true, 
            imageUrl: result.secure_url,
            width: result.width,
            height: result.height,
            message: 'Image uploadée avec succès'
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.json({ success: false, message: error.message });
    }
};
