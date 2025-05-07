
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatabaseIcon, MailIcon, UserIcon, Settings } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { Button } from '@/components/ui/button';
import { mysqlConnection } from '../utils/mysqlConnection';
import DatabaseSettingsForm from '../components/DatabaseSettingsForm';
import { EmailSettingsForm } from '../components/EmailSettingsForm';
import UserSettingsForm from '../components/UserSettingsForm';
import { EnvEditor } from '../components/EnvEditor';  // Import with curly braces since we're importing a named export
import RoutinesDatabaseSettings from '../components/RoutinesDatabaseSettings';

const Ajustes = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('database');
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    // Check if we're already connected to MySQL
    const connected = mysqlConnection.isConnected();
    setIsConnected(connected);
    
    // Try to load environment variables
    const loadEnvironmentVariables = async () => {
      try {
        await mysqlConnection.loadEnvironmentVariables();
      } catch (err) {
        console.error("Error loading environment variables:", err);
      }
    };
    
    loadEnvironmentVariables();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 gradient-text">Ajustes</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="database" className="flex items-center gap-2">
              <DatabaseIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Base de Datos</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <MailIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="user" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Usuario</span>
            </TabsTrigger>
            <TabsTrigger value="env" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Avanzado</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="database" className="space-y-6">
            <DatabaseSettingsForm />
            <RoutinesDatabaseSettings />
          </TabsContent>
          
          <TabsContent value="email">
            <EmailSettingsForm />
          </TabsContent>
          
          <TabsContent value="user">
            <UserSettingsForm />
          </TabsContent>
          
          <TabsContent value="env">
            <EnvEditor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Ajustes;
