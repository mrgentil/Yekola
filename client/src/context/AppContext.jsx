import { createContext, useContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { data, useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration"
import { useAuth } from '@/context/AuthContext'
import axios from 'axios'
import {  toast } from 'react-toastify';

export const AppContext = createContext()

export const AppContextProvider = (props)=>{

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const currency = import.meta.env.VITE_CURRENCY;
    const navigate = useNavigate();

    const { user, token } = useAuth();

    const [allCourses, setAllCourses] = useState([])
    const [isEducator, setIsEducator] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [enrolledCourses, setEnrolledCourses] = useState([])
    const [wishlist, setWishlist] = useState([])
    const [userData, setUserData] = useState(null)

    // fetch all courses 
    const fetchAllCourses = async ()=>{
        try {
            const {data} = await axios.get(backendUrl + '/api/course/all');
            if(data.success)
            {
                setAllCourses(data.courses)
            }else{
                toast.error(data.message);
            }
            
        } catch (error) {
            toast.error(error.message)
        }
    }

    // fetch user data
    const fetchUserData = async ()=>{
        if (!user || !token) return;

        try {
            setUserData(user)
            if(user.role === 'educator' || user.role === 'admin'){
                setIsEducator(true);
            }
            if(user.role === 'admin'){
                setIsAdmin(true);
            }
        } catch (error) {
            console.error('Error fetching user data:', error)
        }
    }

    // Function to calculate average rating of course
    const calculateRating = (course) => {
        if(course.courseRatings.length === 0){
            return 0;
        }
        let totalRating = 0;
        course.courseRatings.forEach(rating =>{
            totalRating += rating.rating;
        })
        return Math.floor(totalRating / course.courseRatings.length)
    }

    // function to calculate course chapter time
    const calculateChapterTime = (chapter) => {
        let time = 0;
        chapter.chapterContent.map((lecture) => time += lecture.lectureDuration)
        return humanizeDuration(time * 60 * 1000, {units: ["h", "m"]})
    }

    // Function to calculate course Duratuion
    const calculateCourseDuration = (course)=>{
        let time = 0 ;
        course.courseContent.map((chapter)=> chapter.chapterContent.map(
            (lecture)=> time += lecture.lectureDuration 
        ))

        return humanizeDuration(time * 60 * 1000, {units: ["h", "m"]}) 
    }

    // Function to calculate to no. of lectures in the course
    const calculateNoOfLectures = (course) => {
        let totalLectures = 0;
        course.courseContent.forEach(chapter => {
            if(Array.isArray(chapter.chapterContent)){
                totalLectures += chapter.chapterContent.length;
            }
        });
        return totalLectures;
    }

    // Fetch user enrolled courses
    const fetchUserEnrolledCourses = async () => {
        if (!user || !token) return;
        
        try {
            const response = await axios.get(`${backendUrl}/api/user/enrolled-courses`, {
                headers: { 
                    Authorization: `Bearer ${token}` 
                }
            });
    
            if (response.data && response.data.enrolledCourses) {
                setEnrolledCourses(response.data.enrolledCourses.reverse());
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };
    
    // Fetch user wishlist
    const fetchWishlist = async () => {
        if (!user || !token) return;
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/wishlist`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setWishlist(data.wishlist || []);
            }
        } catch (error) {
            console.error("Error fetching wishlist:", error);
        }
    };

    // Add to wishlist
    const addToWishlist = async (courseId) => {
        if (!user || !token) {
            toast.error('Connectez-vous pour ajouter aux favoris');
            return false;
        }
        try {
            const { data } = await axios.post(`${backendUrl}/api/user/wishlist/${courseId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                toast.success('Ajouté aux favoris');
                fetchWishlist();
                return true;
            } else {
                toast.info(data.message);
                return false;
            }
        } catch (error) {
            toast.error('Erreur lors de l\'ajout');
            return false;
        }
    };

    // Remove from wishlist
    const removeFromWishlist = async (courseId) => {
        try {
            const { data } = await axios.delete(`${backendUrl}/api/user/wishlist/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                toast.success('Retiré des favoris');
                fetchWishlist();
                return true;
            }
            return false;
        } catch (error) {
            toast.error('Erreur lors de la suppression');
            return false;
        }
    };

    // Check if course is in wishlist
    const isInWishlist = (courseId) => {
        return wishlist.some(course => course._id === courseId);
    };

    useEffect(()=>{
        fetchAllCourses()
    },[])

    useEffect(()=>{
        if(user && token){
            fetchUserData()
            fetchUserEnrolledCourses()
            fetchWishlist()
        }
    },[user, token])

    // Helper function to get access token
    const getAccessToken = () => {
        return token
    }

    const value = {
        currency,
        allCourses, 
        navigate, 
        isEducator, 
        setIsEducator,
        isAdmin,
        setIsAdmin,
        calculateRating,
        calculateChapterTime,
        calculateCourseDuration,
        calculateNoOfLectures,
        fetchUserEnrolledCourses, 
        setEnrolledCourses,
        enrolledCourses,
        backendUrl, 
        userData, 
        setUserData, 
        fetchAllCourses,
        getAccessToken,
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        fetchWishlist
    }

    return (
        <AppContext.Provider value={value} >
            {props.children}
        </AppContext.Provider>
    )
}