import Course from '../models/Course.js'
import {v2 as cloudinary} from 'cloudinary'
import { Purchase } from '../models/Purchase.js'
import User from '../models/User.js'
import Settings from '../models/Settings.js'


// Update role to educator
export const updateRoleToEducator = async (req,res)=>{
    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { role: 'educator' },
            { new: true }
        )

        if (!user) {
            return res.json({success: false, message: 'User not found'})
        }

        res.json({success: true, message: 'You can publish a course now'})

    } catch (error) {
        res.json({success: false, message:error.message})
    }
}

//  Add new course 
// export const addCourse = async(req,res) =>{
//     try {
//         const {courseData} = req.body;
//         const imageFile = req.file;
//         const educatorId = req.user._id
//         console.log(educatoreId);
//         if(!imageFile){
//             return res.json({success: false, message:"Thumbnail Not Attached"})
//         }

//         const parsedCourseData = await JSON.parse(courseData)
//         parsedCourseData.educator = educatorId
//         const imageUpload = await cloudinary.uploader.upload(imageFile.path)
//         newCourse.courseThumbnail = imageUpload.secure_url
//         const newCourse = await Course.create(parsedCourseData)
//         await newCourse.save()
//         res.json({success: true, message: "Course Added"})



//     } catch (error) {
//         res.json({success: false, message:error.message})
//     }
// }

export const addCourse = async (req, res) => {
    try {
        const { courseData } = req.body;
        const imageFile = req.file;
        const educatorId = req.user._id



        if (!imageFile) {
            return res.json({ success: false, message: "Thumbnail Not Attached" });
        }

        const parsedCourseData = JSON.parse(courseData);
        parsedCourseData.educator = educatorId;

        // Ensure 'isPublished' defaults to true
        // parsedCourseData.isPublished = parsedCourseData.isPublished ?? true;

        // Ensure all lectures have required fields
        // if (!parsedCourseData.courseContent?.every(chapter => 
        //     chapter.chapterContent?.every(lecture => lecture.lectureId && lecture.lectureurl)
        // )) {
        //     return res.json({ success: false, message: "Lecture ID and URL are required in all chapters." });
        // }

        // Upload image first
        const imageUpload = await cloudinary.uploader.upload(imageFile.path);
        parsedCourseData.courseThumbnail = imageUpload.secure_url;

        // Create course after ensuring image is uploaded
        const newCourse = await Course.create(parsedCourseData);
        await newCourse.save()

        res.json({ success: true, message: "Course Added", course: newCourse });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};



// Get educator courses

export const getEducatorCourses = async(req,res) => {
    try {
        const educator = req.user._id
        const courses = await Course.find({educator})

        res.json({success: true, courses})
        
    } catch (error) {
        res.json({success: false, message:error.message})
    }
}

// get educator dashboard data (total earnings, enrolled students, No. of courses)

export const educatorDashboardData = async(req,res) =>{
    try {
        const educator = req.user._id

        const courses = await Course.find({educator});
        const totalCourses = courses.length;

        const courseIds = courses.map(course => course._id)
        // calculate total earnings from purchases
        const purchases = await Purchase.find({
            courseId: {$in: courseIds},
            status: 'completed'
        });

        const totalEarnings = Math.round(purchases.reduce((sum, purchase) => sum + purchase.amount, 0) * 100) / 100;
        
        // collect unique enrolled students ids with their course title
        const enrolledStudentsData = [];
        const uniqueStudentIds = new Set();

        for(const course of courses){
            const students = await User.find({
                _id: {$in: course.enrolledStudents}
            }, 'firstName lastName imageUrl')

            students.forEach(student => {
                uniqueStudentIds.add(student._id.toString());
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                });
            });
        }

        const totalEnrollments = uniqueStudentIds.size;

        res.json({success: true, dashboardData: {
            totalEarnings: totalEarnings.toFixed(2),
            enrolledStudentsData, 
            totalCourses,
            totalEnrollments
        }})
    } catch (error) {
        res.json({success: false, message:error.message})    
    }
}




// Get Enrolled Students Data with purchase data

export const getEnrolledStudentsData = async(req,res) =>{
    try {
        const educator = req.user._id;
        const courses = await Course.find({educator})
        const courseIds = courses.map(course => course._id)

        const purchases = await Purchase.find({
            courseId: {$in: courseIds},
            status: 'completed'
        }).populate('courseId', 'courseTitle')

        // Get user details for each purchase
        const enrolledStudents = await Promise.all(
            purchases.map(async (purchase) => {
                const user = await User.findById(purchase.userId).select('firstName lastName imageUrl')
                return {
                    student: user || { firstName: 'Unknown', lastName: 'User', imageUrl: '' },
                    courseTitle: purchase.courseId.courseTitle,
                    purchaseDate: purchase.createdAt
                }
            })
        )

        res.json({success: true, enrolledStudents});

    } catch (error) {
        res.json({success: false, message:error.message})
    }
}

// Delete educator's own course
export const deleteCourse = async(req, res) => {
    try {
        const educator = req.user._id;
        const { courseId } = req.params;

        // Find the course and verify ownership
        const course = await Course.findById(courseId);
        
        if (!course) {
            return res.json({ success: false, message: 'Cours non trouvé' });
        }

        // Check if the educator owns this course
        if (course.educator.toString() !== educator.toString()) {
            return res.json({ success: false, message: 'Vous ne pouvez supprimer que vos propres cours' });
        }

        await Course.findByIdAndDelete(courseId);

        res.json({ success: true, message: 'Cours supprimé avec succès' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get educator earnings with commission details
export const getEducatorEarnings = async(req, res) => {
    try {
        const educatorId = req.user._id;
        const educator = await User.findById(educatorId);
        
        // Get commission settings
        const platformCommission = await Settings.getSetting('platformCommission') || 20;
        const educatorShare = await Settings.getSetting('educatorShare') || 80;
        const minPayout = await Settings.getSetting('minPayout') || 50;

        // Get educator's courses
        const courses = await Course.find({ educator: educatorId });
        const courseIds = courses.map(c => c._id);

        // Get all completed purchases for educator's courses
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        }).populate('courseId', 'courseTitle').sort({ createdAt: -1 });

        // Calculate totals
        const totalSales = purchases.reduce((sum, p) => sum + p.amount, 0);
        const totalEducatorEarnings = purchases.reduce((sum, p) => sum + (p.educatorEarnings || p.amount * educatorShare / 100), 0);
        const totalPlatformCommission = purchases.reduce((sum, p) => sum + (p.platformCommission || p.amount * platformCommission / 100), 0);

        res.json({
            success: true,
            earnings: {
                balance: educator.balance || 0,
                totalEarnings: educator.totalEarnings || totalEducatorEarnings,
                pendingPayout: educator.pendingPayout || 0,
                totalSales,
                totalPlatformCommission,
                commissionRate: platformCommission,
                educatorShareRate: educatorShare,
                minPayout,
                canRequestPayout: (educator.balance || 0) >= minPayout,
                recentTransactions: purchases.slice(0, 10).map(p => ({
                    id: p._id,
                    courseTitle: p.courseId?.courseTitle || 'Cours supprimé',
                    amount: p.amount,
                    educatorEarnings: p.educatorEarnings || (p.amount * educatorShare / 100),
                    date: p.createdAt
                }))
            }
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}