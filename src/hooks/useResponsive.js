import { useState, useEffect } from 'react';

export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  const [breakpoint, setBreakpoint] = useState('xl');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setWindowSize({ width, height });

      // Set breakpoint based on window width
      if (width < 480) {
        setBreakpoint('xs');
      } else if (width < 576) {
        setBreakpoint('sm');
      } else if (width < 768) {
        setBreakpoint('md');
      } else if (width < 992) {
        setBreakpoint('lg');
      } else if (width < 1200) {
        setBreakpoint('xl');
      } else {
        setBreakpoint('xxl');
      }
    };

    // Set initial values
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width <= 768;
  const isTablet = windowSize.width > 768 && windowSize.width <= 992;
  const isDesktop = windowSize.width > 992;
  const isSmallScreen = windowSize.width <= 576;

  // Responsive values helper
  const responsive = (xs, sm, md, lg, xl) => {
    if (breakpoint === 'xs') return xs;
    if (breakpoint === 'sm') return sm || xs;
    if (breakpoint === 'md') return md || sm || xs;
    if (breakpoint === 'lg') return lg || md || sm || xs;
    if (breakpoint === 'xl' || breakpoint === 'xxl') return xl || lg || md || sm || xs;
    return xl || lg || md || sm || xs;
  };

  // Container padding based on screen size - more generous margins
  const containerPadding = responsive('1.5rem', '2rem', '3rem', '4rem', '5rem');

  // Grid columns based on screen size
  const gridCols = responsive(1, 1, 2, 3, 3);

  return {
    windowSize,
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,
    responsive,
    containerPadding,
    gridCols
  };
};