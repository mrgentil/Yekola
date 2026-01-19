import PayoutRequest from '../models/PayoutRequest.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';

// Educator: Request a payout
export const requestPayout = async (req, res) => {
    try {
        const educatorId = req.user._id;
        const { amount, paymentMethod, mobileMoneyProvider, phoneNumber, bankName, accountNumber, accountName, paypalEmail } = req.body;

        // Get educator
        const educator = await User.findById(educatorId);
        if (!educator) {
            return res.json({ success: false, message: 'Éducateur non trouvé' });
        }

        // Check if educator has enough balance
        if (educator.balance < amount) {
            return res.json({ success: false, message: 'Solde insuffisant' });
        }

        // Get minimum payout setting
        const minPayout = await Settings.getSetting('minPayout') || 50;
        if (amount < minPayout) {
            return res.json({ success: false, message: `Le montant minimum de retrait est de ${minPayout}` });
        }

        // Check for pending payout requests
        const pendingRequest = await PayoutRequest.findOne({
            educatorId,
            status: { $in: ['pending', 'processing'] }
        });

        if (pendingRequest) {
            return res.json({ success: false, message: 'Vous avez déjà une demande de retrait en cours' });
        }

        // Validate payment method details
        if (paymentMethod === 'mobile_money') {
            if (!mobileMoneyProvider || !phoneNumber) {
                return res.json({ success: false, message: 'Veuillez fournir le fournisseur et le numéro de téléphone' });
            }
        } else if (paymentMethod === 'bank_transfer') {
            if (!bankName || !accountNumber || !accountName) {
                return res.json({ success: false, message: 'Veuillez fournir les détails bancaires complets' });
            }
        } else if (paymentMethod === 'paypal') {
            if (!paypalEmail) {
                return res.json({ success: false, message: 'Veuillez fournir votre email PayPal' });
            }
        }

        // Create payout request
        const payoutRequest = new PayoutRequest({
            educatorId,
            amount,
            paymentMethod,
            mobileMoneyProvider,
            phoneNumber,
            bankName,
            accountNumber,
            accountName,
            paypalEmail
        });

        await payoutRequest.save();

        // Update educator's pending payout
        educator.pendingPayout = (educator.pendingPayout || 0) + amount;
        educator.balance = educator.balance - amount;
        await educator.save();

        res.json({ 
            success: true, 
            message: 'Demande de retrait soumise avec succès',
            request: payoutRequest
        });

    } catch (error) {
        console.error('Request payout error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Educator: Get my payout requests
export const getMyPayoutRequests = async (req, res) => {
    try {
        const educatorId = req.user._id;

        const requests = await PayoutRequest.find({ educatorId })
            .sort({ createdAt: -1 });

        res.json({ success: true, requests });

    } catch (error) {
        console.error('Get payout requests error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Admin: Get all payout requests
export const getAllPayoutRequests = async (req, res) => {
    try {
        const { status } = req.query;
        
        const filter = {};
        if (status && status !== 'all') {
            filter.status = status;
        }

        const requests = await PayoutRequest.find(filter)
            .populate('educatorId', 'firstName lastName email phone imageUrl')
            .sort({ createdAt: -1 });

        // Get stats
        const stats = {
            pending: await PayoutRequest.countDocuments({ status: 'pending' }),
            processing: await PayoutRequest.countDocuments({ status: 'processing' }),
            completed: await PayoutRequest.countDocuments({ status: 'completed' }),
            rejected: await PayoutRequest.countDocuments({ status: 'rejected' }),
            totalPending: await PayoutRequest.aggregate([
                { $match: { status: 'pending' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]).then(r => r[0]?.total || 0)
        };

        res.json({ success: true, requests, stats });

    } catch (error) {
        console.error('Get all payout requests error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Admin: Process payout request (approve)
export const approvePayout = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { transactionReference, adminNote } = req.body;
        const adminId = req.user._id;

        const payoutRequest = await PayoutRequest.findById(requestId);
        if (!payoutRequest) {
            return res.json({ success: false, message: 'Demande non trouvée' });
        }

        if (payoutRequest.status !== 'pending' && payoutRequest.status !== 'processing') {
            return res.json({ success: false, message: 'Cette demande a déjà été traitée' });
        }

        // Update payout request
        payoutRequest.status = 'completed';
        payoutRequest.transactionReference = transactionReference;
        payoutRequest.adminNote = adminNote;
        payoutRequest.processedBy = adminId;
        payoutRequest.processedAt = new Date();
        await payoutRequest.save();

        // Update educator's pending payout
        const educator = await User.findById(payoutRequest.educatorId);
        if (educator) {
            educator.pendingPayout = Math.max(0, (educator.pendingPayout || 0) - payoutRequest.amount);
            await educator.save();
        }

        res.json({ 
            success: true, 
            message: 'Paiement approuvé avec succès',
            request: payoutRequest
        });

    } catch (error) {
        console.error('Approve payout error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Admin: Reject payout request
export const rejectPayout = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { adminNote } = req.body;
        const adminId = req.user._id;

        const payoutRequest = await PayoutRequest.findById(requestId);
        if (!payoutRequest) {
            return res.json({ success: false, message: 'Demande non trouvée' });
        }

        if (payoutRequest.status !== 'pending' && payoutRequest.status !== 'processing') {
            return res.json({ success: false, message: 'Cette demande a déjà été traitée' });
        }

        // Refund the balance to educator
        const educator = await User.findById(payoutRequest.educatorId);
        if (educator) {
            educator.balance = (educator.balance || 0) + payoutRequest.amount;
            educator.pendingPayout = Math.max(0, (educator.pendingPayout || 0) - payoutRequest.amount);
            await educator.save();
        }

        // Update payout request
        payoutRequest.status = 'rejected';
        payoutRequest.adminNote = adminNote || 'Demande rejetée';
        payoutRequest.processedBy = adminId;
        payoutRequest.processedAt = new Date();
        await payoutRequest.save();

        res.json({ 
            success: true, 
            message: 'Demande rejetée, le solde a été restauré',
            request: payoutRequest
        });

    } catch (error) {
        console.error('Reject payout error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Admin: Mark as processing
export const markAsProcessing = async (req, res) => {
    try {
        const { requestId } = req.params;
        const adminId = req.user._id;

        const payoutRequest = await PayoutRequest.findById(requestId);
        if (!payoutRequest) {
            return res.json({ success: false, message: 'Demande non trouvée' });
        }

        if (payoutRequest.status !== 'pending') {
            return res.json({ success: false, message: 'Cette demande ne peut pas être mise en traitement' });
        }

        payoutRequest.status = 'processing';
        payoutRequest.processedBy = adminId;
        await payoutRequest.save();

        res.json({ 
            success: true, 
            message: 'Demande marquée en traitement',
            request: payoutRequest
        });

    } catch (error) {
        console.error('Mark as processing error:', error);
        res.json({ success: false, message: error.message });
    }
};
