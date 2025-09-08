// Warehouse system configuration
export const WAREHOUSE_CONFIG = {
  // API Configuration
  USE_MOCK_API: import.meta.env.VITE_USE_MOCK_API === 'false', // Use real API by default
  API_BASE_URL: import.meta.env.VITE_API_URL,
  WS_URL: import.meta.env.VITE_WS_URL,
  
  // Feature flags
  
  // UI Configuration

  // Cache Configuration

  
  // File upload configuration
  UPLOAD: {
    MAX_FILE_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '5242880'), // 5MB
    ALLOWED_TYPES: (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(','),
    UPLOAD_ENDPOINT: '/v1/upload',
  },
  
  // Notification configuration
  NOTIFICATIONS: {
    TOAST_DURATION: 3000,
    MAX_NOTIFICATIONS: 10,
    ENABLE_SOUND: false,
  },
  
  // Mock API configuration

};

// Environment detection
export const getEnvironment = () => {
  return import.meta.env.MODE || 'development';
};

export const isDevelopment = () => {
  return getEnvironment() === 'development';
};

export const isProduction = () => {
  return getEnvironment() === 'production';
};

// API service selector - automatically chooses mock or real API
export const getApiService = () => {
  if (WAREHOUSE_CONFIG.USE_MOCK_API) {
    return import('../services/mockWarehouseApi');
  } else {
    return import('../services/warehouseApi');
  }
};

// Debug configuration
export const DEBUG_CONFIG = {
  ENABLE_CONSOLE_LOGS: isDevelopment(),
  ENABLE_API_LOGGING: isDevelopment(),
  ENABLE_PERFORMANCE_MONITORING: true,
  ENABLE_ERROR_REPORTING: isProduction(),
};

// Warehouse business rules
export const BUSINESS_RULES = {
  WAREHOUSE: {
    MIN_NAME_LENGTH: 3,
    MAX_NAME_LENGTH: 100,
    REQUIRED_FIELDS: ['name', 'location'],
    ALLOW_MULTIPLE_MAIN_WAREHOUSES: false,
  },
  
  INVENTORY: {
    MIN_STOCK_LEVEL: 0,
    MAX_STOCK_LEVEL: 999999,
    LOW_STOCK_THRESHOLD: 0.3, // 30%
    CRITICAL_STOCK_THRESHOLD: 0.1, // 10%
  },
  
  TRANSFERS: {
    MAX_QUANTITY_PER_REQUEST: 1000,
    AUTO_APPROVE_THRESHOLD: 10, // Auto-approve requests under 10 items
    REQUIRE_APPROVAL_ABOVE: 100,
  },
};

// Status definitions
export const STATUS_DEFINITIONS = {
  WAREHOUSE: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    MAINTENANCE: 'maintenance',
    ARCHIVED: 'archived',
  },
  
  PRODUCT: {
    REGULAR: 'regular',
    RETURNED: 'returned',
    REFURBISHED: 'refurbished',
    DAMAGED: 'damaged',
  },
  
  TRANSFER: {
    PENDING: 'pending',
    APPROVED: 'approved',
    IN_TRANSIT: 'in_transit',
    PARTIAL: 'partial',
    FULFILLED: 'fulfilled',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
  },
};

// Color scheme for status indicators
export const STATUS_COLORS = {
  SUCCESS: 'text-success bg-success/10',
  WARNING: 'text-warning bg-warning/10',
  ERROR: 'text-errorTwo bg-errorTwo/10',
  INFO: 'text-primary bg-primary/10',
  NEUTRAL: 'text-textDarkGrey bg-gray-100',
};

// Validation rules
export const VALIDATION_RULES = {
  warehouse: {
    name: {
      required: true,
      minLength: BUSINESS_RULES.WAREHOUSE.MIN_NAME_LENGTH,
      maxLength: BUSINESS_RULES.WAREHOUSE.MAX_NAME_LENGTH,
      pattern: /^[a-zA-Z0-9\s\-_]+$/,
    },
    location: {
      required: true,
      minLength: 5,
      maxLength: 200,
    },
  },
  
  product: {
    name: {
      required: true,
      minLength: 3,
      maxLength: 100,
    },
    category: {
      required: true,
      enum: ['solar', 'battery', 'inverter', 'accessory'],
    },
    stockLevel: {
      required: true,
      min: BUSINESS_RULES.INVENTORY.MIN_STOCK_LEVEL,
      max: BUSINESS_RULES.INVENTORY.MAX_STOCK_LEVEL,
    },
  },
  
  transfer: {
    quantity: {
      required: true,
      min: 1,
      max: BUSINESS_RULES.TRANSFERS.MAX_QUANTITY_PER_REQUEST,
    },
    fromWarehouse: {
      required: true,
    },
    toWarehouse: {
      required: true,
    },
    productId: {
      required: true,
    },
  },
};

// Export all configurations
export default WAREHOUSE_CONFIG;