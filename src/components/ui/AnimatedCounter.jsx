import React, { useState, useEffect, useRef } from 'react';
import { Typography, Box } from '@mui/material';

/**
 * AnimatedCounter - A component that animates counting up to a target number
 * 
 * @param {Object} props - Component props
 * @param {number} props.value - The target value to count to
 * @param {string} props.prefix - Text to display before the number (e.g., "$")
 * @param {string} props.suffix - Text to display after the number (e.g., "%")
 * @param {number} props.duration - Animation duration in milliseconds (default: 1500)
 * @param {string} props.variant - Typography variant (default: "h3")
 * @param {string} props.color - Text color (default: "primary")
 * @param {Object} props.sx - Additional styles to apply
 */
const AnimatedCounter = ({
  value,
  prefix = '',
  suffix = '',
  duration = 1500,
  variant = 'h3',
  color = 'primary',
  sx = {}
}) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const startTimeRef = useRef(null);
  const frameRef = useRef(null);
  
  // Format the number based on its type
  const formatValue = (val) => {
    // If it's a whole number, don't show decimal places
    if (Number.isInteger(value)) {
      return Math.round(val).toLocaleString();
    }
    
    // For decimal numbers, show 1 decimal place
    return val.toFixed(1).toLocaleString();
  };
  
  useEffect(() => {
    // Reset animation when value changes
    if (countRef.current !== value) {
      countRef.current = value;
      startTimeRef.current = null;
      
      // Cancel any existing animation frame
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      // Start the animation
      const animate = (timestamp) => {
        if (!startTimeRef.current) {
          startTimeRef.current = timestamp;
        }
        
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easeOutQuad easing function for smoother animation
        const easeProgress = 1 - (1 - progress) * (1 - progress);
        
        // Calculate the current count value
        const currentCount = easeProgress * value;
        setCount(currentCount);
        
        // Continue animation until complete
        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        } else {
          setCount(value); // Ensure we end exactly at the target value
        }
      };
      
      frameRef.current = requestAnimationFrame(animate);
    }
    
    // Clean up animation on unmount
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, duration]);
  
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', ...sx }}>
      <Typography
        variant={variant}
        color={color}
        sx={{
          fontWeight: 600,
          background: color === 'primary' ? 
            'linear-gradient(45deg, #0277bd 30%, #58a5f0 90%)' : 
            undefined,
          WebkitBackgroundClip: color === 'primary' ? 'text' : undefined,
          WebkitTextFillColor: color === 'primary' ? 'transparent' : undefined,
        }}
      >
        {prefix}{formatValue(count)}{suffix}
      </Typography>
    </Box>
  );
};

export default AnimatedCounter;
