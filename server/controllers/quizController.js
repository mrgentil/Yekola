import { Quiz, QuizResult } from '../models/Quiz.js';
import Course from '../models/Course.js';
import { Purchase } from '../models/Purchase.js';

// Create quiz (educator only)
export const createQuiz = async (req, res) => {
    try {
        const educatorId = req.user._id;
        const { courseId, chapterIndex, title, description, questions, passingScore, timeLimit } = req.body;

        // Verify educator owns the course
        const course = await Course.findById(courseId);
        if (!course || course.educator.toString() !== educatorId.toString()) {
            return res.json({ success: false, message: 'Non autorisé' });
        }

        const quiz = await Quiz.create({
            courseId,
            chapterIndex,
            title,
            description,
            questions,
            passingScore: passingScore || 70,
            timeLimit: timeLimit || 0
        });

        res.json({ success: true, quiz, message: 'Quiz créé avec succès' });
    } catch (error) {
        console.error('Create quiz error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Update quiz
export const updateQuiz = async (req, res) => {
    try {
        const educatorId = req.user._id;
        const { quizId } = req.params;
        const updates = req.body;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.json({ success: false, message: 'Quiz non trouvé' });
        }

        // Verify educator owns the course
        const course = await Course.findById(quiz.courseId);
        if (!course || course.educator.toString() !== educatorId.toString()) {
            return res.json({ success: false, message: 'Non autorisé' });
        }

        Object.assign(quiz, updates);
        await quiz.save();

        res.json({ success: true, quiz, message: 'Quiz mis à jour' });
    } catch (error) {
        console.error('Update quiz error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Delete quiz
export const deleteQuiz = async (req, res) => {
    try {
        const educatorId = req.user._id;
        const { quizId } = req.params;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.json({ success: false, message: 'Quiz non trouvé' });
        }

        // Verify educator owns the course
        const course = await Course.findById(quiz.courseId);
        if (!course || course.educator.toString() !== educatorId.toString()) {
            return res.json({ success: false, message: 'Non autorisé' });
        }

        await Quiz.findByIdAndDelete(quizId);
        await QuizResult.deleteMany({ quizId });

        res.json({ success: true, message: 'Quiz supprimé' });
    } catch (error) {
        console.error('Delete quiz error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get quizzes for a course
export const getCourseQuizzes = async (req, res) => {
    try {
        const { courseId } = req.params;

        const quizzes = await Quiz.find({ courseId, isActive: true })
            .select('-questions.correctAnswer -questions.explanation')
            .sort({ chapterIndex: 1 });

        res.json({ success: true, quizzes });
    } catch (error) {
        console.error('Get quizzes error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get quiz for taking (without answers)
export const getQuizForStudent = async (req, res) => {
    try {
        const userId = req.user._id;
        const { quizId } = req.params;

        const quiz = await Quiz.findById(quizId);
        if (!quiz || !quiz.isActive) {
            return res.json({ success: false, message: 'Quiz non disponible' });
        }

        // Verify user is enrolled
        const purchase = await Purchase.findOne({ 
            userId, 
            courseId: quiz.courseId, 
            status: 'completed' 
        });
        if (!purchase) {
            return res.json({ success: false, message: 'Vous devez être inscrit au cours' });
        }

        // Get previous attempts
        const previousAttempts = await QuizResult.find({ userId, quizId })
            .sort({ createdAt: -1 })
            .limit(5);

        // Return quiz without correct answers
        const quizData = {
            _id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            passingScore: quiz.passingScore,
            timeLimit: quiz.timeLimit,
            questionsCount: quiz.questions.length,
            questions: quiz.questions.map((q, i) => ({
                index: i,
                question: q.question,
                options: q.options
            }))
        };

        res.json({ 
            success: true, 
            quiz: quizData,
            previousAttempts: previousAttempts.map(a => ({
                score: a.score,
                passed: a.passed,
                completedAt: a.completedAt
            }))
        });
    } catch (error) {
        console.error('Get quiz for student error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Submit quiz answers
export const submitQuiz = async (req, res) => {
    try {
        const userId = req.user._id;
        const { quizId } = req.params;
        const { answers, timeTaken } = req.body;

        const quiz = await Quiz.findById(quizId);
        if (!quiz || !quiz.isActive) {
            return res.json({ success: false, message: 'Quiz non disponible' });
        }

        // Verify user is enrolled
        const purchase = await Purchase.findOne({ 
            userId, 
            courseId: quiz.courseId, 
            status: 'completed' 
        });
        if (!purchase) {
            return res.json({ success: false, message: 'Vous devez être inscrit au cours' });
        }

        // Grade the quiz
        let correctCount = 0;
        const gradedAnswers = answers.map((answer, index) => {
            const isCorrect = quiz.questions[answer.questionIndex]?.correctAnswer === answer.selectedAnswer;
            if (isCorrect) correctCount++;
            return {
                questionIndex: answer.questionIndex,
                selectedAnswer: answer.selectedAnswer,
                isCorrect
            };
        });

        const score = Math.round((correctCount / quiz.questions.length) * 100);
        const passed = score >= quiz.passingScore;

        // Save result
        const result = await QuizResult.create({
            userId,
            quizId,
            courseId: quiz.courseId,
            answers: gradedAnswers,
            score,
            passed,
            timeTaken
        });

        // Return results with explanations
        const detailedResults = quiz.questions.map((q, i) => {
            const userAnswer = gradedAnswers.find(a => a.questionIndex === i);
            return {
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                selectedAnswer: userAnswer?.selectedAnswer,
                isCorrect: userAnswer?.isCorrect || false,
                explanation: q.explanation
            };
        });

        res.json({ 
            success: true, 
            result: {
                score,
                passed,
                correctCount,
                totalQuestions: quiz.questions.length,
                passingScore: quiz.passingScore
            },
            detailedResults
        });
    } catch (error) {
        console.error('Submit quiz error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get user's quiz results for a course
export const getUserQuizResults = async (req, res) => {
    try {
        const userId = req.user._id;
        const { courseId } = req.params;

        const results = await QuizResult.find({ userId, courseId })
            .populate('quizId', 'title chapterIndex')
            .sort({ completedAt: -1 });

        res.json({ success: true, results });
    } catch (error) {
        console.error('Get user results error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get all quizzes for educator's courses (with full data)
export const getEducatorQuizzes = async (req, res) => {
    try {
        const educatorId = req.user._id;

        const courses = await Course.find({ educator: educatorId }).select('_id courseTitle');
        const courseIds = courses.map(c => c._id);

        const quizzes = await Quiz.find({ courseId: { $in: courseIds } })
            .populate('courseId', 'courseTitle')
            .sort({ createdAt: -1 });

        // Get stats for each quiz
        const quizzesWithStats = await Promise.all(quizzes.map(async (quiz) => {
            const attempts = await QuizResult.countDocuments({ quizId: quiz._id });
            const passed = await QuizResult.countDocuments({ quizId: quiz._id, passed: true });
            const avgScore = await QuizResult.aggregate([
                { $match: { quizId: quiz._id } },
                { $group: { _id: null, avg: { $avg: '$score' } } }
            ]);

            return {
                ...quiz.toObject(),
                stats: {
                    attempts,
                    passed,
                    passRate: attempts > 0 ? Math.round((passed / attempts) * 100) : 0,
                    avgScore: avgScore[0]?.avg ? Math.round(avgScore[0].avg) : 0
                }
            };
        }));

        res.json({ success: true, quizzes: quizzesWithStats });
    } catch (error) {
        console.error('Get educator quizzes error:', error);
        res.json({ success: false, message: error.message });
    }
};
