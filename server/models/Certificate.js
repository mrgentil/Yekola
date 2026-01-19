import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
    {
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        courseId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Course', 
            required: true 
        },
        certificateNumber: { 
            type: String, 
            required: true, 
            unique: true 
        },
        completedAt: { 
            type: Date, 
            default: Date.now 
        },
        studentName: { type: String, required: true },
        courseTitle: { type: String, required: true },
        educatorName: { type: String },
        totalLectures: { type: Number },
        totalDuration: { type: Number },
        downloaded: { type: Boolean, default: false }
    },
    { timestamps: true }
);

// Generate unique certificate number
certificateSchema.statics.generateCertificateNumber = function() {
    const prefix = 'CERT';
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${year}-${random}`;
};

const Certificate = mongoose.model('Certificate', certificateSchema);

export default Certificate;
