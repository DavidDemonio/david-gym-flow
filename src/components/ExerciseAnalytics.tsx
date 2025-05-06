
import { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { Activity, BarChart3, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ExerciseAnalyticsProps {
  weeklyCalories: number;
  dailyCalories: number[];
  dayNames: string[];
}

const COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#D946EF'];

const ExerciseAnalytics = ({ weeklyCalories, dailyCalories, dayNames }: ExerciseAnalyticsProps) => {
  const [activeChart, setActiveChart] = useState<'bar' | 'line' | 'pie'>('bar');
  const isMobile = useIsMobile();
  
  const dailyData = dayNames.map((day, index) => ({
    name: day,
    calories: dailyCalories[index] || 0,
  }));
  
  const weeklyDistribution = dailyData.map((item, index) => ({
    name: item.name,
    value: item.calories,
    color: COLORS[index % COLORS.length]
  }));

  // Stats for the summary cards
  const totalDays = dayNames.length;
  const totalCalories = weeklyCalories;
  const avgCaloriesPerDay = totalDays > 0 ? Math.round(totalCalories / totalDays) : 0;
  const maxCaloriesDay = [...dailyData].sort((a, b) => b.calories - a.calories)[0]?.name || 'Ninguno';
  
  return (
    <div className="glass-card rounded-xl p-6 mb-8 animate-fadeInUp">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold flex items-center">
          <BarChart3 className="mr-2 h-5 w-5 text-purple-600" />
          Analytics de Entrenamiento
        </h2>
        
        <Tabs value={activeChart} onValueChange={(value: any) => setActiveChart(value)} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-3 w-full md:w-auto">
            <TabsTrigger value="bar" className="text-xs px-3 py-1 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              Barras
            </TabsTrigger>
            <TabsTrigger value="line" className="text-xs px-3 py-1 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              Línea
            </TabsTrigger>
            <TabsTrigger value="pie" className="text-xs px-3 py-1 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              Circular
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white/80 hover:shadow-md transition-all hover:-translate-y-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center text-purple-700">
              <Activity className="h-4 w-4 mr-1" />
              Total Calorías
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalCalories}</p>
            <CardDescription>kcal / semana</CardDescription>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 hover:shadow-md transition-all hover:-translate-y-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center text-blue-700">
              <Calendar className="h-4 w-4 mr-1" />
              Días de Entrenamiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalDays}</p>
            <CardDescription>días / semana</CardDescription>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 hover:shadow-md transition-all hover:-translate-y-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center text-pink-700">
              <Clock className="h-4 w-4 mr-1" />
              Promedio Diario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{avgCaloriesPerDay}</p>
            <CardDescription>kcal / día</CardDescription>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 hover:shadow-md transition-all hover:-translate-y-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center text-indigo-700">
              <BarChart3 className="h-4 w-4 mr-1" />
              Día Más Intenso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-md font-bold truncate">{maxCaloriesDay}</p>
            <CardDescription>mayor quema</CardDescription>
          </CardContent>
        </Card>
      </div>
      
      <div className="h-[300px] md:h-[400px]">
        <TabsContent value="bar" className="mt-0 h-full">
          <ChartContainer 
            config={{
              calories: {
                theme: {
                  light: '#8B5CF6',
                  dark: '#A78BFA'
                }
              }
            }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyData}
                margin={{
                  top: 20,
                  right: isMobile ? 0 : 30,
                  left: isMobile ? 0 : 20,
                  bottom: 5,
                }}
                barSize={isMobile ? 15 : 30}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" scale="point" padding={{ left: 10, right: 10 }} />
                <YAxis
                  label={{ value: 'Calorías', angle: -90, position: 'insideLeft', dx: -20 }}
                  width={40}
                />
                <Tooltip
                  content={<ChartTooltipContent />}
                />
                <Legend />
                <Bar 
                  dataKey="calories" 
                  name="Calorías"
                  fill="var(--color-calories)" 
                  radius={[4, 4, 0, 0]}
                  className="animate-fade-in"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </TabsContent>
        
        <TabsContent value="line" className="mt-0 h-full">
          <ChartContainer
            config={{
              calories: {
                theme: {
                  light: '#8B5CF6',
                  dark: '#A78BFA'
                }
              }
            }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dailyData}
                margin={{
                  top: 20,
                  right: isMobile ? 0 : 30,
                  left: isMobile ? 0 : 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" />
                <YAxis
                  label={{ value: 'Calorías', angle: -90, position: 'insideLeft', dx: -20 }}
                  width={40}
                />
                <Tooltip
                  content={<ChartTooltipContent />}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="calories" 
                  name="Calorías"
                  stroke="var(--color-calories)" 
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                  className="animate-fade-in"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </TabsContent>
        
        <TabsContent value="pie" className="mt-0 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={weeklyDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={isMobile ? 80 : 120}
                fill="#8884d8"
                dataKey="value"
                className="animate-fade-in"
              >
                {weeklyDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} kcal`, "Calorías"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </TabsContent>
      </div>
      
      <div className="mt-4 text-sm text-gray-600 text-center">
        Basado en un estimado de quema calórica por ejercicio. Los valores reales pueden variar.
      </div>
    </div>
  );
};

export default ExerciseAnalytics;
