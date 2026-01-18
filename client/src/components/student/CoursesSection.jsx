import React, { useContext, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import CourseCard from "./CourseCard";
import Loading from "./Loading";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const CoursesSection = () => {
    const { allCourses } = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const swiperRef = useRef(null);

    const categories = [
        { id: 'all', name: 'Tous les cours', icon: '📚' },
        { id: 'popular', name: 'Populaires', icon: '🔥' },
        { id: 'new', name: 'Nouveautés', icon: '✨' },
        { id: 'free', name: 'Gratuits', icon: '🎁' },
    ];

    useEffect(() => {
        if (allCourses && allCourses.length > 0) {
            setLoading(false);
        }
    }, [allCourses]);

    const getFilteredCourses = () => {
        if (!allCourses) return [];
        switch (activeCategory) {
            case 'popular':
                return [...allCourses].sort((a, b) => (b.enrolledStudents?.length || 0) - (a.enrolledStudents?.length || 0));
            case 'new':
                return [...allCourses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'free':
                return allCourses.filter(c => (c.coursePrice - c.discount * c.coursePrice / 100) === 0);
            default:
                return allCourses;
        }
    };

    return (
        <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
                    <div>
                        <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            Explorez nos cours
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                            Apprenez avec les meilleurs
                        </h2>
                        <p className="text-gray-600 mt-3 max-w-2xl">
                            Des milliers d'étudiants nous font confiance. Rejoignez-les et développez vos compétences.
                        </p>
                    </div>
                    <Link
                        to={"/course-list"}
                        onClick={() => scrollTo(0, 0)}
                        className="hidden md:inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-colors mt-4 md:mt-0"
                    >
                        Voir tout
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-3 mb-8">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                                activeCategory === cat.id
                                    ? 'bg-gray-900 text-white shadow-lg'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-md'
                            }`}
                        >
                            <span>{cat.icon}</span>
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Courses Carousel */}
                {loading ? (
                    <Loading />
                ) : (
                    <div className="relative group">
                        {/* Custom Navigation Buttons */}
                        <button 
                            onClick={() => swiperRef.current?.slidePrev()}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:-translate-x-6 transition-all duration-300 hover:bg-gray-50 border border-gray-100"
                        >
                            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button 
                            onClick={() => swiperRef.current?.slideNext()}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-6 transition-all duration-300 hover:bg-gray-50 border border-gray-100"
                        >
                            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        <Swiper
                            onSwiper={(swiper) => { swiperRef.current = swiper; }}
                            modules={[Navigation, Pagination, Autoplay]}
                            spaceBetween={24}
                            slidesPerView={1}
                            pagination={{ 
                                clickable: true,
                                dynamicBullets: true,
                            }}
                            autoplay={{
                                delay: 4000,
                                disableOnInteraction: false,
                                pauseOnMouseEnter: true,
                            }}
                            breakpoints={{
                                640: { slidesPerView: 2 },
                                768: { slidesPerView: 3 },
                                1024: { slidesPerView: 4 },
                            }}
                            className="pb-12"
                        >
                            {getFilteredCourses().map((course, index) => (
                                <SwiperSlide key={index}>
                                    <CourseCard course={course} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                )}

                {/* Stats Bar */}
                <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { value: '10K+', label: 'Étudiants actifs', icon: '👨‍🎓' },
                        { value: '500+', label: 'Cours disponibles', icon: '📖' },
                        { value: '50+', label: 'Instructeurs experts', icon: '👨‍🏫' },
                        { value: '98%', label: 'Taux de satisfaction', icon: '⭐' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-shadow">
                            <span className="text-2xl">{stat.icon}</span>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                            <p className="text-sm text-gray-500">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Mobile CTA */}
                <div className="mt-10 text-center md:hidden">
                    <Link
                        to={"/course-list"}
                        onClick={() => scrollTo(0, 0)}
                        className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                    >
                        Voir tous les cours
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CoursesSection;
