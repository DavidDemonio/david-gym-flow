
import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    // Add transition class to body for smooth theme transitions
    document.body.classList.add('theme-transition');
    
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
    }, 1000); // Increased transition time for smoother effect
    
    return () => clearTimeout(timer);
  }, [isDark]);

  // Inicializa el tema desde localStorage en la carga inicial
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
      className="w-10 h-10 rounded-full transition-all duration-500"
    >
      {isDark ? 
        <Moon className="h-5 w-5 transition-transform duration-700 rotate-0" /> : 
        <Sun className="h-5 w-5 transition-transform duration-700 rotate-90" />
      }
    </Toggle>
  );
};

export default ThemeToggle;
