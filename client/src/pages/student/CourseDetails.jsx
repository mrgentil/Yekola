import React, { useContext, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import Footer from "../../components/student/Footer";
import YouTube from "react-youtube";
import { toast } from "react-toastify";
import axios from "axios";
import Rating from "../../components/student/Rating";

const CourseDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const [courseData, setCourseData] = useState(null);
	const [openSections, setOpenSections] = useState({});
	const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
	const [playerData, setPlayerData] = useState(null);
	const [userRating, setUserRating] = useState(0);

	const {
		allCourses,
		currency,
		calculateRating,
		calculateChapterTime,
		calculateCourseDuration,
		calculateNoOfLectures,
		backendUrl,
		userData,
		enrolledCourses,
		getAccessToken,
	} = useContext(AppContext);

	const fetcheCourseData = async () => {
		try {
			const { data } = await axios.get(backendUrl + "/api/course/" + id);
			if (data.success) {
				setCourseData(data.courseData);
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(error.message);
		}
	};

	const enrollCourse = () => {
		if (!userData) {
			return toast.warn("Connectez-vous pour vous inscrire!");
		}
		if (isAlreadyEnrolled) {
			return toast.warn("Déjà inscrit");
		}
		navigate(`/payment/${courseData._id}`);
	};

	const handleRating = async (rating) => {
		if (!userData) {
			return toast.warn("Connectez-vous pour noter ce cours");
		}
		if (!isAlreadyEnrolled) {
			return toast.warn("Vous devez être inscrit pour noter ce cours");
		}
		try {
			const token = await getAccessToken();
			const { data } = await axios.post(`${backendUrl}/api/user/add-rating`, {
				courseId: id,
				rating
			}, {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (data.success) {
				toast.success("Merci pour votre note !");
				setUserRating(rating);
				fetcheCourseData();
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(error.message);
		}
	};

	// Get user's existing rating for this course
	useEffect(() => {
		if (courseData && userData) {
			const existingRating = courseData.courseRatings?.find(
				r => r.userId === userData.id
			);
			if (existingRating) {
				setUserRating(existingRating.rating);
			}
		}
	}, [courseData, userData]);

	useEffect(() => {
		fetcheCourseData();
	}, []);

	useEffect(() => {
		if (enrolledCourses && courseData && Array.isArray(enrolledCourses)) {
			setIsAlreadyEnrolled(enrolledCourses.some(course => course._id === courseData._id));
		} else {
			setIsAlreadyEnrolled(false);
		}
	}, [enrolledCourses, courseData]);

	const toggleSection = (index) => {
		setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
	};

	const rating = courseData ? calculateRating(courseData) : 0;
	const finalPrice = courseData ? (courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100).toFixed(2) : 0;
	const isFree = parseFloat(finalPrice) === 0;

	return courseData ? (
		<>
			{/* Hero Section - Dark background like Udemy */}
			<div className="bg-gray-900 text-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Left Content */}
						<div className="lg:col-span-2">
							{/* Breadcrumb */}
							<nav className="text-sm text-gray-400 mb-4">
								<span onClick={() => navigate("/")} className="hover:text-white cursor-pointer">Accueil</span>
								{" / "}
								<span onClick={() => navigate("/course-list")} className="hover:text-white cursor-pointer">Cours</span>
								{" / "}
								<span className="text-purple-400">{courseData.courseTitle}</span>
							</nav>

							<h1 className="text-3xl md:text-4xl font-bold mb-4">
								{courseData.courseTitle}
							</h1>

							<p className="text-gray-300 text-lg mb-4 line-clamp-2"
								dangerouslySetInnerHTML={{ __html: courseData.courseDescription.slice(0, 200) }}
							></p>

							{/* Badges */}
							<div className="flex flex-wrap items-center gap-3 mb-4">
								{courseData.enrolledStudents?.length > 10 && (
									<span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
										BEST-SELLER
									</span>
								)}
								{isFree && (
									<span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
										GRATUIT
									</span>
								)}
							</div>

							{/* Rating */}
							<div className="flex flex-wrap items-center gap-4 text-sm mb-4">
								<div className="flex items-center gap-1">
									<span className="text-yellow-400 font-bold text-lg">{rating}</span>
									<div className="flex">
										{[...Array(5)].map((_, i) => (
											<svg key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
												<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
											</svg>
										))}
									</div>
									<span className="text-purple-400">({courseData.courseRatings.length} avis)</span>
								</div>
								<span className="text-gray-400">{courseData.enrolledStudents?.length || 0} étudiants</span>
							</div>

							{/* Instructor */}
							<p className="text-sm text-gray-400">
								Créé par{" "}
								<span className="text-purple-400 underline cursor-pointer">
									{courseData.educator?.firstName || 'Unknown'} {courseData.educator?.lastName || 'Educator'}
								</span>
							</p>

							{/* Meta info */}
							<div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-400">
								<span className="flex items-center gap-1">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									{calculateCourseDuration(courseData)}
								</span>
								<span className="flex items-center gap-1">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
									</svg>
									{calculateNoOfLectures(courseData)} leçons
								</span>
								<span className="flex items-center gap-1">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
									</svg>
									Français
								</span>
							</div>
						</div>

						{/* Right - Video Preview (Mobile) */}
						<div className="lg:hidden">
							{playerData ? (
								<YouTube videoId={playerData.videoId} opts={{ playerVars: { autoplay: 1 } }} iframeClassName="w-full aspect-video rounded-lg" />
							) : (
								<img src={courseData.courseThumbnail} alt={courseData.courseTitle} className="w-full rounded-lg" />
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left Column - Course Content */}
					<div className="lg:col-span-2 space-y-8">
						{/* What you'll learn */}
						<div className="bg-white border border-gray-200 rounded-xl p-6">
							<h2 className="text-xl font-bold text-gray-900 mb-4">Ce que vous apprendrez</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								{['Maîtriser les concepts fondamentaux', 'Créer des projets concrets', 'Obtenir un certificat', 'Accès à vie au contenu'].map((item, i) => (
									<div key={i} className="flex items-start gap-2">
										<svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
										</svg>
										<span className="text-gray-700 text-sm">{item}</span>
									</div>
								))}
							</div>
						</div>

						{/* Course Content */}
						<div>
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-xl font-bold text-gray-900">Contenu du cours</h2>
								<span className="text-sm text-gray-500">
									{courseData.courseContent?.length || 0} sections • {calculateNoOfLectures(courseData)} leçons • {calculateCourseDuration(courseData)}
								</span>
							</div>

							<div className="border border-gray-200 rounded-xl overflow-hidden">
								{courseData.courseContent.map((chapter, index) => (
									<div key={index} className="border-b border-gray-200 last:border-b-0">
										<button
											onClick={() => toggleSection(index)}
											className="w-full flex items-center justify-between px-4 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
										>
											<div className="flex items-center gap-3">
												<svg className={`w-5 h-5 text-gray-500 transition-transform ${openSections[index] ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
												</svg>
												<span className="font-semibold text-gray-900">{chapter.chapterTitle}</span>
											</div>
											<span className="text-sm text-gray-500">{chapter.chapterContent.length} leçons</span>
										</button>

										{openSections[index] && (
											<div className="bg-white">
												{chapter.chapterContent.map((lecture, i) => (
													<div key={i} className="flex items-center justify-between px-4 py-3 border-t border-gray-100 hover:bg-gray-50">
														<div className="flex items-center gap-3">
															{lecture.isPreviewFree ? (
																<button onClick={() => setPlayerData({ videoId: lecture.lectureUrl.split("/").pop() })} className="text-purple-600 hover:text-purple-700">
																	<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
																		<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
																	</svg>
																</button>
															) : (
																<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
																</svg>
															)}
															<span className="text-gray-700 text-sm">{lecture.lectureTitle}</span>
															{lecture.isPreviewFree && (
																<span className="text-xs text-purple-600 font-medium">Aperçu</span>
															)}
														</div>
														<span className="text-sm text-gray-500">
															{humanizeDuration(lecture.lectureDuration * 60 * 1000, { units: ["h", "m"], language: "fr" })}
														</span>
													</div>
												))}
											</div>
										)}
									</div>
								))}
							</div>
						</div>

						{/* Description */}
						<div>
							<h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
							<div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: courseData.courseDescription }}></div>
						</div>
					</div>

					{/* Right Column - Sticky Card */}
					<div className="lg:col-span-1">
						<div className="sticky top-24">
							<div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
								{/* Video Preview */}
								<div className="hidden lg:block">
									{playerData ? (
										<YouTube videoId={playerData.videoId} opts={{ playerVars: { autoplay: 1 } }} iframeClassName="w-full aspect-video" />
									) : (
										<div className="relative group cursor-pointer" onClick={() => courseData.courseContent[0]?.chapterContent[0]?.isPreviewFree && setPlayerData({ videoId: courseData.courseContent[0].chapterContent[0].lectureUrl.split("/").pop() })}>
											<img src={courseData.courseThumbnail} alt={courseData.courseTitle} className="w-full" />
											<div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
												<div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
													<svg className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 20 20">
														<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
													</svg>
												</div>
											</div>
											<p className="absolute bottom-4 left-0 right-0 text-center text-white font-medium">Aperçu du cours</p>
										</div>
									)}
								</div>

								<div className="p-6">
									{/* Price */}
									<div className="mb-4">
										{isFree ? (
											<span className="text-3xl font-bold text-green-600">Gratuit</span>
										) : (
											<div className="flex items-center gap-3">
												<span className="text-3xl font-bold text-gray-900">{currency} {finalPrice}</span>
												{courseData.discount > 0 && (
													<>
														<span className="text-lg text-gray-400 line-through">{currency} {courseData.coursePrice}</span>
														<span className="bg-red-100 text-red-700 text-sm font-bold px-2 py-1 rounded">-{courseData.discount}%</span>
													</>
												)}
											</div>
										)}
									</div>

									{/* Urgency */}
									{courseData.discount > 0 && (
										<div className="flex items-center gap-2 text-red-600 text-sm mb-4">
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											<span className="font-medium">Offre limitée !</span>
										</div>
									)}

									{/* CTA Buttons */}
									{isAlreadyEnrolled ? (
										<>
											<Link to={`/player/${courseData._id}`} className="block w-full bg-purple-600 text-white text-center py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors mb-3">
												Continuer le cours
											</Link>
											<Link to="/my-enrollments" className="block w-full border-2 border-gray-300 text-gray-700 text-center py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors mb-4">
												Mes inscriptions
											</Link>
											
											{/* Rating Section for enrolled students */}
											<div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
												<h4 className="font-semibold text-gray-900 mb-2">⭐ Notez ce cours</h4>
												<p className="text-xs text-gray-500 mb-3">Votre avis aide les autres étudiants</p>
												<Rating initialRating={userRating} onRate={handleRating} />
												{userRating > 0 && (
													<p className="text-xs text-green-600 mt-2">✓ Vous avez donné {userRating} étoile{userRating > 1 ? 's' : ''}</p>
												)}
											</div>
										</>
									) : (
										<>
											<button onClick={enrollCourse} className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors mb-3">
												{isFree ? "S'inscrire gratuitement" : "Acheter maintenant"}
											</button>
											<p className="text-center text-xs text-gray-500">Garantie satisfait ou remboursé de 30 jours</p>
										</>
									)}

									{/* Features */}
									<div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
										<h4 className="font-semibold text-gray-900">Ce cours comprend :</h4>
										{[
											{ icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', text: `${calculateCourseDuration(courseData)} de vidéo` },
											{ icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', text: `${calculateNoOfLectures(courseData)} leçons` },
											{ icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z', text: 'Certificat de fin de formation' },
											{ icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z', text: 'Accès sur mobile et TV' },
											{ icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', text: 'Accès à vie' },
										].map((item, i) => (
											<div key={i} className="flex items-center gap-3 text-sm text-gray-600">
												<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
												</svg>
												<span>{item.text}</span>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<Footer />
		</>
	) : (
		<Loading />
	);
};

export default CourseDetails;
