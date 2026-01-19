import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true },
    explanation: { type: String }
});

const quizSchema = new mongoose.Schema(
    {
        courseId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Course', 
            required: true 
        },
        chapterIndex: { 
            type: Number, 
            required: true 
        },
        title: { 
            type: String, 
            required: true 
        },
        description: { type: String },
        questions: [questionSchema],
        passingScore: { 
            type: Number, 
            default: 70 
        },
        timeLimit: { 
            type: Number,
            default: 0
        },
        isActive: { 
            type: Boolean, 
            default: true 
        }
    },
    { timestamps: true }
);

const quizResultSchema = new mongoose.Schema(
    {
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        quizId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Quiz', 
            required: true 
        },
        courseId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Course', 
            required: true 
        },
        answers: [{
            questionIndex: Number,
            selectedAnswer: Number,
            isCorrect: Boolean
        }],
        score: { type: Number, required: true },
        passed: { type: Boolean, required: true },
        completedAt: { type: Date, default: Date.now },
        timeTaken: { type: Number }
    },
    { timestamps: true }
);

quizSchema.index({ courseId: 1, chapterIndex: 1 });
quizResultSchema.index({ userId: 1, quizId: 1 });

export const Quiz = mongoose.model('Quiz', quizSchema);
export const QuizResult = mongoose.model('QuizResult', quizResultSchema);
