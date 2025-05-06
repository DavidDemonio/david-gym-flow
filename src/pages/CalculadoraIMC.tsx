
import { useState, useEffect } from 'react';
import { Scale, Info } from 'lucide-react';

interface IMCCategory {
  name: string;
  range: string;
  description: string;
  color: string;
}

const imcCategories: IMCCategory[] = [
  {
    name: 'Bajo peso',
    range: 'IMC < 18.5',
    description: 'Puede indicar malnutrición o problemas de salud.',
    color: 'bg-blue-500'
  },
  {
    name: 'Normal',
    range: '18.5 - 24.9',
    description: 'Peso saludable, mantén buenos hábitos.',
    color: 'bg-green-500'
  },
  {
    name: 'Sobrepeso',
    range: '25 - 29.9',
    description: 'Considera mejorar tu dieta y aumentar la actividad física.',
    color: 'bg-yellow-500'
  },
  {
    name: 'Obesidad',
    range: 'IMC ≥ 30',
    description: 'Mayor riesgo de problemas de salud, consulta a un profesional.',
    color: 'bg-red-500'
  }
];

const CalculadoraIMC = () => {
  const [peso, setPeso] = useState(70);
  const [altura, setAltura] = useState(170);
  const [imc, setIMC] = useState(0);
  const [categoria, setCategoria] = useState<IMCCategory>(imcCategories[1]);

  // Calcular IMC cuando cambian peso o altura
  useEffect(() => {
    // Formula: peso (kg) / (altura (m))^2
    const alturaEnMetros = altura / 100;
    const imcCalculado = peso / (alturaEnMetros * alturaEnMetros);
    setIMC(parseFloat(imcCalculado.toFixed(1)));
    
    // Determinar categoría
    if (imcCalculado < 18.5) {
      setCategoria(imcCategories[0]);
    } else if (imcCalculado >= 18.5 && imcCalculado < 25) {
      setCategoria(imcCategories[1]);
    } else if (imcCalculado >= 25 && imcCalculado < 30) {
      setCategoria(imcCategories[2]);
    } else {
      setCategoria(imcCategories[3]);
    }
  }, [peso, altura]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 gradient-text flex items-center">
          <Scale className="mr-3 h-8 w-8" /> 
          Calculadora de IMC
        </h1>
        <p className="text-gray-600 mb-8">Calcula tu Índice de Masa Corporal y conoce tu estado de salud</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sección con sliders */}
          <div className="glass-card rounded-xl p-6 animate-fadeInUp">
            <h2 className="text-xl font-semibold mb-6">Ingresa tus datos</h2>
            
            <div className="space-y-8">
              {/* Slider de peso */}
              <div>
                <div className="flex justify-between mb-2">
                  <label htmlFor="peso" className="text-sm font-medium text-gray-700">Peso (kg)</label>
                  <span className="text-sm font-semibold">{peso} kg</span>
                </div>
                <input
                  id="peso"
                  type="range"
                  min="30"
                  max="150"
                  step="0.5"
                  value={peso}
                  onChange={(e) => setPeso(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>30</span>
                  <span>150</span>
                </div>
              </div>
              
              {/* Slider de altura */}
              <div>
                <div className="flex justify-between mb-2">
                  <label htmlFor="altura" className="text-sm font-medium text-gray-700">Altura (cm)</label>
                  <span className="text-sm font-semibold">{altura} cm</span>
                </div>
                <input
                  id="altura"
                  type="range"
                  min="140"
                  max="220"
                  step="1"
                  value={altura}
                  onChange={(e) => setAltura(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>140</span>
                  <span>220</span>
                </div>
              </div>
              
              {/* Resultado del IMC */}
              <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-100">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Tu IMC es</h3>
                <p className="text-4xl font-bold gradient-text">{imc}</p>
                <p className="mt-2 font-medium text-lg">{categoria.name}</p>
                <div className={`h-2 rounded-full ${categoria.color} mt-3`}></div>
              </div>
            </div>
          </div>
          
          {/* Sección con tabla de categorías */}
          <div className="glass-card rounded-xl p-6 animate-fadeInUp animate-delay-100">
            <h2 className="text-xl font-semibold mb-6">Interpretación del IMC</h2>
            
            <div className="space-y-4">
              {imcCategories.map((cat, index) => (
                <div 
                  key={index}
                  className={`p-4 border rounded-lg ${
                    categoria.name === cat.name 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    <div className={`w-3 h-3 rounded-full ${cat.color} mr-2`}></div>
                    <h3 className="font-semibold">{cat.name}</h3>
                    <span className="ml-auto text-sm text-gray-500">{cat.range}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{cat.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 flex">
              <Info className="text-blue-500 h-5 w-5 mr-3 flex-shrink-0 mt-1" />
              <p className="text-sm text-blue-700">
                El IMC es un indicador general pero no considera otros factores como la composición corporal. 
                Consulta siempre con un profesional de la salud para una evaluación completa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculadoraIMC;
