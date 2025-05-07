
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, User, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import MysqlService from '../services/MysqlService';
import { useToast } from '../hooks/use-toast';

const NavBar = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Check if the route is a login/register/reset-password page
  const isAuthPage = ['/login', '/register', '/reset-password'].includes(location.pathname);
  
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
    
    // Check logged in user
    const user = MysqlService.getCurrentUser();
    setCurrentUser(user);
  }, [location.pathname]);
  
  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  
  const handleLogout = () => {
    MysqlService.logout();
    setCurrentUser(null);
    toast({
      title: "Logout successful",
      description: "You have been logged out",
    });
    navigate('/login');
  };
  
  const renderAuthButton = () => {
    if (isAuthPage) return null;
    
    if (currentUser) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{currentUser.name || currentUser.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/ajustes')}>
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    
    return (
      <Button onClick={() => navigate('/login')} variant="outline" size="sm" className="ml-2">
        Login
      </Button>
    );
  };
  
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="font-bold text-xl mr-1 gradient-text">David</span>
              <span className="font-semibold text-lg">GymFlow</span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {!isAuthPage && (
              <>
                <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 ${location.pathname === '/' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'}`}>Home</Link>
                <Link to="/crear-rutina" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 ${location.pathname === '/crear-rutina' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'}`}>Crear Rutina</Link>
                <Link to="/mi-rutina" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 ${location.pathname === '/mi-rutina' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'}`}>Mi Rutina</Link>
                <Link to="/maquinas-ejercicios" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 ${location.pathname === '/maquinas-ejercicios' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'}`}>Máquinas & Ejercicios</Link>
                <Link to="/ajustes" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 ${location.pathname === '/ajustes' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'}`}>Ajustes</Link>
              </>
            )}
          </nav>
          
          {/* Right side buttons */}
          <div className="flex items-center">
            {/* Dark mode toggle */}
            <Button 
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="mx-2"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            {/* Auth button (login/logout) */}
            {renderAuthButton()}
            
            {/* Mobile menu button */}
            <div className="flex md:hidden ml-2">
              <Button 
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && !isAuthPage && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg border-t border-gray-100 dark:border-gray-800 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800 ${location.pathname === '/' ? 'text-purple-600 dark:text-purple-400 bg-gray-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/crear-rutina" 
              className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800 ${location.pathname === '/crear-rutina' ? 'text-purple-600 dark:text-purple-400 bg-gray-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Crear Rutina
            </Link>
            <Link 
              to="/mi-rutina" 
              className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800 ${location.pathname === '/mi-rutina' ? 'text-purple-600 dark:text-purple-400 bg-gray-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Mi Rutina
            </Link>
            <Link 
              to="/maquinas-ejercicios" 
              className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800 ${location.pathname === '/maquinas-ejercicios' ? 'text-purple-600 dark:text-purple-400 bg-gray-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Máquinas & Ejercicios
            </Link>
            <Link 
              to="/ajustes" 
              className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800 ${location.pathname === '/ajustes' ? 'text-purple-600 dark:text-purple-400 bg-gray-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Ajustes
            </Link>
            {currentUser && (
              <Button 
                variant="ghost"
                className="w-full justify-start text-red-600 dark:text-red-400"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default NavBar;
