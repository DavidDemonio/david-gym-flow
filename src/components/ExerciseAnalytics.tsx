import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Activity, Calendar, Clock, Flame, BarChart2, TrendingUp, History, Dumbbell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface WorkoutHistory {
  date: string;
  duration: number;
  calories: number;
  exercises: number;
  sets: number;
}

interface ExerciseAnalyticsProps {
  weeklyCalories: number;
  dailyCalories: number[];
  dayNames: string[];
  workoutHistory?: WorkoutHistory[];
}

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f97316', '#6366f1'];

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const ExerciseAnalytics: React.FC<ExerciseAnalyticsProps> = ({ weeklyCalories, dailyCalories, dayNames, workoutHistory = [] }) => {
  const dailyData = dayNames.map((day, index) => ({
    day,
    calories: dailyCalories[index]
  }));

  // Calculate stats from workout history
  const totalWorkouts = workoutHistory.length;
  const totalTime = workoutHistory.reduce((acc, workout) => acc + workout.duration, 0);
  const totalHistoryCalories = workoutHistory.reduce((acc, workout) => acc + workout.calories, 0);
  const averageCaloriesPerWorkout = totalWorkouts > 0 ? totalHistoryCalories / totalWorkouts : 0;
  
  // Prepare data for progress chart
  const progressData = workoutHistory.map(workout => ({
    date: formatDate(workout.date),
    calories: workout.calories,
    duration: workout.duration / 60, // Convert to minutes
    sets: workout.sets
  }));
  
  // Pie chart data
  const distributionData = dayNames.map((day, index) => ({
    name: day,
    value: dailyCalories[index]
  }));

  return (
    <div className="glass-card rounded-xl p-6 mb-8 animate-fadeInUp">
      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Historial de Entrenamientos
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Progreso
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Flame className="h-5 w-5 mr-2 text-orange-500" />
                  Resumen Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{weeklyCalories.toFixed(0)} <span className="text-lg font-normal text-gray-500 dark:text-gray-400">kcal</span></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Calorías quemadas por semana</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-green-500" />
                  Promedio Diario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {(weeklyCalories / dayNames.length).toFixed(0)}
                  <span className="text-lg font-normal text-gray-500 dark:text-gray-400"> kcal</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Calorías quemadas por día</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                  Total de Entrenamientos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{totalWorkouts}</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sesiones completadas</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-medium mb-4">Distribución de Calorías</h3>
            <Card className="w-full bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dailyData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis 
                        dataKey="day" 
                        tick={{ fill: '#888888' }} 
                        tickLine={{ stroke: '#888888' }} 
                        axisLine={{ stroke: '#888888' }}
                      />
                      <YAxis 
                        tick={{ fill: '#888888' }} 
                        tickLine={{ stroke: '#888888' }} 
                        axisLine={{ stroke: '#888888' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar
                        dataKey="calories"
                        fill="#8b5cf6"
                        radius={[4, 4, 0, 0]}
                        name="Calorías"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-medium mb-4">Distribución por Día</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="w-full bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-700">
                <CardContent className="pt-6">
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value} kcal`, 'Calorías']}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid gap-4">
                {dailyData.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center p-3 border rounded-lg bg-white dark:bg-gray-800/20 border-gray-100 dark:border-gray-700"
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-3" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="flex-grow">{item.day}</span>
                    <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700">
                      {item.calories} kcal
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          {workoutHistory.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-4 mb-6">
                <Card className="bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-purple-500" />
                      Total Entrenamientos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{workoutHistory.length}</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Flame className="h-5 w-5 mr-2 text-orange-500" />
                      Total Calorías
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{totalHistoryCalories.toFixed(0)}</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-blue-500" />
                      Tiempo Total
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{Math.floor(totalTime / 60)}m {totalTime % 60}s</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-green-500" />
                      Media por Sesión
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{averageCaloriesPerWorkout.toFixed(0)} kcal</div>
                  </CardContent>
                </Card>
              </div>
              
              <h3 className="text-xl font-medium mb-4">Histórico de Entrenamientos</h3>
              <div className="space-y-4">
                {[...workoutHistory].reverse().map((workout, index) => (
                  <Card 
                    key={index} 
                    className="bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 overflow-hidden"
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        <div className="bg-purple-50 dark:bg-purple-900/30 p-4 sm:w-32 flex flex-row sm:flex-col items-center justify-center">
                          <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400 mb-0 sm:mb-2 mr-2 sm:mr-0" />
                          <time className="text-sm font-medium text-purple-600 dark:text-purple-400">
                            {formatDate(workout.date)}
                          </time>
                        </div>
                        
                        <div className="p-4 flex-1">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Duración</p>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 text-blue-500 mr-1" />
                                <p className="font-medium">{formatTime(workout.duration)}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Calorías</p>
                              <div className="flex items-center">
                                <Flame className="h-4 w-4 text-orange-500 mr-1" />
                                <p className="font-medium">{workout.calories.toFixed(0)} kcal</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Ejercicios</p>
                              <div className="flex items-center">
                                <Dumbbell className="h-4 w-4 text-indigo-500 mr-1" />
                                <p className="font-medium">{workout.exercises}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Series</p>
                              <div className="flex items-center">
                                <Activity className="h-4 w-4 text-green-500 mr-1" />
                                <p className="font-medium">{workout.sets}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="mb-4">
                <History className="h-12 w-12 mx-auto text-gray-400" />
              </div>
              <h3 className="text-xl font-medium mb-2">No hay entrenamientos registrados</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                ¡Completa tu primer entrenamiento para comenzar a registrar tu historial! 
                Usa la función "Iniciar entrenamiento" en tu rutina.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="progress">
          {progressData.length > 0 ? (
            <>
              <h3 className="text-xl font-medium mb-4">Tu Progreso</h3>
              <Card className="w-full bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 mb-6">
                <CardHeader className="pb-0">
                  <CardTitle className="text-lg">Calorías por Sesión</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={progressData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fill: '#888888' }} 
                          tickLine={{ stroke: '#888888' }} 
                          axisLine={{ stroke: '#888888' }}
                        />
                        <YAxis 
                          tick={{ fill: '#888888' }} 
                          tickLine={{ stroke: '#888888' }} 
                          axisLine={{ stroke: '#888888' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="calories"
                          stroke="#8b5cf6"
                          name="Calorías"
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="w-full bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-700">
                <CardHeader className="pb-0">
                  <CardTitle className="text-lg">Tiempo y Series por Sesión</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={progressData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fill: '#888888' }} 
                          tickLine={{ stroke: '#888888' }} 
                          axisLine={{ stroke: '#888888' }}
                        />
                        <YAxis 
                          tick={{ fill: '#888888' }} 
                          tickLine={{ stroke: '#888888' }} 
                          axisLine={{ stroke: '#888888' }}
                          yAxisId="left"
                        />
                        <YAxis 
                          tick={{ fill: '#888888' }} 
                          tickLine={{ stroke: '#888888' }} 
                          axisLine={{ stroke: '#888888' }}
                          yAxisId="right"
                          orientation="right"
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="duration"
                          stroke="#3b82f6"
                          name="Duración (min)"
                          strokeWidth={2}
                          yAxisId="left"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="sets"
                          stroke="#10b981"
                          name="Series"
                          strokeWidth={2}
                          yAxisId="right"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="mb-4">
                <TrendingUp className="h-12 w-12 mx-auto text-gray-400" />
              </div>
              <h3 className="text-xl font-medium mb-2">No hay datos de progreso</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Completa algunos entrenamientos para comenzar a ver tu progreso a lo largo del tiempo.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExerciseAnalytics;
