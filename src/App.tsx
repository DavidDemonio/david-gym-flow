
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { useIsMobile } from "./hooks/use-mobile";

// Page Imports
import Home from "./pages/Home";
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

const App = () => {
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (savedTheme === null && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
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
                <Route path="/" element={<Home />} />
                <Route path="/crear-rutina" element={<CrearRutina />} />
                <Route path="/calculadora-imc" element={<CalculadoraIMC />} />
                <Route path="/mi-rutina" element={<MiRutina />} />
                <Route path="/maquinas-ejercicios" element={<MaquinasEjercicios />} />
                <Route path="/ajustes" element={<Ajustes />} />
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
