import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        role: { 
            type: String, 
            enum: ['student', 'educator', 'admin'], 
            default: 'student' 
        },
        phone: { type: String },
        isVerified: { type: Boolean, default: false },
        imageUrl: { type: String },
        enrolledCourses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course'
            }
        ],
        // Wishlist (favoris)
        wishlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course'
            }
        ],
        // For educators
        createdCourses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course'
            }
        ],
        // Educator earnings
        balance: { type: Number, default: 0 },
        totalEarnings: { type: Number, default: 0 },
        pendingPayout: { type: Number, default: 0 },
        // Profile fields
        bio: { type: String },
        location: { type: String },
        website: { type: String },
        socialLinks: {
            twitter: { type: String },
            linkedin: { type: String },
            github: { type: String }
        }
    }, 
    { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema)

export default User;