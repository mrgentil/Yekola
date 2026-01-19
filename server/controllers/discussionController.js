import Discussion from '../models/Discussion.js';
import Course from '../models/Course.js';
import { Purchase } from '../models/Purchase.js';

// Create a new discussion/question
export const createDiscussion = async (req, res) => {
    try {
        const userId = req.user._id;
        const { courseId, lectureId, title, content } = req.body;

        // Verify user is enrolled in the course
        const purchase = await Purchase.findOne({ userId, courseId, status: 'completed' });
        if (!purchase) {
            return res.json({ success: false, message: 'Vous devez être inscrit au cours pour poser une question' });
        }

        const discussion = await Discussion.create({
            courseId,
            lectureId,
            userId,
            title,
            content
        });

        await discussion.populate('userId', 'firstName lastName imageUrl');

        res.json({ success: true, discussion, message: 'Question publiée avec succès' });
    } catch (error) {
        console.error('Create discussion error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get all discussions for a course
export const getCourseDiscussions = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { lectureId, sort = 'recent', page = 1, limit = 20 } = req.query;

        const query = { courseId };
        if (lectureId) {
            query.lectureId = lectureId;
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'popular') {
            sortOption = { views: -1, createdAt: -1 };
        } else if (sort === 'unanswered') {
            query['replies.0'] = { $exists: false };
        }

        // Pinned discussions first
        const pinnedDiscussions = await Discussion.find({ ...query, isPinned: true })
            .populate('userId', 'firstName lastName imageUrl')
            .populate('replies.userId', 'firstName lastName imageUrl')
            .sort(sortOption);

        const regularDiscussions = await Discussion.find({ ...query, isPinned: false })
            .populate('userId', 'firstName lastName imageUrl')
            .populate('replies.userId', 'firstName lastName imageUrl')
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Discussion.countDocuments({ ...query, isPinned: false });

        res.json({ 
            success: true, 
            discussions: [...pinnedDiscussions, ...regularDiscussions],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get discussions error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get single discussion
export const getDiscussion = async (req, res) => {
    try {
        const { discussionId } = req.params;

        const discussion = await Discussion.findByIdAndUpdate(
            discussionId,
            { $inc: { views: 1 } },
            { new: true }
        )
            .populate('userId', 'firstName lastName imageUrl')
            .populate('replies.userId', 'firstName lastName imageUrl');

        if (!discussion) {
            return res.json({ success: false, message: 'Discussion non trouvée' });
        }

        res.json({ success: true, discussion });
    } catch (error) {
        console.error('Get discussion error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Add reply to discussion
export const addReply = async (req, res) => {
    try {
        const userId = req.user._id;
        const { discussionId } = req.params;
        const { content } = req.body;

        const discussion = await Discussion.findById(discussionId);
        if (!discussion) {
            return res.json({ success: false, message: 'Discussion non trouvée' });
        }

        // Check if user is the course instructor
        const course = await Course.findById(discussion.courseId);
        const isInstructor = course.educator.toString() === userId.toString();

        discussion.replies.push({
            userId,
            content,
            isInstructor
        });

        await discussion.save();
        await discussion.populate('replies.userId', 'firstName lastName imageUrl');

        res.json({ success: true, discussion, message: 'Réponse ajoutée' });
    } catch (error) {
        console.error('Add reply error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Like/Unlike discussion
export const toggleLikeDiscussion = async (req, res) => {
    try {
        const userId = req.user._id;
        const { discussionId } = req.params;

        const discussion = await Discussion.findById(discussionId);
        if (!discussion) {
            return res.json({ success: false, message: 'Discussion non trouvée' });
        }

        const likeIndex = discussion.likes.indexOf(userId);
        if (likeIndex > -1) {
            discussion.likes.splice(likeIndex, 1);
        } else {
            discussion.likes.push(userId);
        }

        await discussion.save();

        res.json({ success: true, likes: discussion.likes.length, liked: likeIndex === -1 });
    } catch (error) {
        console.error('Toggle like error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Mark discussion as resolved (instructor only)
export const markResolved = async (req, res) => {
    try {
        const userId = req.user._id;
        const { discussionId } = req.params;

        const discussion = await Discussion.findById(discussionId);
        if (!discussion) {
            return res.json({ success: false, message: 'Discussion non trouvée' });
        }

        // Verify user is the course instructor
        const course = await Course.findById(discussion.courseId);
        if (course.educator.toString() !== userId.toString()) {
            return res.json({ success: false, message: 'Seul l\'instructeur peut marquer comme résolu' });
        }

        discussion.isResolved = !discussion.isResolved;
        await discussion.save();

        res.json({ success: true, isResolved: discussion.isResolved });
    } catch (error) {
        console.error('Mark resolved error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Pin/Unpin discussion (instructor only)
export const togglePinDiscussion = async (req, res) => {
    try {
        const userId = req.user._id;
        const { discussionId } = req.params;

        const discussion = await Discussion.findById(discussionId);
        if (!discussion) {
            return res.json({ success: false, message: 'Discussion non trouvée' });
        }

        // Verify user is the course instructor
        const course = await Course.findById(discussion.courseId);
        if (course.educator.toString() !== userId.toString()) {
            return res.json({ success: false, message: 'Seul l\'instructeur peut épingler' });
        }

        discussion.isPinned = !discussion.isPinned;
        await discussion.save();

        res.json({ success: true, isPinned: discussion.isPinned });
    } catch (error) {
        console.error('Toggle pin error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Delete discussion (owner or instructor)
export const deleteDiscussion = async (req, res) => {
    try {
        const userId = req.user._id;
        const { discussionId } = req.params;

        const discussion = await Discussion.findById(discussionId);
        if (!discussion) {
            return res.json({ success: false, message: 'Discussion non trouvée' });
        }

        // Check if user is owner or instructor
        const course = await Course.findById(discussion.courseId);
        const isInstructor = course.educator.toString() === userId.toString();
        const isOwner = discussion.userId.toString() === userId.toString();

        if (!isInstructor && !isOwner) {
            return res.json({ success: false, message: 'Non autorisé' });
        }

        await Discussion.findByIdAndDelete(discussionId);

        res.json({ success: true, message: 'Discussion supprimée' });
    } catch (error) {
        console.error('Delete discussion error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get instructor's unanswered questions
export const getInstructorQuestions = async (req, res) => {
    try {
        const educatorId = req.user._id;

        // Get all courses by this educator
        const courses = await Course.find({ educator: educatorId }).select('_id courseTitle');
        const courseIds = courses.map(c => c._id);

        // Get unanswered discussions
        const unansweredDiscussions = await Discussion.find({
            courseId: { $in: courseIds },
            'replies.isInstructor': { $ne: true }
        })
            .populate('userId', 'firstName lastName imageUrl')
            .populate('courseId', 'courseTitle')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ success: true, discussions: unansweredDiscussions });
    } catch (error) {
        console.error('Get instructor questions error:', error);
        res.json({ success: false, message: error.message });
    }
};
