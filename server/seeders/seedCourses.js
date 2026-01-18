import mongoose from "mongoose";
import dotenv from "dotenv";
import Course from "../models/Course.js";
import User from "../models/User.js";

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
    const uri = process.env.MONGODB_URI.replace('localhost', '127.0.0.1');
    await mongoose.connect(`${uri}/Edemy`);
    console.log('Database connected for seeding...');
};

// Sample courses data
const coursesData = [
    {
        courseTitle: "Développement Web Complet avec React & Node.js",
        courseDescription: "<p>Apprenez à créer des applications web modernes de A à Z avec React pour le frontend et Node.js pour le backend.</p><ul><li>React Hooks et Context API</li><li>Node.js et Express</li><li>MongoDB et Mongoose</li><li>Authentification JWT</li><li>Déploiement sur le cloud</li></ul>",
        courseThumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
        coursePrice: 49.99,
        discount: 20,
        isPublished: true,
        courseContent: [
            {
                chapterId: "ch1",
                chapterOrder: 1,
                chapterTitle: "Introduction au Développement Web",
                chapterContent: [
                    {
                        lectureId: "lec1",
                        lectureTitle: "Bienvenue dans le cours",
                        lectureDuration: 5,
                        lectureUrl: "https://youtu.be/dQw4w9WgXcQ",
                        isPreviewFree: true,
                        lectureOrder: 1
                    },
                    {
                        lectureId: "lec2",
                        lectureTitle: "Installation des outils",
                        lectureDuration: 15,
                        lectureUrl: "https://youtu.be/dQw4w9WgXcQ",
                        isPreviewFree: true,
                        lectureOrder: 2
                    }
                ]
            },
            {
                chapterId: "ch2",
                chapterOrder: 2,
                chapterTitle: "Les bases de React",
                chapterContent: [
                    {
                        lectureId: "lec3",
                        lectureTitle: "Créer votre première application React",
                        lectureDuration: 20,
                        lectureUrl: "https://youtu.be/dQw4w9WgXcQ",
                        isPreviewFree: false,
                        lectureOrder: 1
                    },
                    {
                        lectureId: "lec4",
                        lectureTitle: "Composants et Props",
                        lectureDuration: 25,
                        lectureUrl: "https://youtu.be/dQw4w9WgXcQ",
                        isPreviewFree: false,
                        lectureOrder: 2
                    }
                ]
            }
        ],
        courseRatings: [],
        enrolledStudents: [],
        playlistLink: "https://www.youtube.com/playlist?list=PLDoPjvoNmBAw4eOj58MZPakHjaO3frVMF"
    },
    {
        courseTitle: "Python pour la Data Science et Machine Learning",
        courseDescription: "<p>Maîtrisez Python et ses bibliothèques pour l'analyse de données et le machine learning.</p><ul><li>Python fondamentaux</li><li>NumPy et Pandas</li><li>Visualisation avec Matplotlib</li><li>Scikit-learn pour le ML</li><li>Projets pratiques</li></ul>",
        courseThumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800",
        coursePrice: 59.99,
        discount: 15,
        isPublished: true,
        courseContent: [
            {
                chapterId: "ch1",
                chapterOrder: 1,
                chapterTitle: "Introduction à Python",
                chapterContent: [
                    {
                        lectureId: "lec1",
                        lectureTitle: "Pourquoi Python pour la Data Science?",
                        lectureDuration: 10,
                        lectureUrl: "https://youtu.be/dQw4w9WgXcQ",
                        isPreviewFree: true,
                        lectureOrder: 1
                    },
                    {
                        lectureId: "lec2",
                        lectureTitle: "Installation de l'environnement",
                        lectureDuration: 12,
                        lectureUrl: "https://youtu.be/dQw4w9WgXcQ",
                        isPreviewFree: true,
                        lectureOrder: 2
                    }
                ]
            },
            {
                chapterId: "ch2",
                chapterOrder: 2,
                chapterTitle: "NumPy et Pandas",
                chapterContent: [
                    {
                        lectureId: "lec3",
                        lectureTitle: "Introduction à NumPy",
                        lectureDuration: 30,
                        lectureUrl: "https://youtu.be/dQw4w9WgXcQ",
                        isPreviewFree: false,
                        lectureOrder: 1
                    },
                    {
                        lectureId: "lec4",
                        lectureTitle: "Manipulation de données avec Pandas",
                        lectureDuration: 35,
                        lectureUrl: "https://youtu.be/dQw4w9WgXcQ",
                        isPreviewFree: false,
                        lectureOrder: 2
                    }
                ]
            }
        ],
        courseRatings: [],
        enrolledStudents: [],
        playlistLink: ""
    },
    {
        courseTitle: "Design UI/UX avec Figma",
        courseDescription: "<p>Apprenez à concevoir des interfaces utilisateur professionnelles avec Figma.</p><ul><li>Principes du design UI/UX</li><li>Maîtrise de Figma</li><li>Prototypage interactif</li><li>Design Systems</li><li>Portfolio professionnel</li></ul>",
        courseThumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
        coursePrice: 39.99,
        discount: 25,
        isPublished: true,
        courseContent: [
            {
                chapterId: "ch1",
                chapterOrder: 1,
                chapterTitle: "Introduction au Design UI/UX",
                chapterContent: [
                    {
                        lectureId: "lec1",
                        lectureTitle: "Qu'est-ce que le UI/UX Design?",
                        lectureDuration: 8,
                        lectureUrl: "https://youtu.be/dQw4w9WgXcQ",
                        isPreviewFree: true,
                        lectureOrder: 1
                    },
                    {
                        lectureId: "lec2",
                        lectureTitle: "Découverte de Figma",
                        lectureDuration: 15,
                        lectureUrl: "https://youtu.be/dQw4w9WgXcQ",
                        isPreviewFree: true,
                        lectureOrder: 2
                    }
                ]
            }
        ],
        courseRatings: [],
        enrolledStudents: [],
        playlistLink: ""
    },
    {
        courseTitle: "Marketing Digital et Réseaux Sociaux",
        courseDescription: "<p>Devenez expert en marketing digital et maîtrisez les réseaux sociaux pour développer votre business.</p><ul><li>Stratégie marketing digital</li><li>Facebook & Instagram Ads</li><li>Google Ads</li><li>SEO et Content Marketing</li><li>Analytics et KPIs</li></ul>",
        courseThumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
        coursePrice: 44.99,
        discount: 10,
        isPublished: true,
        courseContent: [
            {
                chapterId: "ch1",
                chapterOrder: 1,
                chapterTitle: "Fondamentaux du Marketing Digital",
                chapterContent: [
                    {
                        lectureId: "lec1",
                        lectureTitle: "Introduction au Marketing Digital",
                        lectureDuration: 12,
                        lectureUrl: "https://youtu.be/dQw4w9WgXcQ",
                        isPreviewFree: true,
                        lectureOrder: 1
                    },
                    {
                        lectureId: "lec2",
                        lectureTitle: "Définir votre audience cible",
                        lectureDuration: 18,
                        lectureUrl: "https://youtu.be/dQw4w9WgXcQ",
                        isPreviewFree: false,
                        lectureOrder: 2
                    }
                ]
            }
        ],
        courseRatings: [],
        enrolledStudents: [],
        playlistLink: ""
    },
    {
        courseTitle: "Cours Gratuit: Introduction à la Programmation",
        courseDescription: "<p>Un cours gratuit pour débuter en programmation. Parfait pour les débutants absolus!</p><ul><li>Logique de programmation</li><li>Variables et types de données</li><li>Structures de contrôle</li><li>Fonctions</li></ul>",
        courseThumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800",
        coursePrice: 0,
        discount: 0,
        isPublished: true,
        courseContent: [
            {
                chapterId: "ch1",
                chapterOrder: 1,
                chapterTitle: "Premiers pas en programmation",
                chapterContent: [
                    {
                        lectureId: "lec1",
                        lectureTitle: "Qu'est-ce que la programmation?",
                        lectureDuration: 10,
                        lectureUrl: "https://youtu.be/dQw4w9WgXcQ",
                        isPreviewFree: true,
                        lectureOrder: 1
                    },
                    {
                        lectureId: "lec2",
                        lectureTitle: "Votre premier programme",
                        lectureDuration: 15,
                        lectureUrl: "https://youtu.be/dQw4w9WgXcQ",
                        isPreviewFree: true,
                        lectureOrder: 2
                    }
                ]
            }
        ],
        courseRatings: [],
        enrolledStudents: [],
        playlistLink: ""
    }
];

// Seed function
const seedCourses = async () => {
    try {
        await connectDB();

        // Create or find educator user
        let educator = await User.findOne({ role: 'educator' });
        
        if (!educator) {
            educator = await User.create({
                email: 'educator@learnhub.com',
                password: 'Educator123!',
                firstName: 'Jean',
                lastName: 'Formateur',
                role: 'educator',
                isVerified: true
            });
            console.log('✅ Educator user created: educator@learnhub.com / Educator123!');
        } else {
            console.log('✅ Using existing educator:', educator.email);
        }

        // Delete existing courses (optional - comment out to keep existing)
        await Course.deleteMany({});
        console.log('🗑️  Existing courses deleted');

        // Add educator ID to each course
        const coursesWithEducator = coursesData.map(course => ({
            ...course,
            educator: educator._id.toString()
        }));

        // Insert courses
        const insertedCourses = await Course.insertMany(coursesWithEducator);
        console.log(`✅ ${insertedCourses.length} courses seeded successfully!`);

        // Display summary
        console.log('\n📚 Courses created:');
        insertedCourses.forEach((course, index) => {
            const finalPrice = (course.coursePrice - (course.discount * course.coursePrice / 100)).toFixed(2);
            console.log(`   ${index + 1}. ${course.courseTitle} - $${finalPrice}`);
        });

        console.log('\n🔐 Educator Login:');
        console.log('   Email: educator@learnhub.com');
        console.log('   Password: Educator123!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedCourses();
