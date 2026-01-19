import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import Loading from '../../components/student/Loading'
import Rating from '../../components/student/Rating'
import YouTube from 'react-youtube'
import humanizeDuration from 'humanize-duration'
import Footer from '../../components/student/Footer'
import CourseDiscussion from '../../components/student/CourseDiscussion'
import QuizList from '../../components/student/QuizList'

const Player = () => {
    const { courseId } = useParams()
    const navigate = useNavigate()
    const {enrolledCourses, calculateChapterTime, backendUrl, getAccessToken, userData, fetchUserEnrolledCourses} = useContext(AppContext)
    const [courseData, setCourseData] = useState(null)
    const [currentLecture, setCurrentLecture] = useState(null)
    const [progressData, setProgressData] = useState(null)
    const [openSections, setOpenSections] = useState({})
    const [playerData, setPlayerData] = useState(null)
    const [initialRating, setInitialRating] = useState(0)
    const [showCompletionModal, setShowCompletionModal] = useState(false)
    const [certificateData, setCertificateData] = useState(null)

    const fetchCourseData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/course/${courseId}`)
            if (data.success) {
                setCourseData(data.courseData)
                if (data.courseData.courseContent.length > 0 && data.courseData.courseContent[0].chapterContent.length > 0) {
                    setCurrentLecture(data.courseData.courseContent[0].chapterContent[0])
                }
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const updateProgress = async (lectureId) => {
        try {
            const token = await getAccessToken();
            if (!token) {
                toast.error('Authentication required')
                return
            }

            const { data } = await axios.post(`${backendUrl}/api/user/update-course-progress`, {
                courseId,
                lectureId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                fetchUserEnrolledCourses()
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getProgress = async () => {
        try {
            const token = await getAccessToken();
            if (!token) {
                toast.error('Authentication required')
                return
            }

            const { data } = await axios.post(`${backendUrl}/api/user/get-course-progress`, {
                courseId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                setProgressData(data.progressData)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const addRating = async (rating) => {
        try {
            const token = await getAccessToken();
            if (!token) {
                toast.error('Authentication required')
                return
            }

            const { data } = await axios.post(`${backendUrl}/api/user/add-rating`, {
                courseId,
                rating
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                toast.success('Merci pour votre note !')
                fetchCourseData()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const toggleSection = (index) => {
        setOpenSections(prev => ({
            ...prev,
            [index]: !prev[index]
        }))
    }

    const handleRate = (rating) => {
        setInitialRating(rating)
        addRating(rating)
    }

    const checkCourseCompletion = async () => {
        try {
            const token = await getAccessToken();
            if (!token) return

            const { data } = await axios.post(`${backendUrl}/api/certificate/check`, {
                courseId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success && data.completed && data.isNewCompletion) {
                setCertificateData(data.certificate)
                setShowCompletionModal(true)
            }
        } catch (error) {
            console.error('Check completion error:', error)
        }
    }

    const markLectureAsCompleted = async (lectureId) => {
        try {
            await updateProgress(lectureId)
            await getProgress()
            await checkCourseCompletion()
        } catch (error) {
            toast.error('Failed to mark lecture as completed')
        }
    }


  useEffect(()=>{
	fetchCourseData();
	getProgress();
  },[])

	// Check if user is enrolled in this course
	const isEnrolled = enrolledCourses?.some(course => course._id === courseId)

	if (!isEnrolled) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
					<p className="text-gray-600 mb-6">You need to enroll in this course to access its content.</p>
					<button 
						onClick={() => window.history.back()} 
						className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
					>
						Go Back
					</button>
				</div>
			</div>
		)
	}

	return courseData ? (
		<>
			<div className="p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36">
				{/* Left column */}
				<div className="text-gray-800">
					<h2 className="text-xl font-semibold">Course Structure</h2>
					<div className="pt-5">
						{courseData &&  courseData.courseContent.map((chapter, index) => (
							<div
								className="border border-gray-300 bg-white mb-2 rounded"
								key={index}
							>
								<div
									className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
									onClick={() => toggleSection(index)}
								>
									<div className="flex items-center gap-2">
										<img
											className={`transform transition-transform ${
												openSections[index] ? "rotate-180" : ""
											}`}
											src={assets.down_arrow_icon}
											alt="down_arrow_icon"
										/>
										<p className="font-medium md:text-base text-sm">
											{chapter.chapterTitle}
										</p>
									</div>
									<p className="text-sm md:text-default">
										{chapter.chapterContent.length} lectures -{" "}
										{calculateChapterTime(chapter)}{" "}
									</p>
								</div>

								<div
									className={`overflow-hidden transition-all duration-300 ${
										openSections[index] ? "max-h-9g" : "max-h-0"
									}`}
								>
									<ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
										{chapter.chapterContent.map((lecture, i) => (
											<li key={i} className="flex items-start gap-2 py-1">
												<img onClick={() =>
																	setPlayerData({
                                    ...lecture, chapter: index + 1, lecture: i+1
                                  })}

													className="w-4 h-4 mt-1 cursor-pointer"
													src={progressData?.lectureCompleted?.includes(lecture.lectureId) ? assets.blue_tick_icon : assets.play_icon}
													alt="play_icon"
												/>
												<div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
													<p>{lecture.lectureTitle}</p>
													<div className="flex gap-2">
														{lecture.lectureUrl && (
															<p
																onClick={() =>
																	setPlayerData({
                                    ...lecture, chapter: index + 1, lecture: i+1
                                  })
																}
																className="text-blue-500 cursor-pointer"
															>
																Watch
															</p>
														)}
														<p>
															{humanizeDuration(
																lecture.lectureDuration * 60 * 1000,
																{ units: ["h", "m"] }
															)}
														</p>
													</div>
												</div>
											</li>
										))}
									</ul>
								</div>
							</div>
						))}
					</div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mt-10 border border-yellow-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2">⭐ Notez ce cours</h2>
              <p className="text-gray-600 text-sm mb-4">Votre avis aide les autres étudiants à choisir leurs cours</p>
              <div className="flex items-center gap-4">
                <Rating initialRating={initialRating} onRate={handleRate}/>
                <span className="text-gray-500 text-sm">
                  {initialRating > 0 ? `Vous avez donné ${initialRating} étoile${initialRating > 1 ? 's' : ''}` : 'Cliquez pour noter'}
                </span>
              </div>
            </div>

            {/* Quiz Section */}
            <QuizList courseId={courseId} />

            {/* Q&A Section */}
            <div className="mt-6">
              <CourseDiscussion courseId={courseId} lectureId={playerData?.lectureId} />
            </div>

				</div>

				{/* right column */}
				<div className="md:mt-10">
          {playerData ? (
            <div className="">
              <YouTube 
                videoId={playerData.lectureUrl.split('/').pop()} 
                iframeClassName="w-full aspect-video"
                opts={{
                  width: '100%',
                  height: '100%',
                  playerVars: {
                    autoplay: 0,
                  },
                }}
              />
              
              <div className="flex justify-between items-center mt-1">
                <p>{playerData.chapter}.{playerData.lecture} {playerData.lectureTitle} </p>
                <button onClick={() => markLectureAsCompleted(playerData.lectureId)} className="text-blue-600">{progressData?.lectureCompleted?.includes(playerData.lectureId) ? '✓ Terminé' : 'Marquer comme terminé'}</button>
              </div>
            </div>
          ) 
          :  
          <img src={courseData ? courseData.courseThumbnail : ''} alt="courseThumbnail" />
        }
        </div>
			</div>
      <Footer/>

      {/* Completion Modal */}
      {showCompletionModal && certificateData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden animate-bounce-in">
            {/* Confetti effect header */}
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-30">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute animate-float"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`
                    }}
                  >
                    {['🎉', '🎊', '⭐', '🏆', '✨'][Math.floor(Math.random() * 5)]}
                  </div>
                ))}
              </div>
              <div className="relative z-10">
                <div className="text-6xl mb-4">🎓</div>
                <h2 className="text-3xl font-bold text-white mb-2">Félicitations !</h2>
                <p className="text-white/90">Vous avez terminé ce cours avec succès</p>
              </div>
            </div>

            <div className="p-6 text-center">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mb-6 border-2 border-yellow-200">
                <p className="text-gray-600 mb-2">Cours complété</p>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{certificateData.courseTitle}</h3>
                <div className="flex justify-center gap-6 text-sm">
                  <div>
                    <span className="text-2xl">📚</span>
                    <p className="text-gray-600">{certificateData.totalLectures} leçons</p>
                  </div>
                  <div>
                    <span className="text-2xl">⏱️</span>
                    <p className="text-gray-600">{Math.round(certificateData.totalDuration / 60)}h de contenu</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-200">
                <p className="text-green-800 font-medium">
                  🏆 Certificat N° {certificateData.certificateNumber}
                </p>
                <p className="text-green-600 text-sm">Votre certificat est prêt à être téléchargé</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCompletionModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Continuer
                </button>
                <button
                  onClick={() => navigate(`/certificate/${certificateData._id}`)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-colors font-medium"
                >
                  📜 Voir le certificat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
		</>
	)
	: <Loading/>;
};

export default Player;
