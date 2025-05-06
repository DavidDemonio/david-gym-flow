
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Dumbbell, Trophy, Clock, BarChart, CheckCircle, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Home = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: <Dumbbell className="h-8 w-8 text-purple-500 dark:text-purple-400" />,
      title: 'Rutinas Personalizadas',
      description: 'Crea rutinas adaptadas a tus objetivos, nivel y equipo disponible.'
    },
    {
      icon: <Clock className="h-8 w-8 text-purple-500 dark:text-purple-400" />,
      title: 'Eficiencia de Tiempo',
      description: 'Optimiza tu entrenamiento con series y repeticiones precisas.'
    },
    {
      icon: <BarChart className="h-8 w-8 text-purple-500 dark:text-purple-400" />,
      title: 'Seguimiento de Progreso',
      description: 'Controla tus avances y evolución con métricas claras.'
    },
    {
      icon: <Trophy className="h-8 w-8 text-purple-500 dark:text-purple-400" />,
      title: 'Alcanza tus Metas',
      description: 'Consigue resultados reales con planes estructurados.'
    }
  ];

  const benefits = [
    { text: 'Entrena desde cualquier lugar', icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
    { text: 'Aumenta tu fuerza y resistencia', icon: <Flame className="h-5 w-5 text-orange-500" /> },
    { text: 'Reduce el riesgo de lesiones', icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
    { text: 'Mejora tu composición corporal', icon: <Flame className="h-5 w-5 text-orange-500" /> },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section con animación y efecto 3D */}
      <div className="glass-card rounded-2xl p-8 mb-10 animate-fadeInUp overflow-hidden relative hero-gradient card-3d">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="text-4xl md:text-5xl lg:text-7xl font-bold mb-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <span className="animate-float">¡Hola,</span>
              <span className="gradient-text animate-float">David!</span>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Bienvenido a tu aplicación personalizada para crear rutinas de entrenamiento adaptadas a tus objetivos.
            </p>
          </div>
          
          <div className="flex justify-center">
            <button 
              onClick={() => navigate('/crear-rutina')} 
              className="gradient-btn px-8 py-3 text-lg flex items-center group"
            >
              Crear Nueva Rutina
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Feature Cards with hover effects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {features.map((feature, index) => (
          <Card 
            key={index} 
            className="border border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-900 card-3d card-hover animate-fadeInUp bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm"
            style={{ animationDelay: `${(index + 1) * 100}ms` }}
          >
            <CardContent className="p-6">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 inline-block mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Benefits Section */}
      <div className="glass-card rounded-2xl p-8 mb-10 animate-fadeInUp card-3d">
        <h2 className="text-2xl font-bold mb-6 text-center gradient-text">Beneficios de Usar GymFlow</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center p-3 bg-white/60 dark:bg-gray-800/40 rounded-lg">
              <div className="mr-3">{benefit.icon}</div>
              <span className="font-medium">{benefit.text}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Quick Actions with improved visual hierarchy */}
      <div className="glass-card rounded-2xl p-6 animate-fadeInUp animate-delay-300 card-3d">
        <h2 className="text-2xl font-bold mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/crear-rutina')} 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl p-4 transition-all flex items-center justify-between group shadow-md hover:shadow-lg hover:shadow-purple-500/20"
          >
            <span className="font-medium">Crear Rutina</span>
            <Dumbbell className="h-5 w-5 transition-transform group-hover:scale-110" />
          </button>
          
          <button 
            onClick={() => navigate('/calculadora-imc')}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl p-4 transition-all flex items-center justify-between group shadow-md hover:shadow-lg hover:shadow-blue-500/20"
          >
            <span className="font-medium">Calculadora IMC</span>
            <BarChart className="h-5 w-5 transition-transform group-hover:scale-110" />
          </button>
          
          <button 
            onClick={() => navigate('/mi-rutina')}
            className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-xl p-4 transition-all flex items-center justify-between group shadow-md hover:shadow-lg hover:shadow-violet-500/20"
          >
            <span className="font-medium">Ver Mi Rutina</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
      
      {/* Testimonial */}
      <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-100 dark:border-purple-900/30 shadow-lg animate-fadeInUp animate-delay-300">
        <div className="flex flex-col items-center text-center">
          <div className="text-3xl mb-4">⭐️⭐️⭐️⭐️⭐️</div>
          <p className="text-lg italic text-gray-700 dark:text-gray-300 mb-4">
            "Esta aplicación ha transformado completamente mi rutina de ejercicios. ¡Nunca había sido tan fácil mantenerme en forma!"
          </p>
          <p className="font-semibold gradient-text">David - Usuario de GymFlow</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
