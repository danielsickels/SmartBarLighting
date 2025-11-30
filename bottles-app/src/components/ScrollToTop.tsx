import { useState, useEffect, RefObject } from "react";

interface ScrollToTopProps {
  scrollContainerRef?: RefObject<HTMLElement>;
}

const ScrollToTop = ({ scrollContainerRef }: ScrollToTopProps) => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      const scrollY = scrollContainerRef?.current 
        ? scrollContainerRef.current.scrollTop 
        : window.scrollY;
        
      if (scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const scrollElement = scrollContainerRef?.current;
    
    if (scrollElement) {
      scrollElement.addEventListener("scroll", toggleVisibility);
      return () => {
        scrollElement.removeEventListener("scroll", toggleVisibility);
      };
    } else {
      window.addEventListener("scroll", toggleVisibility);
      return () => {
        window.removeEventListener("scroll", toggleVisibility);
      };
    }
  }, [scrollContainerRef]);

  const scrollToTop = () => {
    if (scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed top-8 lg:top-auto lg:bottom-8 right-8 z-50 p-3 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-500"
          style={{
            boxShadow: '0 0 20px 3px rgba(245, 158, 11, 0.6)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 30px 5px rgba(245, 158, 11, 0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 0 20px 3px rgba(245, 158, 11, 0.6)';
          }}
          aria-label="Scroll to top"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 15.75l7.5-7.5 7.5 7.5"
            />
          </svg>
        </button>
      )}
    </>
  );
};

export default ScrollToTop;

