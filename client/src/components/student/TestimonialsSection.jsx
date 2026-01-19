import React from "react";
import { assets, dummyTestimonial } from "../../assets/assets";

const TestimonialsSection = () => {
	return (
		<div className="py-16 bg-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<div className="text-center mb-12">
					<span className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
						<span>💬</span>
						Témoignages
					</span>
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
						Ce que disent nos apprenants
					</h2>
					<p className="text-gray-600 max-w-2xl mx-auto">
						Découvrez les témoignages de nos apprenants qui partagent leurs parcours de transformation et de succès.
					</p>
				</div>

				{/* Testimonials Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{dummyTestimonial.map((testimonial, index) => (
						<div 
							key={index} 
							className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
						>
							{/* Header with avatar */}
							<div className="flex items-center gap-4 mb-5">
								<img 
									className="w-14 h-14 rounded-full object-cover border-2 border-purple-100" 
									src={testimonial.image} 
									alt={testimonial.name} 
								/>
								<div>
									<h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
									<p className="text-sm text-gray-500">{testimonial.role}</p>
								</div>
							</div>

							{/* Rating */}
							<div className="flex gap-1 mb-4">
								{[...Array(5)].map((_, i) => (
									<svg 
										key={i}
										className={`w-5 h-5 ${i < Math.floor(testimonial.rating) ? 'text-yellow-400' : 'text-gray-200'}`}
										fill="currentColor" 
										viewBox="0 0 20 20"
									>
										<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
									</svg>
								))}
							</div>

							{/* Feedback */}
							<p className="text-gray-600 leading-relaxed mb-4">
								"{testimonial.feedback}"
							</p>

							{/* Read more link */}
							<button className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1">
								Lire plus
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
								</svg>
							</button>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default TestimonialsSection;
