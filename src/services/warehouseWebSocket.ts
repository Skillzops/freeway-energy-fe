import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

// WebSocket event types
export interface WarehouseWebSocketEvent {
  type: 'warehouse_created' | 'warehouse_updated' | 'warehouse_deleted' | 
        'inventory_updated' | 'transfer_created' | 'transfer_fulfilled' |
        'stock_alert' | 'system_notification';
  data: any;
  timestamp: string;
  warehouseId?: string;
}

// WebSocket connection hook
export const useWarehouseWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WarehouseWebSocketEvent | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback((message: WarehouseWebSocketEvent) => {
    switch (message.type) {
      case 'warehouse_created':
        toast.success(`New warehouse "${message.data.name}" has been created`);
        break;
      
      case 'warehouse_updated':
        toast.info(`Warehouse "${message.data.name}" has been updated`);
        break;
      
      case 'warehouse_deleted':
        toast.warning(`Warehouse "${message.data.name}" has been deleted`);
        break;
      
      case 'inventory_updated':
        toast.info(`Inventory updated in ${message.data.warehouseName}`);
        break;
      
      case 'transfer_created':
        toast.info(`New transfer request created: ${message.data.id}`);
        break;
      
      case 'transfer_fulfilled':
        toast.success(`Transfer request ${message.data.id} has been fulfilled`);
        break;
      
      case 'stock_alert':
        toast.warning(`Low stock alert: ${message.data.productName} in ${message.data.warehouseName}`);
        break;
      
      case 'system_notification':
        toast.info(message.data.message);
        break;
      
      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  }, []);

  const connect = useCallback(() => {
    try {
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws';
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      wsRef.current = new WebSocket(`${wsUrl}?token=${token}`);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
        console.log('Warehouse WebSocket connected');
        
        // Subscribe to warehouse events
        wsRef.current?.send(JSON.stringify({
          type: 'subscribe',
          channels: ['warehouses', 'inventory', 'transfers']
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WarehouseWebSocketEvent = JSON.parse(event.data);
          setLastMessage(message);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        setIsConnected(false);
        console.log('Warehouse WebSocket disconnected:', event.code, event.reason);
        
        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('Warehouse WebSocket error:', error);
        setConnectionError('WebSocket connection failed');
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to establish connection');
    }
  }, [handleWebSocketMessage, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setLastMessage(null);
  }, []);

  const sendMessage = (message: any) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    connectionError,
    sendMessage,
    reconnect: connect,
    disconnect,
  };
};

// Real-time data synchronization hook
export const useRealTimeSync = (dataType: 'warehouses' | 'inventory' | 'transfers', mutateFunction: () => void) => {
  const { lastMessage } = useWarehouseWebSocket();

  useEffect(() => {
    if (!lastMessage) return;

    // Determine if we should refresh data based on the message type
    const shouldRefresh = (() => {
      switch (dataType) {
        case 'warehouses':
          return ['warehouse_created', 'warehouse_updated', 'warehouse_deleted'].includes(lastMessage.type);
        
        case 'inventory':
          return ['inventory_updated', 'warehouse_updated'].includes(lastMessage.type);
        
        case 'transfers':
          return ['transfer_created', 'transfer_fulfilled', 'transfer_updated'].includes(lastMessage.type);
        
        default:
          return false;
      }
    })();

    if (shouldRefresh) {
      // Add a small delay to ensure backend has processed the change
      setTimeout(() => {
        mutateFunction();
      }, 500);
    }
  }, [lastMessage, dataType, mutateFunction]);
};

// Notification management for warehouse events
export const useWarehouseNotificationManager = () => {
  const [notifications, setNotifications] = useState<WarehouseWebSocketEvent[]>([]);
  const { lastMessage } = useWarehouseWebSocket();

  useEffect(() => {
    if (lastMessage) {
      setNotifications(prev => [lastMessage, ...prev.slice(0, 9)]); // Keep last 10 notifications
    }
  }, [lastMessage]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (timestamp: string) => {
    setNotifications(prev => prev.filter(n => n.timestamp !== timestamp));
  };

  return {
    notifications,
    clearNotifications,
    removeNotification,
    hasUnreadNotifications: notifications.length > 0,
  };
};
