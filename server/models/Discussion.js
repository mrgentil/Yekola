import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    content: { 
        type: String, 
        required: true 
    },
    isInstructor: { 
        type: Boolean, 
        default: false 
    },
    likes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }]
}, { timestamps: true });

const discussionSchema = new mongoose.Schema(
    {
        courseId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Course', 
            required: true 
        },
        lectureId: { 
            type: String 
        },
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        title: { 
            type: String, 
            required: true 
        },
        content: { 
            type: String, 
            required: true 
        },
        replies: [replySchema],
        likes: [{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        }],
        isResolved: { 
            type: Boolean, 
            default: false 
        },
        isPinned: { 
            type: Boolean, 
            default: false 
        },
        views: { 
            type: Number, 
            default: 0 
        }
    },
    { timestamps: true }
);

discussionSchema.index({ courseId: 1, createdAt: -1 });
discussionSchema.index({ courseId: 1, lectureId: 1 });

const Discussion = mongoose.model('Discussion', discussionSchema);

export default Discussion;
