import React, { useState, useEffect, useContext } from 'react'
import SearchBar from './SearchBar'
import { motion } from "framer-motion";
import { SiteContext } from '../../context/SiteContext';

const Hero = () => {
  const { siteSettings, loading } = useContext(SiteContext);
  const [activeIndex, setActiveIndex] = useState(0);

  // Default slides if none configured
  const defaultSlides = [
    {
      title: "Construisez votre avenir avec des cours conçus pour vous",
      subtitle: "Nous réunissons des instructeurs de classe mondiale, du contenu interactif et une communauté solidaire pour vous aider à atteindre vos objectifs.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
      buttonText: "Explorer les cours",
      buttonLink: "/course-list",
    },
    {
      title: "Apprenez des experts et boostez votre carrière",
      subtitle: "Accédez à des milliers de cours dispensés par des professionnels. Obtenez une certification et démarquez-vous.",
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
      buttonText: "Commencer",
      buttonLink: "/course-list",
    },
    {
      title: "Étudiez à votre rythme avec un apprentissage flexible",
      subtitle: "Apprenez n'importe quand, n'importe où. Notre plateforme vous permet d'étudier en déplacement.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
      buttonText: "Découvrir",
      buttonLink: "/course-list",
    },
  ];

  // Use configured slides or defaults
  const hasValidSlides = siteSettings?.heroSlides && 
    Array.isArray(siteSettings.heroSlides) && 
    siteSettings.heroSlides.length > 0 &&
    siteSettings.heroSlides.some(slide => slide.title || slide.image);
  
  const configuredSlides = hasValidSlides ? siteSettings.heroSlides : defaultSlides;

  const gradients = [
    "from-blue-600 to-indigo-700",
    "from-purple-600 to-pink-600",
    "from-emerald-600 to-teal-600",
    "from-orange-500 to-red-600",
    "from-cyan-600 to-blue-600",
  ];

  const slides = configuredSlides.map((slide, index) => ({
    ...slide,
    gradient: gradients[index % gradients.length],
  }));

  // Auto-advance slides
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => setActiveIndex(index);
  const prevSlide = () => setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setActiveIndex((prev) => (prev + 1) % slides.length);

  const currentSlide = slides[activeIndex] || slides[0];

  const stats = [
    { value: '500+', label: 'Cours', icon: '📚' },
    { value: '50+', label: 'Instructeurs experts', icon: '👨‍🏫' },
    { value: '24/7', label: 'Support', icon: '💬' },
    { value: '10K+', label: 'Étudiants', icon: '🎓' },
  ];

  if (loading) {
    return (
      <div className="min-h-[90vh] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className='relative w-full'>
      {/* Main Hero */}
      <div className={`relative min-h-[90vh] flex items-center bg-gradient-to-br ${currentSlide.gradient} transition-all duration-700`}>
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          {currentSlide.image && (
            <img 
              key={currentSlide.image}
              src={currentSlide.image} 
              alt="" 
              className="w-full h-full object-cover opacity-20 transition-opacity duration-500"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text Content */}
            <div className="text-white space-y-6 text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Rejoignez 50 000+ apprenants dans le monde
              </div>

              <h1 key={activeIndex} className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                {currentSlide.title}
              </h1>

              <p className="text-lg text-white/80 max-w-xl">
                {currentSlide.subtitle}
              </p>

              {/* Search Bar */}
              <div className="max-w-lg">
                <SearchBar />
              </div>

              {/* Action Button */}
              {currentSlide.buttonText && (
                <div>
                  <a 
                    href={currentSlide.buttonLink || '/course-list'}
                    className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                  >
                    {currentSlide.buttonText}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              )}

              {/* Trust badges */}
              <div className="flex flex-wrap gap-4 text-sm text-white/70">
                {['Essai gratuit', 'Certificat inclus', 'Accès à vie'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Featured Image/Card */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
                  {currentSlide.image && (
                    <img 
                      src={currentSlide.image} 
                      alt="Learning" 
                      className="w-full h-64 object-cover rounded-2xl mb-4"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-lg">🎯</div>
                      <div className="text-left">
                        <p className="text-white font-semibold">Commencez à apprendre</p>
                        <p className="text-white/60 text-sm">Plus de 500+ cours disponibles</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {['Développement', 'Design', 'Marketing'].map((tag, i) => (
                        <span key={i} className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg">
                  🔥 Tendance
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white text-gray-900 px-4 py-3 rounded-xl shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-2 border-white"></div>
                      ))}
                    </div>
                    <span className="text-sm font-medium">+2.5k inscrits cette semaine</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-20 max-w-7xl mx-auto px-4 flex justify-between pointer-events-none">
            <button 
              onClick={prevSlide}
              className="pointer-events-auto bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full transition-all shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={nextSlide}
              className="pointer-events-auto bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full transition-all shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Pagination Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === activeIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
