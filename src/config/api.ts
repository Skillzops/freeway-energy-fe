// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  ENDPOINTS: {
    // Warehouse endpoints
    WAREHOUSES: '/v1/warehouses',
    WAREHOUSE_BY_ID: (id: string) => `/v1/warehouses/${id}`,
    WAREHOUSE_INVENTORY: (id: string) => `/v1/warehouses/${id}/inventory`,
    WAREHOUSE_METRICS: '/v1/warehouses/metrics',
    WAREHOUSE_TRANSFERS: (id: string) => `/v1/warehouses/${id}/transfers`,
    
    // Product endpoints
    PRODUCTS: '/v1/products',
    PRODUCT_BY_ID: (id: string) => `/v1/products/${id}`,
    PRODUCT_CATEGORIES: '/v1/products/categories',
    
    // Transfer request endpoints
    TRANSFER_REQUESTS: '/v1/transfer-requests',
    TRANSFER_REQUEST_BY_ID: (id: string) => `/v1/transfer-requests/${id}`,
    FULFILL_TRANSFER: (id: string) => `/v1/transfer-requests/${id}/fulfill`,
    
    // Inventory endpoints
    INVENTORY: '/v1/inventory',
    INVENTORY_BY_ID: (id: string) => `/v1/inventory/${id}`,
    INVENTORY_CATEGORIES: '/v1/inventory/categories',
    LOW_STOCK_ITEMS: '/v1/inventory/low-stock',
    
    // Analytics endpoints
    ANALYTICS_OVERVIEW: '/v1/analytics/overview',
    ANALYTICS_WAREHOUSE: (id: string) => `/v1/analytics/warehouses/${id}`,
    ANALYTICS_TRENDS: '/v1/analytics/trends',
  },
  
  // Request timeouts
  TIMEOUT: {
    DEFAULT: 10000, // 10 seconds
    UPLOAD: 30000,  // 30 seconds for file uploads
    LONG_RUNNING: 60000, // 1 minute for long operations
  },
  
  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
  
  // Cache settings
  CACHE: {
    WAREHOUSES_TTL: 5 * 60 * 1000, // 5 minutes
    PRODUCTS_TTL: 10 * 60 * 1000,  // 10 minutes
    TRANSFERS_TTL: 2 * 60 * 1000,  // 2 minutes
    METRICS_TTL: 1 * 60 * 1000,    // 1 minute
  },
};

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Request/Response interceptors configuration
export const API_INTERCEPTORS = {
  REQUEST: {
    // Add auth token to all requests
    AUTH: (config: any) => {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    
    // Add request timestamp
    TIMESTAMP: (config: any) => {
      config.metadata = { startTime: new Date() };
      return config;
    },
  },
  
  RESPONSE: {
    // Log response time
    TIMING: (response: any) => {
      const endTime = new Date();
      const startTime = response.config.metadata?.startTime;
      if (startTime) {
        const duration = endTime.getTime() - startTime.getTime();
        console.log(`API Call to ${response.config.url} took ${duration}ms`);
      }
      return response;
    },
    
    // Handle common error responses
    ERROR_HANDLER: (error: any) => {
      if (error.response?.status === 401) {
        // Handle unauthorized - redirect to login
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    },
  },
};

// Environment-specific configurations
export const ENV_CONFIG = {
  DEVELOPMENT: {
    API_URL: 'http://localhost:3001',
    DEBUG: true,
    MOCK_API: true, // Use mock data in development
  },
  
  STAGING: {
    API_URL: 'https://staging-api.example.com',
    DEBUG: true,
    MOCK_API: false,
  },
  
  PRODUCTION: {
    API_URL: 'https://api.example.com',
    DEBUG: false,
    MOCK_API: false,
  },
};

// Get current environment configuration
export const getCurrentConfig = () => {
  const env = import.meta.env.MODE || 'development';
  
  switch (env) {
    case 'staging':
      return ENV_CONFIG.STAGING;
    case 'production':
      return ENV_CONFIG.PRODUCTION;
    default:
      return ENV_CONFIG.DEVELOPMENT;
  }
};

// Feature flags for warehouse system
export const WAREHOUSE_FEATURES = {
  ENABLE_REAL_TIME_UPDATES: true,
  ENABLE_BULK_OPERATIONS: true,
  ENABLE_ADVANCED_ANALYTICS: true,
  ENABLE_BARCODE_SCANNING: false,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_EXPORT_FUNCTIONALITY: true,
  ENABLE_AUDIT_LOGS: true,
};