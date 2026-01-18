import User from '../models/User.js';
import Course from '../models/Course.js';
import { Purchase } from '../models/Purchase.js';

// Get all users with pagination and filters
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role, search, sort = '-createdAt' } = req.query;
        
        let query = {};
        
        // Filter by role
        if (role && role !== 'all') {
            query.role = role;
        }
        
        // Search by name or email
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        const users = await User.find(query)
            .select('-password')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();
        
        const total = await User.countDocuments(query);
        
        res.json({
            success: true,
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single user details
export const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findById(userId)
            .select('-password')
            .populate('enrolledCourses', 'courseTitle courseThumbnail')
            .populate('createdCourses', 'courseTitle courseThumbnail enrolledStudents');
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
        
        res.json({ success: true, user });
    } catch (error) {
        console.error('Get user by id error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update user role
export const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        
        if (!['student', 'educator', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Rôle invalide' });
        }
        
        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
        
        res.json({ success: true, message: 'Rôle mis à jour avec succès', user });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
        
        // Don't allow deleting yourself
        if (userId === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Vous ne pouvez pas supprimer votre propre compte' });
        }
        
        await User.findByIdAndDelete(userId);
        
        res.json({ success: true, message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all courses with pagination
export const getAllCourses = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, sort = '-createdAt' } = req.query;
        
        let query = {};
        
        if (search) {
            query.courseTitle = { $regex: search, $options: 'i' };
        }
        
        const courses = await Course.find(query)
            .populate('educator', 'firstName lastName email')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();
        
        const total = await Course.countDocuments(query);
        
        res.json({
            success: true,
            courses,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        console.error('Get all courses error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete course
export const deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        
        const course = await Course.findById(courseId);
        
        if (!course) {
            return res.status(404).json({ success: false, message: 'Cours non trouvé' });
        }
        
        await Course.findByIdAndDelete(courseId);
        
        res.json({ success: true, message: 'Cours supprimé avec succès' });
    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalEducators = await User.countDocuments({ role: 'educator' });
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        const totalCourses = await Course.countDocuments();
        
        // Get recent users (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
        
        // Get total enrollments
        const courses = await Course.find().select('enrolledStudents coursePrice discount');
        const totalEnrollments = courses.reduce((acc, course) => acc + (course.enrolledStudents?.length || 0), 0);
        
        // Calculate real revenue from purchases
        const purchases = await Purchase.find({ status: 'completed' });
        const totalRevenue = purchases.reduce((acc, p) => acc + (p.amount || 0), 0);
        const platformCommission = purchases.reduce((acc, p) => acc + (p.platformCommission || 0), 0);
        const educatorEarnings = purchases.reduce((acc, p) => acc + (p.educatorEarnings || 0), 0);
        
        // This month's revenue
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const monthlyPurchases = await Purchase.find({ 
            status: 'completed',
            createdAt: { $gte: startOfMonth }
        });
        const monthlyRevenue = monthlyPurchases.reduce((acc, p) => acc + (p.amount || 0), 0);
        const monthlyCommission = monthlyPurchases.reduce((acc, p) => acc + (p.platformCommission || 0), 0);
        
        // Get recent users
        const recentUsers = await User.find()
            .select('-password')
            .sort('-createdAt')
            .limit(5)
            .lean();
        
        // Get recent courses
        const recentCourses = await Course.find()
            .populate('educator', 'firstName lastName')
            .sort('-createdAt')
            .limit(5)
            .lean();
        
        res.json({
            success: true,
            stats: {
                totalUsers,
                totalStudents,
                totalEducators,
                totalAdmins,
                totalCourses,
                totalEnrollments,
                totalRevenue: totalRevenue.toFixed(2),
                platformCommission: platformCommission.toFixed(2),
                educatorEarnings: educatorEarnings.toFixed(2),
                monthlyRevenue: monthlyRevenue.toFixed(2),
                monthlyCommission: monthlyCommission.toFixed(2),
                newUsersThisMonth
            },
            recentUsers,
            recentCourses
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all payments/purchases
export const getAllPayments = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        
        let query = {};
        if (status && status !== 'all') {
            query.status = status;
        }
        
        const payments = await Purchase.find(query)
            .populate('userId', 'firstName lastName email')
            .populate('courseId', 'courseTitle coursePrice')
            .sort('-createdAt')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();
        
        const total = await Purchase.countDocuments(query);
        
        res.json({
            success: true,
            payments,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        console.error('Get all payments error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
