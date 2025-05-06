
import React, { useState, useEffect } from 'react';
import { mysqlConnection } from '../utils/mysqlConnection';
import { Button } from '@/components/ui/button';
import { Trash2, RefreshCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DatabaseConnectionLogsProps {
  maxHeight?: string;
  autoRefresh?: boolean;
}

const DatabaseConnectionLogs: React.FC<DatabaseConnectionLogsProps> = ({ 
  maxHeight = "300px", 
  autoRefresh = false 
}) => {
  const [logs, setLogs] = useState<string[]>([]);

  // Get logs from the connection
  const refreshLogs = () => {
    setLogs(mysqlConnection.getConnectionLogs());
  };

  // Initial load and auto-refresh if enabled
  useEffect(() => {
    refreshLogs();
    
    if (autoRefresh) {
      const interval = setInterval(refreshLogs, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Clear logs
  const handleClearLogs = () => {
    mysqlConnection.clearLogs();
    setLogs([]);
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Logs de Conexión</CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={refreshLogs}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Actualizar
          </Button>
          <Button size="sm" variant="outline" onClick={handleClearLogs}>
            <Trash2 className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className={`rounded border p-2 bg-muted/20 max-h-[${maxHeight}]`}>
          {logs.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center">No hay registros de actividad.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {logs.map((log, index) => (
                <div 
                  key={index} 
                  className="text-xs font-mono py-1 border-b border-dashed border-muted last:border-0"
                >
                  {log}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DatabaseConnectionLogs;
