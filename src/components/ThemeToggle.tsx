
import { useState, useEffect } from 'react';
import { Moon, Sun, SunMoon } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [isHovering, setIsHovering] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Add transition class to body for smooth theme transitions
    document.body.classList.add('theme-transition');
    setIsTransitioning(true);
    
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    // Remove transition class after theme change to prevent transitions during page load
    const timer = setTimeout(() => {
      document.body.classList.remove('theme-transition');
      setIsTransitioning(false);
    }, 1200); // Increased transition time for smoother effect
    
    return () => clearTimeout(timer);
  }, [isDark]);

  // Initialize theme from localStorage on initial load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Add base transition styles with longer duration
    const style = document.createElement('style');
    style.innerHTML = `
      .theme-transition,
      .theme-transition *,
      .theme-transition *:before,
      .theme-transition *:after {
        transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1) !important;
        transition-delay: 0 !important;
      }
      
      /* Add special transitions for specific elements */
      .theme-transition .card,
      .theme-transition .button,
      .theme-transition .bg-background {
        transition: background-color 1s cubic-bezier(0.16, 1, 0.3, 1), 
                    border-color 1s cubic-bezier(0.16, 1, 0.3, 1),
                    color 0.7s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }
      
      /* Add advanced animations */
      .theme-icon-rotate {
        transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
      }
      
      .theme-icon-rotate:hover {
        transform: rotate(45deg) scale(1.1) !important;
      }
      
      /* Ensure dropdown menus are visible in all modes */
      [data-radix-popper-content-wrapper] {
        z-index: 50 !important;
      }
      
      .dark [data-radix-select-content],
      .dark [data-radix-dropdown-menu-content],
      .dark [data-radix-popover-content] {
        background-color: hsl(228 20% 13%) !important;
        border-color: hsl(217 33% 25%) !important;
        color: white !important;
      }
      
      .dark [data-radix-select-item],
      .dark [data-radix-dropdown-menu-item] {
        color: hsl(210 40% 98%) !important;
      }
      
      .dark [data-radix-select-item]:hover,
      .dark [data-radix-dropdown-menu-item]:hover {
        background-color: hsl(229 23% 19%) !important;
      }
      
      /* Improved button styles for dark mode */
      .dark button.bg-gray-100,
      .dark button.bg-gray-200,
      .dark button.bg-gray-300 {
        background-color: hsl(215 25% 27%) !important;
        color: hsl(210 40% 98%) !important;
        border-color: hsl(215 25% 32%) !important;
      }
      
      .dark button.bg-white {
        background-color: hsl(228 20% 13%) !important;
        color: hsl(210 40% 98%) !important;
      }
      
      /* Animation for theme toggle */
      @keyframes sunAnimation {
        0% { transform: scale(0.8) rotate(0deg); opacity: 0.5; }
        100% { transform: scale(1) rotate(360deg); opacity: 1; }
      }
      
      @keyframes moonAnimation {
        0% { transform: scale(0.8) rotate(0deg); opacity: 0.5; }
        100% { transform: scale(1) rotate(-360deg); opacity: 1; }
      }
      
      .sun-animation {
        animation: sunAnimation 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }
      
      .moon-animation {
        animation: moonAnimation 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }
    `;
    document.head.appendChild(style);
    
    if (savedTheme === 'dark' || (savedTheme === null && prefersDark)) {
      setIsDark(true);
    }
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <Toggle 
      pressed={isDark} 
      onPressedChange={() => setIsDark(!isDark)}
      aria-label="Cambiar tema"
      className={`w-10 h-10 rounded-full transition-all duration-500 ${
        isDark ? 'bg-indigo-900/30 hover:bg-indigo-800/50' : 'bg-amber-100/50 hover:bg-amber-200/70'
      }`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {!isTransitioning && (
        <>
          {isDark ? (
            <Moon className={`h-5 w-5 transition-all duration-700 ${isHovering ? 'theme-icon-rotate' : 'moon-animation'}`} />
          ) : (
            <Sun className={`h-5 w-5 transition-all duration-700 ${isHovering ? 'theme-icon-rotate' : 'sun-animation'}`} />
          )}
        </>
      )}
      {isTransitioning && (
        <SunMoon className="h-5 w-5 animate-pulse" />
      )}
    </Toggle>
  );
};

export default ThemeToggle;
