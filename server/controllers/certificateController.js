import Certificate from '../models/Certificate.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { CourseProgress } from '../models/CourseProgress.js';
import Notification from '../models/Notification.js';

// Helper: Count total lectures in a course
const countTotalLectures = (course) => {
    let total = 0;
    if (course.courseContent) {
        course.courseContent.forEach(chapter => {
            total += chapter.chapterContent?.length || 0;
        });
    }
    return total;
};

// Helper: Calculate total duration in minutes
const calculateTotalDuration = (course) => {
    let total = 0;
    if (course.courseContent) {
        course.courseContent.forEach(chapter => {
            chapter.chapterContent?.forEach(lecture => {
                total += lecture.lectureDuration || 0;
            });
        });
    }
    return total;
};

// Check if course is completed and create certificate
export const checkAndCreateCertificate = async (req, res) => {
    try {
        const userId = req.user._id;
        const { courseId } = req.body;

        // Get course data
        const course = await Course.findById(courseId).populate('educator', 'firstName lastName');
        if (!course) {
            return res.json({ success: false, message: 'Cours non trouvé' });
        }

        // Get user data
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'Utilisateur non trouvé' });
        }

        // Get progress
        const progress = await CourseProgress.findOne({ userId, courseId });
        if (!progress) {
            return res.json({ success: false, message: 'Aucune progression trouvée' });
        }

        // Count total lectures
        const totalLectures = countTotalLectures(course);
        const completedLectures = progress.lectureCompleted?.length || 0;

        // Check if course is completed
        if (completedLectures < totalLectures) {
            return res.json({ 
                success: false, 
                completed: false,
                progress: Math.round((completedLectures / totalLectures) * 100),
                message: `Progression: ${completedLectures}/${totalLectures} leçons` 
            });
        }

        // Check if certificate already exists
        let certificate = await Certificate.findOne({ userId, courseId });
        
        if (certificate) {
            return res.json({ 
                success: true, 
                completed: true,
                alreadyHasCertificate: true,
                certificate,
                message: 'Certificat déjà généré' 
            });
        }

        // Create new certificate
        const educatorName = course.educator 
            ? `${course.educator.firstName} ${course.educator.lastName}` 
            : 'Instructeur';

        certificate = await Certificate.create({
            userId,
            courseId,
            certificateNumber: Certificate.generateCertificateNumber(),
            studentName: `${user.firstName} ${user.lastName}`,
            courseTitle: course.courseTitle,
            educatorName,
            totalLectures,
            totalDuration: calculateTotalDuration(course)
        });

        // Create notification for user
        await Notification.create({
            userId,
            type: 'certificate',
            title: '🎉 Félicitations !',
            message: `Vous avez terminé le cours "${course.courseTitle}" ! Votre certificat est prêt à être téléchargé.`,
            link: `/certificate/${certificate._id}`
        });

        res.json({ 
            success: true, 
            completed: true,
            isNewCompletion: true,
            certificate,
            message: 'Félicitations ! Vous avez terminé ce cours !' 
        });

    } catch (error) {
        console.error('Check certificate error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get user's certificates
export const getUserCertificates = async (req, res) => {
    try {
        const userId = req.user._id;

        const certificates = await Certificate.find({ userId })
            .populate('courseId', 'courseThumbnail')
            .sort({ completedAt: -1 });

        res.json({ success: true, certificates });

    } catch (error) {
        console.error('Get certificates error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get single certificate
export const getCertificate = async (req, res) => {
    try {
        const { certificateId } = req.params;
        const userId = req.user._id;

        const certificate = await Certificate.findOne({ 
            _id: certificateId,
            userId 
        }).populate('courseId', 'courseThumbnail');

        if (!certificate) {
            return res.json({ success: false, message: 'Certificat non trouvé' });
        }

        res.json({ success: true, certificate });

    } catch (error) {
        console.error('Get certificate error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Verify certificate (public endpoint)
export const verifyCertificate = async (req, res) => {
    try {
        const { certificateNumber } = req.params;

        const certificate = await Certificate.findOne({ certificateNumber })
            .populate('userId', 'firstName lastName')
            .populate('courseId', 'courseTitle courseThumbnail');

        if (!certificate) {
            return res.json({ success: false, message: 'Certificat non trouvé ou invalide' });
        }

        res.json({ 
            success: true, 
            valid: true,
            certificate: {
                certificateNumber: certificate.certificateNumber,
                studentName: certificate.studentName,
                courseTitle: certificate.courseTitle,
                completedAt: certificate.completedAt,
                educatorName: certificate.educatorName
            }
        });

    } catch (error) {
        console.error('Verify certificate error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Mark certificate as downloaded
export const markCertificateDownloaded = async (req, res) => {
    try {
        const { certificateId } = req.params;
        const userId = req.user._id;

        const certificate = await Certificate.findOneAndUpdate(
            { _id: certificateId, userId },
            { downloaded: true },
            { new: true }
        );

        if (!certificate) {
            return res.json({ success: false, message: 'Certificat non trouvé' });
        }

        res.json({ success: true, certificate });

    } catch (error) {
        console.error('Mark downloaded error:', error);
        res.json({ success: false, message: error.message });
    }
};
