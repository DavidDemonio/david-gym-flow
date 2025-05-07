import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useIsMobile } from "./hooks/use-mobile";
import MysqlService from "./services/MysqlService";
import { mysqlConnection } from "./utils/mysqlConnection";
import { envManager } from "./utils/envManager";

// Page Imports
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import CrearRutina from "./pages/CrearRutina";
import CalculadoraIMC from "./pages/CalculadoraIMC";
import MiRutina from "./pages/MiRutina";
import NotFound from "./pages/NotFound";
import MaquinasEjercicios from "./pages/MaquinasEjercicios";
import Ajustes from "./pages/Ajustes";

// Component Imports
import NavBar from "./components/NavBar";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = MysqlService.isLoggedIn();
  const authRequired = localStorage.getItem('AUTH_REQUIRED') === 'true';

  if (authRequired && !isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const App = () => {
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState<boolean>(localStorage.getItem('AUTH_REQUIRED') === 'true');
  
  // Load stored database configs and environment variables on startup
  useEffect(() => {
    const loadConfigurations = async () => {
      try {
        // Try to load main database config
        const mainDbConfig = MysqlService.getConfigFromLocalStorage('main');
        if (mainDbConfig) {
          await mysqlConnection.setConfig(mainDbConfig);
        }
        
        // Try to load routines database config
        const routinesDbConfig = MysqlService.getConfigFromLocalStorage('routines');
        if (routinesDbConfig) {
          await mysqlConnection.setRoutinesDbConfig(routinesDbConfig);
        }

        // Try to load auth database config
        const authDbConfig = MysqlService.getConfigFromLocalStorage('auth');
        if (authDbConfig) {
          await mysqlConnection.setAuthDbConfig(authDbConfig);
        }
        
        // Initialize environment variables
        await envManager.initialize();
        
        // Check if auth is required
        const env = await envManager.getAll();
        const authRequired = env.AUTH_REQUIRED === 'true';
        setAuthRequired(authRequired);
        localStorage.setItem('AUTH_REQUIRED', String(authRequired));
      } catch (err) {
        console.error('Error loading stored configurations:', err);
      }
    };
    
    loadConfigurations();
  }, []);
  
  useEffect(() => {
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (savedTheme === null && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Add animation styles
    const style = document.createElement('style');
    style.innerHTML = `
      /* Advanced animations */
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes fadeInRight {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.7;
        }
      }
      
      .animate-fadeInUp {
        animation: fadeInUp 0.6s ease-out forwards;
      }
      
      .animate-fadeInRight {
        animation: fadeInRight 0.6s ease-out forwards;
      }
      
      .animate-pulse {
        animation: pulse 2s infinite;
      }
      
      .animate-delay-100 {
        animation-delay: 100ms;
      }
      
      .animate-delay-200 {
        animation-delay: 200ms;
      }
      
      .animate-delay-300 {
        animation-delay: 300ms;
      }
      
      /* Glass card styling */
      .glass-card {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      }
      
      .dark .glass-card {
        background: rgba(30, 30, 40, 0.7);
        border: 1px solid rgba(60, 60, 80, 0.2);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      }
      
      /* Gradient button */
      .gradient-btn {
        background: linear-gradient(135deg, #6027c5, #8a56e8);
        color: white;
        border: none;
        border-radius: 0.375rem;
        display: inline-flex;
        align-items: center;
        font-weight: 500;
        transition: all 0.3s ease;
      }
      
      .gradient-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(96, 39, 197, 0.3);
        background: linear-gradient(135deg, #6f30e6, #9866f0);
      }
      
      .dark .gradient-btn {
        background: linear-gradient(135deg, #7037d5, #9a66f8);
        box-shadow: 0 4px 12px rgba(106, 49, 207, 0.2);
      }
      
      .dark .gradient-btn:hover {
        background: linear-gradient(135deg, #7f40e6, #a976ff);
        box-shadow: 0 4px 15px rgba(116, 59, 217, 0.3);
      }
      
      /* Gradient text */
      .gradient-text {
        background-clip: text;
        -webkit-background-clip: text;
        color: transparent;
        background-image: linear-gradient(135deg, #6027c5, #8a56e8);
      }
      
      .dark .gradient-text {
        background-image: linear-gradient(135deg, #8a56e8, #b288ff);
      }
      
      /* Loading animation */
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-15px); }
      }
      
      .animate-bounce {
        animation: bounce 1.5s infinite;
      }
    `;
    document.head.appendChild(style);
    
    // Simulate app loading for animation purposes
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    // Add viewport meta tag for better mobile experience
    const viewportMeta = document.createElement('meta');
    viewportMeta.name = 'viewport';
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild(viewportMeta);
    
    return () => {
      clearTimeout(timer);
      document.head.removeChild(viewportMeta);
      document.head.removeChild(style);
    };
  }, []);
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">💪</div>
          <h1 className="text-2xl font-bold gradient-text animate-pulse">David GymFlow</h1>
        </div>
      </div>
    );
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner 
          position="top-right"
          toastOptions={{
            classNames: {
              toast: "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700",
              title: "dark:text-gray-100",
              description: "dark:text-gray-400",
            }
          }}
        />
        <BrowserRouter>
          <div className={`min-h-screen flex flex-col ${isMobile ? 'mobile-optimized' : ''}`}>
            <NavBar />
            <div className="flex-1 animate-fade-in overflow-x-hidden">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Protected or public routes based on AUTH_REQUIRED setting */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } />
                <Route path="/crear-rutina" element={
                  <ProtectedRoute>
                    <CrearRutina />
                  </ProtectedRoute>
                } />
                <Route path="/calculadora-imc" element={
                  <ProtectedRoute>
                    <CalculadoraIMC />
                  </ProtectedRoute>
                } />
                <Route path="/mi-rutina" element={
                  <ProtectedRoute>
                    <MiRutina />
                  </ProtectedRoute>
                } />
                <Route path="/maquinas-ejercicios" element={
                  <ProtectedRoute>
                    <MaquinasEjercicios />
                  </ProtectedRoute>
                } />
                <Route path="/ajustes" element={
                  <ProtectedRoute>
                    <Ajustes />
                  </ProtectedRoute>
                } />
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
