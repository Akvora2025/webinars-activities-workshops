import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { calculateEventStatus, getStatusLabel } from '../utils/eventStatus';
import './DashboardCarousel.css';


const DashboardCarousel = ({ items }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const navigate = useNavigate();

    const nextSlide = useCallback(() => {
        setDirection(-1);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, [items.length]);

    const prevSlide = useCallback(() => {
        setDirection(1);
        setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
    }, [items.length]);

    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 5000);

        return () => clearInterval(timer);
    }, [nextSlide]);

    if (!items || items.length === 0) return null;

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0
        })
    };

    const currentItem = items[currentIndex];

    const getAPIUrl = () => {
        return import.meta.env.VITE_API_URL;
    };

    const bannerImageUrl = currentItem.bannerImage
        ? `${getAPIUrl().replace('/api', '')}${currentItem.bannerImage}`
        : null;

    return (
        <div className="carousel-container">
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                    }}
                    className="carousel-slide"
                    style={{
                        backgroundImage: bannerImageUrl ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${bannerImageUrl})` : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                    }}
                >
                    <div className="carousel-content">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="carousel-status-row"
                        >
                            <span className="carousel-type-tag">
                                {currentItem.title}
                            </span>
                            <span className={`status-badge-live ${calculateEventStatus(currentItem.startDateRaw, currentItem.endDate)}`}>
                                {getStatusLabel(calculateEventStatus(currentItem.startDateRaw, currentItem.endDate))}
                            </span>

                        </motion.div>


                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="carousel-heading"
                        >
                            {currentItem.heading}
                        </motion.h1>

                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="carousel-description"
                        >
                            {currentItem.description}
                        </motion.p>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="carousel-info"
                        >
                            <div className="info-item">
                                <Calendar size={18} />
                                <span>{currentItem.date}</span>
                            </div>
                            <div className="info-item">
                                <Clock size={18} />
                                <span>{currentItem.time}</span>
                            </div>
                        </motion.div>

                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="carousel-cta"
                            onClick={() => {
                                if (currentItem.type === 'webinar') {
                                    navigate(`/webinars?register=${currentItem.id}`);
                                } else {
                                    navigate(currentItem.ctaLink);
                                }
                            }}
                        >
                            {currentItem.ctaText}
                        </motion.button>
                    </div>
                </motion.div>
            </AnimatePresence>

            <button className="carousel-nav-btn prev" onClick={prevSlide}>
                <ChevronLeft size={24} />
            </button>
            <button className="carousel-nav-btn next" onClick={nextSlide}>
                <ChevronRight size={24} />
            </button>

            <div className="carousel-pagination">
                {items.map((_, index) => (
                    <button
                        key={index}
                        className={`pagination-dot ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => {
                            setDirection(index > currentIndex ? 1 : -1);
                            setCurrentIndex(index);
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default DashboardCarousel;
