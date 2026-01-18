import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import SearchBar from "../../components/student/SearchBar";
import { useParams, useNavigate } from "react-router-dom";
import CourseCard from "../../components/student/CourseCard";
import { assets } from "../../assets/assets";
import Footer from "../../components/student/Footer";

const CoursesList = () => {
	const { allCourses } = useContext(AppContext);
	const navigate = useNavigate();
	const { input } = useParams();
	const [filteredCourse, setFilteredcourse] = useState([]);
	const [sortBy, setSortBy] = useState('popular');
	const [priceFilter, setPriceFilter] = useState('all');

	useEffect(() => {
		if (allCourses && allCourses.length > 0) {
			let tempCourses = allCourses.slice();

			// Search filter
			if (input) {
				tempCourses = tempCourses.filter(
					item => item.courseTitle.toLowerCase().includes(input.toLowerCase())
				);
			}

			// Price filter
			if (priceFilter === 'free') {
				tempCourses = tempCourses.filter(c => (c.coursePrice - c.discount * c.coursePrice / 100) === 0);
			} else if (priceFilter === 'paid') {
				tempCourses = tempCourses.filter(c => (c.coursePrice - c.discount * c.coursePrice / 100) > 0);
			}

			// Sort
			switch (sortBy) {
				case 'popular':
					tempCourses.sort((a, b) => (b.enrolledStudents?.length || 0) - (a.enrolledStudents?.length || 0));
					break;
				case 'newest':
					tempCourses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
					break;
				case 'price-low':
					tempCourses.sort((a, b) => (a.coursePrice - a.discount * a.coursePrice / 100) - (b.coursePrice - b.discount * b.coursePrice / 100));
					break;
				case 'price-high':
					tempCourses.sort((a, b) => (b.coursePrice - b.discount * b.coursePrice / 100) - (a.coursePrice - a.discount * a.coursePrice / 100));
					break;
				case 'rating':
					tempCourses.sort((a, b) => {
						const ratingA = a.courseRatings?.length ? a.courseRatings.reduce((acc, r) => acc + r.rating, 0) / a.courseRatings.length : 0;
						const ratingB = b.courseRatings?.length ? b.courseRatings.reduce((acc, r) => acc + r.rating, 0) / b.courseRatings.length : 0;
						return ratingB - ratingA;
					});
					break;
				default:
					break;
			}

			setFilteredcourse(tempCourses);
		}
	}, [allCourses, input, sortBy, priceFilter]);

	return (
		<>
			{/* Hero Banner */}
			<div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
					<div className="text-center">
						<h1 className="text-4xl md:text-5xl font-bold mb-4">
							{input ? `Résultats pour "${input}"` : 'Explorez nos cours'}
						</h1>
						<p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
							Découvrez des milliers de cours pour développer vos compétences et atteindre vos objectifs
						</p>
						<div className="max-w-xl mx-auto">
							<SearchBar data={input} />
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Breadcrumb & Results Count */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
					<div>
						<nav className="text-sm text-gray-500 mb-2">
							<span onClick={() => navigate("/")} className="text-blue-600 cursor-pointer hover:underline">
								Accueil
							</span>
							{" / "}
							<span>Cours</span>
							{input && <span> / {input}</span>}
						</nav>
						<p className="text-gray-700 font-medium">
							{filteredCourse.length} cours trouvé{filteredCourse.length > 1 ? 's' : ''}
						</p>
					</div>

					{/* Search tag */}
					{input && (
						<div className="mt-4 sm:mt-0 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full">
							<span className="font-medium">{input}</span>
							<button 
								onClick={() => navigate('/course-list')}
								className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center hover:bg-blue-300 transition-colors"
							>
								<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
					)}
				</div>

				{/* Filters Bar */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
					<div className="flex flex-col sm:flex-row gap-4">
						{/* Sort */}
						<div className="flex items-center gap-2">
							<label className="text-sm font-medium text-gray-700">Trier par:</label>
							<select 
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value)}
								className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							>
								<option value="popular">Plus populaires</option>
								<option value="newest">Plus récents</option>
								<option value="rating">Mieux notés</option>
								<option value="price-low">Prix croissant</option>
								<option value="price-high">Prix décroissant</option>
							</select>
						</div>

						{/* Price Filter */}
						<div className="flex items-center gap-2">
							<label className="text-sm font-medium text-gray-700">Prix:</label>
							<div className="flex gap-2">
								{[
									{ id: 'all', label: 'Tous' },
									{ id: 'free', label: 'Gratuits' },
									{ id: 'paid', label: 'Payants' },
								].map((filter) => (
									<button
										key={filter.id}
										onClick={() => setPriceFilter(filter.id)}
										className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
											priceFilter === filter.id
												? 'bg-blue-600 text-white'
												: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
										}`}
									>
										{filter.label}
									</button>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Courses Grid */}
				{filteredCourse.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{filteredCourse.map((course, index) => (
							<CourseCard key={index} course={course} />
						))}
					</div>
				) : (
					<div className="text-center py-16">
						<div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun cours trouvé</h3>
						<p className="text-gray-500 mb-6">Essayez de modifier vos filtres ou votre recherche</p>
						<button 
							onClick={() => {
								navigate('/course-list');
								setPriceFilter('all');
								setSortBy('popular');
							}}
							className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
						>
							Voir tous les cours
						</button>
					</div>
				)}
			</div>
			<Footer/>
		</>
	);
};

export default CoursesList;
