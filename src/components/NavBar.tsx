
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Activity, Home, Dumbbell, Calculator } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { name: 'Home', path: '/', icon: <Home className="w-5 h-5" /> },
    { name: 'Crear Rutina', path: '/crear-rutina', icon: <Dumbbell className="w-5 h-5" /> },
    { name: 'Calculadora IMC', path: '/calculadora-imc', icon: <Calculator className="w-5 h-5" /> },
    { name: 'Mi Rutina', path: '/mi-rutina', icon: <Activity className="w-5 h-5" /> },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center">
                <Dumbbell className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                <span className="ml-2 text-xl font-bold gradient-text">GymFlow</span>
              </div>
            </div>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive 
                      ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                  }`
                }
              >
                <div className="flex items-center">
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </div>
              </NavLink>
            ))}
            
            {/* Theme toggle button */}
            <div className="ml-2">
              <ThemeToggle />
            </div>
          </div>
          
          {/* Mobile menu button and theme toggle */}
          <div className="flex items-center md:hidden space-x-2">
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">{isOpen ? 'Cerrar menú' : 'Abrir menú'}</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 dark:bg-gray-900/95 shadow-lg rounded-b-lg">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => 
                  `block px-3 py-2 rounded-md text-base font-medium flex items-center ${
                    isActive 
                      ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                  }`
                }
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
