
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="glass-card rounded-xl p-8 max-w-md mx-auto text-center animate-fadeInUp">
        <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Página no encontrada</h2>
        <p className="text-gray-600 mb-8">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button 
            onClick={() => navigate(-1)}
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver atrás
          </button>
          <button 
            onClick={() => navigate('/')}
            className="gradient-btn px-5 py-2 flex items-center justify-center"
          >
            <Home className="h-4 w-4 mr-2" />
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
