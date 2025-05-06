
import React, { useState, useEffect } from 'react';
import { mysqlConnection } from '../utils/mysqlConnection';
import { Button } from '@/components/ui/button';
import { Trash2, RefreshCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DatabaseConnectionLogsProps {
  maxHeight?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const DatabaseConnectionLogs: React.FC<DatabaseConnectionLogsProps> = ({ 
  maxHeight = "300px", 
  autoRefresh = false,
  refreshInterval = 5000 
}) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Get logs from the connection
  const refreshLogs = () => {
    setLogs(mysqlConnection.getConnectionLogs());
    setIsConnected(mysqlConnection.isConnected());
  };

  // Initial load and auto-refresh if enabled
  useEffect(() => {
    refreshLogs();
    
    if (autoRefresh) {
      const interval = setInterval(refreshLogs, refreshInterval); 
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // Clear logs
  const handleClearLogs = () => {
    mysqlConnection.clearLogs();
    setLogs([]);
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Logs de Conexión</CardTitle>
          <Badge variant={isConnected ? "success" : "destructive"}>
            {isConnected ? "Conectado" : "Desconectado"}
          </Badge>
        </div>
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
        <ScrollArea className={`rounded border p-2 bg-muted/20`} style={{ maxHeight }}>
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
