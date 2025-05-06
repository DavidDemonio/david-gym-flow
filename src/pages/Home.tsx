
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Dumbbell, Trophy, Clock, BarChart } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: <Dumbbell className="h-8 w-8 text-purple-500" />,
      title: 'Rutinas Personalizadas',
      description: 'Crea rutinas adaptadas a tus objetivos, nivel y equipo disponible.'
    },
    {
      icon: <Clock className="h-8 w-8 text-purple-500" />,
      title: 'Eficiencia de Tiempo',
      description: 'Optimiza tu entrenamiento con series y repeticiones precisas.'
    },
    {
      icon: <BarChart className="h-8 w-8 text-purple-500" />,
      title: 'Seguimiento de Progreso',
      description: 'Controla tus avances y evolución con métricas claras.'
    },
    {
      icon: <Trophy className="h-8 w-8 text-purple-500" />,
      title: 'Alcanza tus Metas',
      description: 'Consigue resultados reales con planes estructurados.'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="glass-card rounded-2xl p-8 mb-10 animate-fadeInUp">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            ¡Hola, <span className="gradient-text">David</span>!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Bienvenido a tu aplicación personalizada para crear rutinas de entrenamiento adaptadas a tus objetivos.
          </p>
        </div>
        
        <div className="flex justify-center">
          <button 
            onClick={() => navigate('/crear-rutina')} 
            className="gradient-btn px-8 py-3 text-lg flex items-center"
          >
            Crear Nueva Rutina
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="glass-card rounded-xl p-6 card-hover animate-fadeInUp"
            style={{ animationDelay: `${(index + 1) * 100}ms` }}
          >
            <div className="mb-4">{feature.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
      
      {/* Quick Actions */}
      <div className="glass-card rounded-2xl p-6 animate-fadeInUp animate-delay-300">
        <h2 className="text-2xl font-bold mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/crear-rutina')} 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl p-4 transition-all flex items-center justify-between"
          >
            <span className="font-medium">Crear Rutina</span>
            <Dumbbell className="h-5 w-5" />
          </button>
          
          <button 
            onClick={() => navigate('/calculadora-imc')}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl p-4 transition-all flex items-center justify-between"
          >
            <span className="font-medium">Calculadora IMC</span>
            <BarChart className="h-5 w-5" />
          </button>
          
          <button 
            onClick={() => navigate('/mi-rutina')}
            className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-xl p-4 transition-all flex items-center justify-between"
          >
            <span className="font-medium">Ver Mi Rutina</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
