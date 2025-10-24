import React from 'react';
import { 
  WifiIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { useWebSocket } from '../../hooks/useWebSocket';

const ConnectionStatus: React.FC = () => {
  const { isConnected, connectionError } = useWebSocket();

  if (connectionError) {
    return (
      <div className="flex items-center space-x-2 text-red-600">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <span className="text-sm">Conexión perdida</span>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <CheckCircleIcon className="h-4 w-4" />
        <span className="text-sm">Conectado</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-yellow-600">
      <WifiIcon className="h-4 w-4 animate-pulse" />
      <span className="text-sm">Conectando...</span>
    </div>
  );
};

export default ConnectionStatus;
