import Course from "../models/Course.js"
import { Purchase } from "../models/Purchase.js"
import User from "../models/User.js"
import { CourseProgress } from "../models/CourseProgress.js"
import { generateToken } from '../middlewares/authMiddleware.js'
import PaymentRequest from "../models/PaymentRequest.js"
import Settings from "../models/Settings.js"
import { createNotification } from './notificationController.js'

// Register new user
export const registerUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, phone } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' })
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User already exists' })
    }

    // Create new user in database
    const newUser = new User({
      email,
      password,
      firstName: firstName || '',
      lastName: lastName || '',
      role: role || 'student',
      phone: phone || '',
      isVerified: true
    })

    await newUser.save()

    // Generate JWT token
    const token = generateToken(newUser._id)

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' })
    }

    // Find user by email
    const user = await User.findOne({ email })
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }

    // Generate JWT token
    const token = generateToken(user._id)

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

// Get user profile (authenticated user)
export const getUserProfile = async (req, res) => {
  try {
    const user = req.user
    
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        isVerified: user.isVerified
      }
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const updateData = req.body
    
    // Don't allow password update through this route
    delete updateData.password

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone
      }
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

// Verify user email
export const verifyUserEmail = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { isVerified: true },
      { new: true }
    )

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    res.json({
      success: true,
      message: 'Email verified successfully'
    })
  } catch (error) {
    console.error('Email verification error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-__v')
    
    res.json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }))
    })
  } catch (error) {
    console.error('Get all users error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get users data
export const getUserData = async(req,res)=>{
    try {
        const user = req.user
        if(!user){
            return res.json({success: false, message:"User not found!"})
        }

        res.json({success: true, user});
    } catch (error) {
        res.json({success: false, message:error.message})
    }
}

// User enrolled course with lecture link

export const userEnrolledCourses = async (req,res)=>{
    try {
        const userData = req.user

        if (!userData) {
            return res.json({success: false, message: "User not found"})
        }

        // Process any pending purchases first
        try {
            const pendingPurchases = await Purchase.find({
                userId: userData._id,
                status: 'pending'
            });

            if (pendingPurchases.length > 0) {
                const user = await User.findById(userData._id)
                for (const purchase of pendingPurchases) {
                    const courseData = await Course.findById(purchase.courseId);
                    if (courseData && !user.enrolledCourses.includes(courseData._id)) {
                        user.enrolledCourses.push(courseData._id);
                        courseData.enrolledStudents.push(user._id);
                        await courseData.save();
                    }
                    purchase.status = 'completed';
                    await purchase.save();
                }
                await user.save();
            }
        } catch (processError) {
            console.error('Error processing pending purchases:', processError);
        }

        // Also check for completed purchases that might not be reflected in enrollments
        try {
            const completedPurchases = await Purchase.find({
                userId: userData._id,
                status: 'completed'
            });

            for (const purchase of completedPurchases) {
                const courseData = await Course.findById(purchase.courseId);
                if (courseData && !userData.enrolledCourses.includes(courseData._id)) {
                    // Add course to user's enrolled courses
                    userData.enrolledCourses.push(courseData._id);
                    // Add user to course's enrolled students
                    courseData.enrolledStudents.push(userData._id);
                    
                    await courseData.save();
                }
            }
            
            await userData.save();
        } catch (processError) {
            console.error('Error processing completed purchases:', processError);
        }

        // Get updated user data
        const updatedUserData = await User.findById(userData._id)

        // Get enrolled courses manually to avoid populate issues
        const enrolledCourses = await Course.find({
            _id: { $in: updatedUserData?.enrolledCourses || [] }
        }).select('courseTitle courseDescription courseThumbnail coursePrice discount courseContent educator playlistLink')

        res.json({success: true, enrolledCourses})

    } catch (error) {
        res.json({success: false, message:error.message})
    }
}

// Manual enrollment function for testing
export const manuallyEnrollUser = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userData = await User.findById(req.user._id);
        const courseData = await Course.findById(courseId);
        
        if (!userData || !courseData) {
            return res.json({ success: false, message: "User or course not found" });
        }
        
        // Check if already enrolled
        if (userData.enrolledCourses.includes(courseData._id)) {
            return res.json({ success: false, message: "User already enrolled in this course" });
        }
        
        // Add course to user's enrolled courses
        userData.enrolledCourses.push(courseData._id);
        await userData.save();
        
        // Add user to course's enrolled students
        courseData.enrolledStudents.push(userData._id);
        await courseData.save();
        
        res.json({ success: true, message: "User enrolled successfully" });
        
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Debug function to check user enrollment status
export const debugUserEnrollment = async (req, res) => {
    try {
        const userData = req.user;
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }
        
        // Check all purchases for this user
        const allPurchases = await Purchase.find({ userId: userData._id });
        const pendingPurchases = await Purchase.find({ userId: userData._id, status: 'pending' });
        const completedPurchases = await Purchase.find({ userId: userData._id, status: 'completed' });
        
        // Get course details for enrolled courses
        const enrolledCourses = await Course.find({
            _id: { $in: userData.enrolledCourses }
        }).select('courseTitle courseDescription courseThumbnail coursePrice discount courseContent educator');
        
        const debugInfo = {
            userId: userData._id,
            userData: {
                _id: userData._id,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                enrolledCourses: userData.enrolledCourses
            },
            purchases: {
                total: allPurchases.length,
                pending: pendingPurchases.length,
                completed: completedPurchases.length,
                details: allPurchases.map(p => ({
                    _id: p._id,
                    courseId: p.courseId,
                    status: p.status,
                    amount: p.amount,
                    createdAt: p.createdAt
                }))
            },
            enrolledCourses: enrolledCourses.map(c => ({
                _id: c._id,
                courseTitle: c.courseTitle,
                coursePrice: c.coursePrice
            }))
        };
        
        res.json({ success: true, debugInfo });
        
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Process pending purchases and enroll user
export const processPendingPurchases = async (req, res) => {
    try {
        const userData = await User.findById(req.user._id);
        if (!userData) {
            return res.json({ success: false, message: 'User not found' });
        }

        const pendingPurchases = await Purchase.find({
            userId: userData._id,
            status: 'pending'
        });

        if (pendingPurchases.length === 0) {
            return res.json({ success: true, message: 'No pending purchases found' });
        }

        let processedCount = 0;

        for (const purchase of pendingPurchases) {
            try {
                const courseData = await Course.findById(purchase.courseId);
                if (!courseData) continue;

                if (userData.enrolledCourses.includes(courseData._id)) {
                    purchase.status = 'completed';
                    await purchase.save();
                    processedCount++;
                    continue;
                }

                courseData.enrolledStudents.push(userData._id);
                await courseData.save();

                userData.enrolledCourses.push(courseData._id);
                await userData.save();

                purchase.status = 'completed';
                await purchase.save();
                processedCount++;

            } catch (error) {
                console.error('Error processing purchase:', purchase._id, error);
            }
        }

        res.json({ 
            success: true, 
            message: `Processed ${processedCount} pending purchases`,
            processedCount 
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get course payment info (for Mobile Money payment page)
export const getCoursePaymentInfo = async (req, res) => {
    try {
        const { courseId } = req.params
        const userData = req.user

        const courseData = await Course.findById(courseId)
        if (!courseData) {
            return res.json({ success: false, message: "Course not found" })
        }

        const amount = (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2)

        // Payment instructions for RDC
        const paymentInfo = {
            course: {
                id: courseData._id,
                title: courseData.courseTitle,
                price: courseData.coursePrice,
                discount: courseData.discount,
                finalAmount: amount
            },
            paymentMethods: [
                {
                    id: 'mpesa',
                    name: 'M-Pesa',
                    phone: process.env.MPESA_NUMBER || '+243 XXX XXX XXX',
                    instructions: 'Envoyez le montant au numéro ci-dessus via M-Pesa'
                },
                {
                    id: 'orange_money',
                    name: 'Orange Money',
                    phone: process.env.ORANGE_MONEY_NUMBER || '+243 XXX XXX XXX',
                    instructions: 'Envoyez le montant au numéro ci-dessus via Orange Money'
                },
                {
                    id: 'airtel_money',
                    name: 'Airtel Money',
                    phone: process.env.AIRTEL_MONEY_NUMBER || '+243 XXX XXX XXX',
                    instructions: 'Envoyez le montant au numéro ci-dessus via Airtel Money'
                }
            ],
            currency: process.env.CURRENCY || 'USD'
        }

        res.json({ success: true, paymentInfo })

    } catch (error) {
        console.error('Get payment info error:', error)
        res.json({ success: false, message: error.message })
    }
}

// Submit Mobile Money payment request
export const submitPaymentRequest = async (req, res) => {
    try {
        console.log('=== SUBMIT PAYMENT REQUEST ===')
        console.log('Body:', req.body)
        
        const { courseId, paymentMethod, phoneNumber, transactionRef } = req.body
        const userData = req.user
        
        console.log('User ID:', userData?._id)

        if (!courseId || !paymentMethod || !phoneNumber || !transactionRef) {
            console.log('Missing fields!')
            return res.json({ success: false, message: "Tous les champs sont requis" })
        }

        const courseData = await Course.findById(courseId)
        if (!courseData) {
            console.log('Course not found!')
            return res.json({ success: false, message: "Cours non trouvé" })
        }

        // Check if user already enrolled
        const user = await User.findById(userData._id)
        if (user.enrolledCourses.includes(courseId)) {
            return res.json({ success: false, message: "Vous êtes déjà inscrit à ce cours" })
        }

        // Check for existing pending request
        const existingRequest = await PaymentRequest.findOne({
            userId: userData._id,
            courseId: courseId,
            status: 'pending'
        })

        if (existingRequest) {
            return res.json({ 
                success: false, 
                message: "Vous avez déjà une demande de paiement en attente pour ce cours" 
            })
        }

        const amount = (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2)

        console.log('Creating payment request with amount:', amount)

        // Create payment request
        try {
            const paymentRequest = await PaymentRequest.create({
                userId: userData._id,
                courseId: courseData._id,
                amount: parseFloat(amount),
                currency: process.env.CURRENCY || 'USD',
                paymentMethod,
                phoneNumber,
                transactionRef
            })
            
            console.log('Payment request created:', paymentRequest._id)

            // Notify all admins about new payment request
            const admins = await User.find({ role: 'admin' })
            for (const admin of admins) {
                await createNotification(
                    admin._id,
                    'payment_request',
                    'Nouvelle demande de paiement',
                    `${userData.firstName} ${userData.lastName} a soumis une demande de paiement pour "${courseData.courseTitle}"`,
                    '/admin/payments',
                    { requestId: paymentRequest._id, courseId: courseData._id }
                )
            }

            res.json({ 
                success: true, 
                message: "Demande de paiement soumise avec succès. Vous recevrez une confirmation après vérification.",
                requestId: paymentRequest._id
            })
        } catch (createError) {
            console.error('Error creating PaymentRequest:', createError)
            return res.json({ success: false, message: createError.message })
        }

    } catch (error) {
        console.error('Submit payment request error:', error)
        res.json({ success: false, message: error.message })
    }
}

// Get user's payment requests
export const getUserPaymentRequests = async (req, res) => {
    try {
        const userData = req.user

        const requests = await PaymentRequest.find({ userId: userData._id })
            .populate('courseId', 'courseTitle courseThumbnail')
            .sort({ createdAt: -1 })

        res.json({ success: true, requests })

    } catch (error) {
        console.error('Get payment requests error:', error)
        res.json({ success: false, message: error.message })
    }
}

// Admin: Get all pending payment requests
export const getPendingPaymentRequests = async (req, res) => {
    try {
        const requests = await PaymentRequest.find({ status: 'pending' })
            .populate('userId', 'firstName lastName email phone')
            .populate('courseId', 'courseTitle coursePrice')
            .sort({ createdAt: -1 })

        res.json({ success: true, requests })

    } catch (error) {
        console.error('Get pending requests error:', error)
        res.json({ success: false, message: error.message })
    }
}

// Admin: Approve payment request
export const approvePaymentRequest = async (req, res) => {
    try {
        const { requestId } = req.params
        const { adminNote } = req.body
        const adminUser = req.user

        const paymentRequest = await PaymentRequest.findById(requestId)
        if (!paymentRequest) {
            return res.json({ success: false, message: "Demande non trouvée" })
        }

        if (paymentRequest.status !== 'pending') {
            return res.json({ success: false, message: "Cette demande a déjà été traitée" })
        }

        // Get commission settings
        const platformCommission = await Settings.getSetting('platformCommission') || 20
        const educatorShare = await Settings.getSetting('educatorShare') || 80

        // Calculate earnings
        const totalAmount = paymentRequest.amount
        const platformEarnings = (totalAmount * platformCommission / 100).toFixed(2)
        const educatorEarnings = (totalAmount * educatorShare / 100).toFixed(2)

        // Update payment request
        paymentRequest.status = 'approved'
        paymentRequest.adminNote = adminNote || ''
        paymentRequest.approvedBy = adminUser._id
        paymentRequest.approvedAt = new Date()
        paymentRequest.platformCommission = parseFloat(platformEarnings)
        paymentRequest.educatorEarnings = parseFloat(educatorEarnings)
        await paymentRequest.save()

        // Enroll user in course
        const user = await User.findById(paymentRequest.userId)
        const course = await Course.findById(paymentRequest.courseId).populate('educator')

        if (user && course) {
            if (!user.enrolledCourses.includes(course._id)) {
                user.enrolledCourses.push(course._id)
                await user.save()
            }
            if (!course.enrolledStudents.includes(user._id)) {
                course.enrolledStudents.push(user._id)
                await course.save()
            }

            // Credit educator's balance
            if (course.educator) {
                const educator = await User.findById(course.educator._id || course.educator)
                if (educator) {
                    educator.balance = (educator.balance || 0) + parseFloat(educatorEarnings)
                    educator.totalEarnings = (educator.totalEarnings || 0) + parseFloat(educatorEarnings)
                    await educator.save()
                }
            }
        }

        // Create purchase record with commission info
        await Purchase.create({
            courseId: paymentRequest.courseId,
            userId: paymentRequest.userId,
            amount: paymentRequest.amount,
            platformCommission: parseFloat(platformEarnings),
            educatorEarnings: parseFloat(educatorEarnings),
            status: 'completed'
        })

        // Notify student that payment was approved
        await createNotification(
            paymentRequest.userId,
            'payment_approved',
            'Paiement approuvé !',
            `Votre paiement pour "${course.courseTitle}" a été approuvé. Vous pouvez maintenant accéder au cours.`,
            `/player/${course._id}`,
            { courseId: course._id }
        )

        // Notify educator about new enrollment and earnings
        if (course.educator) {
            const educatorId = course.educator._id || course.educator
            await createNotification(
                educatorId,
                'new_enrollment',
                'Nouvelle inscription !',
                `${user.firstName} ${user.lastName} s'est inscrit à "${course.courseTitle}". Vous avez gagné ${educatorEarnings} ${process.env.CURRENCY || 'USD'}.`,
                '/educator/earnings',
                { courseId: course._id, earnings: educatorEarnings }
            )
        }

        res.json({ 
            success: true, 
            message: "Paiement approuvé et utilisateur inscrit au cours",
            earnings: {
                total: totalAmount,
                platform: platformEarnings,
                educator: educatorEarnings
            }
        })

    } catch (error) {
        console.error('Approve payment error:', error)
        res.json({ success: false, message: error.message })
    }
}

// Admin: Reject payment request
export const rejectPaymentRequest = async (req, res) => {
    try {
        const { requestId } = req.params
        const { adminNote } = req.body
        const adminUser = req.user

        const paymentRequest = await PaymentRequest.findById(requestId)
        if (!paymentRequest) {
            return res.json({ success: false, message: "Demande non trouvée" })
        }

        if (paymentRequest.status !== 'pending') {
            return res.json({ success: false, message: "Cette demande a déjà été traitée" })
        }

        paymentRequest.status = 'rejected'
        paymentRequest.adminNote = adminNote || 'Paiement non vérifié'
        paymentRequest.approvedBy = adminUser._id
        paymentRequest.approvedAt = new Date()
        await paymentRequest.save()

        // Notify student that payment was rejected
        const course = await Course.findById(paymentRequest.courseId)
        await createNotification(
            paymentRequest.userId,
            'payment_rejected',
            'Paiement rejeté',
            `Votre demande de paiement pour "${course?.courseTitle || 'ce cours'}" a été rejetée. Raison: ${adminNote || 'Paiement non vérifié'}`,
            '/my-enrollments',
            { courseId: paymentRequest.courseId }
        )

        res.json({ 
            success: true, 
            message: "Demande de paiement rejetée" 
        })

    } catch (error) {
        console.error('Reject payment error:', error)
        res.json({ success: false, message: error.message })
    }
}

// Update user Course progress

export const updateUserCourseProgress = async(req,res)=>{
    try {
        const user = req.user
        const {courseId, lectureId} = req.body
        
        if (!user) {
            return res.json({success: false, message: "User not found"})
        }
        
        const progressData = await CourseProgress.findOne({userId: user._id, courseId})

        if(progressData){
            if(progressData.lectureCompleted.includes(lectureId)){
                return res.json({success: true, message: "Lecture Already Completed"})
            }
            
            progressData.lectureCompleted.push(lectureId)
            progressData.completed = true
            await progressData.save()
        }
        else{
            await CourseProgress.create({
                userId: user._id,
                courseId,
                lectureCompleted: [lectureId]

            })
        }
        res.json({success:true, message: 'Progress Updated'})
    } catch (error) {
        res.json({success: false, message:error.message})
    }
}

// get user course progress

export const getUserCourseProgress = async(req,res)=>{
    try {
        const user = req.user
        const {courseId} = req.body
        
        if (!user) {
            return res.json({success: false, message: "User not found"})
        }
        
        const progressData = await CourseProgress.findOne({userId: user._id, courseId})
        res.json({success: true, progressData: progressData || '0%'})
    } catch (error) {
        res.json({success: false, message:error.message})
    }
}


// Add user ratings to course

export const addUserRating = async (req,res)=>{
    try {
        const user = req.user
        const {courseId, rating} = req.body
        
        if (!user) {
            return res.json({success: false, message: "User not found"})
        }
        

        

        if(!courseId || !user._id || !rating || rating < 1 || rating > 5)
        {
            res.json({success: false, message:"Invalid details"})
        }

        const course = await Course.findById(courseId)
        if(!course){
            return res.json({success: false, message:"Course Not found!"})
        }

        if(!user.enrolledCourses.includes(courseId)){
            return res.json({success: false, message:"User has not purchased this course."})
        }

        const existingRatingIndex = course.courseRatings.findIndex(r => r.userId.toString() === user._id.toString())
        if(existingRatingIndex > -1){
            course.courseRatings[existingRatingIndex].rating = rating;
        }
        else{
            course.courseRatings.push({userId: user._id, rating});
        }

        // await courseData.save()
        await course.save()
        res.json({success: true, message:"Rating Added"})

    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

// ============ WISHLIST FUNCTIONS ============

// Get user wishlist
export const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist')
        res.json({ success: true, wishlist: user.wishlist || [] })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Add course to wishlist
export const addToWishlist = async (req, res) => {
    try {
        const { courseId } = req.params
        const user = await User.findById(req.user._id)

        if (user.wishlist.includes(courseId)) {
            return res.json({ success: false, message: 'Cours déjà dans les favoris' })
        }

        user.wishlist.push(courseId)
        await user.save()

        res.json({ success: true, message: 'Ajouté aux favoris' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Remove course from wishlist
export const removeFromWishlist = async (req, res) => {
    try {
        const { courseId } = req.params
        const user = await User.findById(req.user._id)

        user.wishlist = user.wishlist.filter(id => id.toString() !== courseId)
        await user.save()

        res.json({ success: true, message: 'Retiré des favoris' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}