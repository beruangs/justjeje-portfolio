import React, { useState, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';

const CustomCursor = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const mouseX = useSpring(0, { stiffness: 1500, damping: 60, restDelta: 0.001 });
    const mouseY = useSpring(0, { stiffness: 1500, damping: 60, restDelta: 0.001 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isVisible) setIsVisible(true);
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        const handleMouseOver = (e) => {
            if (
                e.target.tagName === 'A' ||
                e.target.tagName === 'BUTTON' ||
                e.target.closest('button') ||
                e.target.style.cursor === 'pointer'
            ) {
                setIsHovered(true);
            }
        };

        const handleMouseOut = () => {
            setIsHovered(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseover', handleMouseOver);
        window.addEventListener('mouseout', handleMouseOut);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseover', handleMouseOver);
            window.removeEventListener('mouseout', handleMouseOut);
        };
    }, [mouseX, mouseY, isVisible]);

    if (!isVisible) return null;

    return (
        <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference hidden lg:block"
            style={{
                x: mouseX,
                y: mouseY,
                translateX: '-50%',
                translateY: '-50%',
            }}
        >
            <motion.div
                animate={{
                    scale: isHovered ? 1.5 : 1,
                    rotate: isHovered ? 90 : 0,
                }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="relative flex items-center justify-center"
            >
                {/* Outer Ring */}
                <div className="w-8 h-8 rounded-full border border-white opacity-50" />

                {/* Lens Aperture Blades */}
                <svg
                    className="absolute w-12 h-12"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {[...Array(6)].map((_, i) => (
                        <motion.path
                            key={i}
                            initial={{ d: "M 50 50 L 50 10 L 85 30 Z" }}
                            animate={{
                                d: isHovered
                                    ? "M 50 50 L 50 40 L 55 45 Z" // Closed/Smaller aperture on hover
                                    : "M 50 50 L 50 20 L 76 35 Z"   // Open aperture
                            }}
                            transform={`rotate(${i * 60} 50 50)`}
                            stroke="white"
                            strokeWidth="0.5"
                            fill="white"
                            fillOpacity={isHovered ? "0.8" : "0.3"}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                    ))}
                </svg>

                {/* Center Dot */}
                <motion.div
                    animate={{ scale: isHovered ? 2 : 1 }}
                    className="absolute w-1 h-1 bg-white rounded-full"
                />
            </motion.div>
        </motion.div>
    );
};

export default CustomCursor;
