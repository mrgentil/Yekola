import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { assets, dummyDashboardData } from "../../assets/assets";
import Loading from "../../components/student/Loading";
import { toast } from "react-toastify";
import axios from "axios";
import Logger from "../../components/Logger";
import UserAvatar from "../../components/UserAvatar";
import { motion, AnimatePresence } from "framer-motion";

const Dashboard = () => {
	const { currency, backendUrl, getAccessToken, isEducator } = useContext(AppContext);
	const [dashboardData, setDashboardData] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [searchTerm, setSearchTerm] = useState("");
	const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
	const itemsPerPage = 5;

	const fetchDashboardData = async () => {
		try {
			const token = await getAccessToken();
			if (!token) {
				toast.error('Authentication required')
				return
			}

			const { data } = await axios.get(`${backendUrl}/api/educator/dashboard`, {
				headers: { Authorization: `Bearer ${token}` }
			})

			if (data.success) {
				setDashboardData(data.dashboardData)
			} else {
				toast.error(data.message)
			}
		} catch (error) {
			toast.error(error.message)
		}
	};

	useEffect(() => {
		if(isEducator){
			fetchDashboardData();
		}
	}, [isEducator]);

	// Filter and sort data
	const getFilteredData = () => {
		if (!dashboardData?.enrolledStudentsData) return [];
		
		let filtered = dashboardData.enrolledStudentsData.filter(item => {
			const studentName = `${item.student?.firstName || ''} ${item.student?.lastName || ''}`.toLowerCase();
			const courseTitle = (item.courseTitle || '').toLowerCase();
			return studentName.includes(searchTerm.toLowerCase()) || courseTitle.includes(searchTerm.toLowerCase());
		});

		if (sortConfig.key) {
			filtered.sort((a, b) => {
				let aVal, bVal;
				if (sortConfig.key === 'student') {
					aVal = `${a.student?.firstName || ''} ${a.student?.lastName || ''}`;
					bVal = `${b.student?.firstName || ''} ${b.student?.lastName || ''}`;
				} else {
					aVal = a[sortConfig.key] || '';
					bVal = b[sortConfig.key] || '';
				}
				if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
				if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
				return 0;
			});
		}
		return filtered;
	};

	const filteredData = getFilteredData();
	const totalPages = Math.ceil(filteredData.length / itemsPerPage);
	const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

	const handleSort = (key) => {
		setSortConfig(prev => ({
			key,
			direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
		}));
	};

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 }
	};

	const stats = [
		{
			title: "Total Inscriptions",
			value: dashboardData?.totalEnrollments || dashboardData?.enrolledStudentsData?.length || 0,
			icon: "👨‍🎓",
			color: "from-blue-500 to-blue-600",
			bgColor: "bg-blue-50",
			change: "+12%",
			changeType: "positive"
		},
		{
			title: "Total Cours",
			value: dashboardData?.totalCourses || 0,
			icon: "📚",
			color: "from-purple-500 to-purple-600",
			bgColor: "bg-purple-50",
			change: "+3",
			changeType: "positive"
		},
		{
			title: "Revenus Totaux",
			value: `${currency}${dashboardData?.totalEarnings || 0}`,
			icon: "💰",
			color: "from-green-500 to-green-600",
			bgColor: "bg-green-50",
			change: "+8%",
			changeType: "positive"
		},
		{
			title: "Note Moyenne",
			value: "4.8",
			icon: "⭐",
			color: "from-yellow-500 to-orange-500",
			bgColor: "bg-yellow-50",
			change: "+0.2",
			changeType: "positive"
		}
	];

	return dashboardData ? (
		<div className="min-h-screen bg-gray-50 p-4 md:p-8">
			{/* Mobile Logger */}
			<div className="block sm:hidden mb-6">
				<Logger/>
			</div>

			{/* Header */}
			<motion.div 
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className="mb-8"
			>
				<h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
				<p className="text-gray-500 mt-1">Bienvenue ! Voici un aperçu de vos performances.</p>
			</motion.div>

			{/* Stats Cards */}
			<motion.div 
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
			>
				{stats.map((stat, index) => (
					<motion.div
						key={index}
						variants={itemVariants}
						whileHover={{ scale: 1.02, translateY: -5 }}
						className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
					>
						<div className="flex items-center justify-between mb-4">
							<div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center text-2xl`}>
								{stat.icon}
							</div>
							<span className={`text-xs font-medium px-2 py-1 rounded-full ${
								stat.changeType === 'positive' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
							}`}>
								{stat.change}
							</span>
						</div>
						<h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
						<p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
					</motion.div>
				))}
			</motion.div>

			{/* Table Section */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3 }}
				className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
			>
				{/* Table Header */}
				<div className="p-6 border-b border-gray-100">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div>
							<h2 className="text-xl font-bold text-gray-900">Dernières inscriptions</h2>
							<p className="text-gray-500 text-sm mt-1">{filteredData.length} étudiants inscrits</p>
						</div>
						
						{/* Search */}
						<div className="relative">
							<input
								type="text"
								placeholder="Rechercher..."
								value={searchTerm}
								onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
								className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
							/>
							<svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</div>
					</div>
				</div>

				{/* Table */}
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
								<th 
									onClick={() => handleSort('student')}
									className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors"
								>
									<div className="flex items-center gap-2">
										Étudiant
										{sortConfig.key === 'student' && (
											<svg className={`w-4 h-4 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
											</svg>
										)}
									</div>
								</th>
								<th 
									onClick={() => handleSort('courseTitle')}
									className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors"
								>
									<div className="flex items-center gap-2">
										Cours
										{sortConfig.key === 'courseTitle' && (
											<svg className={`w-4 h-4 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
											</svg>
										)}
									</div>
								</th>
								<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
								<th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							<AnimatePresence>
								{paginatedData.length > 0 ? paginatedData.map((item, index) => (
									<motion.tr
										key={index}
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: 20 }}
										transition={{ delay: index * 0.05 }}
										className="hover:bg-gray-50 transition-colors"
									>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{(currentPage - 1) * itemsPerPage + index + 1}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center gap-3">
												<UserAvatar 
													src={item.student?.imageUrl} 
													alt={`${item.student?.firstName || 'U'}`}
													className="w-10 h-10 rounded-full ring-2 ring-gray-100"
												/>
												<div>
													<p className="text-sm font-medium text-gray-900">
														{item.student?.firstName || 'Unknown'} {item.student?.lastName || 'Student'}
													</p>
													<p className="text-xs text-gray-500">{item.student?.email || 'No email'}</p>
												</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<p className="text-sm text-gray-900 truncate max-w-xs">{item.courseTitle}</p>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
												<span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
												Actif
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right">
											<div className="flex items-center justify-end gap-2">
												<button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
													<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
													</svg>
												</button>
												<button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
													<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
													</svg>
												</button>
											</div>
										</td>
									</motion.tr>
								)) : (
									<tr>
										<td colSpan="5" className="px-6 py-12 text-center">
											<div className="flex flex-col items-center">
												<svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
												<p className="text-gray-500">Aucun résultat trouvé</p>
											</div>
										</td>
									</tr>
								)}
							</AnimatePresence>
						</tbody>
					</table>
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
						<p className="text-sm text-gray-500">
							Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredData.length)} sur {filteredData.length} résultats
						</p>
						<div className="flex items-center gap-2">
							<button
								onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
								disabled={currentPage === 1}
								className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								Précédent
							</button>
							
							{[...Array(totalPages)].map((_, i) => (
								<button
									key={i}
									onClick={() => setCurrentPage(i + 1)}
									className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
										currentPage === i + 1
											? 'bg-blue-600 text-white'
											: 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
									}`}
								>
									{i + 1}
								</button>
							))}
							
							<button
								onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
								disabled={currentPage === totalPages}
								className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								Suivant
							</button>
						</div>
					</div>
				)}
			</motion.div>
		</div>
	) : (
		<Loading />
	);
};

export default Dashboard;
