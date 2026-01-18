import User from '../models/User.js';

export const protectAdmin = async (req, res, next) => {
    try {
        // req.user is set by authMiddleware
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Non autorisé' });
        }

        const user = await User.findById(req.user._id);
        
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Accès refusé. Droits administrateur requis.' });
        }

        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
