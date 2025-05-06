
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Page Imports
import Home from "./pages/Home";
import CrearRutina from "./pages/CrearRutina";
import CalculadoraIMC from "./pages/CalculadoraIMC";
import MiRutina from "./pages/MiRutina";
import NotFound from "./pages/NotFound";
import MaquinasEjercicios from "./pages/MaquinasEjercicios";

// Component Imports
import NavBar from "./components/NavBar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <NavBar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/crear-rutina" element={<CrearRutina />} />
              <Route path="/calculadora-imc" element={<CalculadoraIMC />} />
              <Route path="/mi-rutina" element={<MiRutina />} />
              <Route path="/maquinas-ejercicios" element={<MaquinasEjercicios />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
