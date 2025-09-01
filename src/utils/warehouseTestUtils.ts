import { toast } from 'react-toastify';
import { mockWarehouseApi } from '../services/mockWarehouseApi';
import type { Warehouse, Product, TransferRequest } from '../data/warehouseData';

// Test utilities for warehouse system
export class WarehouseTestRunner {
  private testResults: { name: string; passed: boolean; error?: string }[] = [];

  async runAllTests() {
    console.log('🧪 Starting Warehouse System Tests...');
    
    await this.testWarehouseOperations();
    await this.testInventoryOperations();
    await this.testTransferOperations();
    await this.testErrorHandling();
    
    this.displayResults();
    return this.testResults;
  }

  private async testWarehouseOperations() {
    console.log('📦 Testing Warehouse Operations...');

    // Test: Create Warehouse
    try {
      const newWarehouse = {
        name: 'Test Warehouse',
        location: 'Test Location',
        totalItems: 0,
        totalValue: 0,
        isMainWarehouse: false,
        isActive: true,
        image: '/test-image.jpg',
      };

      const response = await mockWarehouseApi.createWarehouse(newWarehouse);
      this.addTestResult('Create Warehouse', response.success && response.data.name === 'Test Warehouse');
    } catch (error) {
      this.addTestResult('Create Warehouse', false, String(error));
    }

    // Test: Get Warehouses
    try {
      const response = await mockWarehouseApi.getWarehouses();
      this.addTestResult('Get Warehouses', response.success && Array.isArray(response.data));
    } catch (error) {
      this.addTestResult('Get Warehouses', false, String(error));
    }

    // Test: Update Warehouse
    try {
      const response = await mockWarehouseApi.updateWarehouse('main', { name: 'Updated Main Warehouse' });
      this.addTestResult('Update Warehouse', response.success);
    } catch (error) {
      this.addTestResult('Update Warehouse', false, String(error));
    }

    // Test: Toggle Warehouse Status
    try {
      const response = await mockWarehouseApi.toggleWarehouseStatus('main', false);
      this.addTestResult('Toggle Warehouse Status', response.success);
    } catch (error) {
      this.addTestResult('Toggle Warehouse Status', false, String(error));
    }
  }

  private async testInventoryOperations() {
    console.log('📋 Testing Inventory Operations...');

    // Test: Get Products
    try {
      const response = await mockWarehouseApi.getProducts();
      this.addTestResult('Get Products', response.success && Array.isArray(response.data));
    } catch (error) {
      this.addTestResult('Get Products', false, String(error));
    }

    // Test: Add Inventory Item
    try {
      const inventoryData = {
        name: 'Test Solar Panel',
        category: 'solar',
        status: 'regular',
        stockLevel: 50,
        maxCapacity: 50,
        salePrice: 75000,
        inventoryValue: 3750000,
      };

      const response = await mockWarehouseApi.addInventoryItem('main', inventoryData);
      this.addTestResult('Add Inventory Item', response.success);
    } catch (error) {
      this.addTestResult('Add Inventory Item', false, String(error));
    }

    // Test: Get Warehouse Inventory
    try {
      const response = await mockWarehouseApi.getWarehouseInventory('main');
      this.addTestResult('Get Warehouse Inventory', response.success && Array.isArray(response.data));
    } catch (error) {
      this.addTestResult('Get Warehouse Inventory', false, String(error));
    }
  }

  private async testTransferOperations() {
    console.log('🔄 Testing Transfer Operations...');

    // Test: Create Transfer Request
    try {
      const transferData = {
        fromWarehouse: 'main',
        toWarehouse: 'lagos-south',
        productId: '1',
        requestedQuantity: 5,
        notes: 'Test transfer request',
      };

      const response = await mockWarehouseApi.createTransferRequest(transferData);
      this.addTestResult('Create Transfer Request', response.success);
    } catch (error) {
      this.addTestResult('Create Transfer Request', false, String(error));
    }

    // Test: Get Transfer Requests
    try {
      const response = await mockWarehouseApi.getTransferRequests();
      this.addTestResult('Get Transfer Requests', response.success && Array.isArray(response.data));
    } catch (error) {
      this.addTestResult('Get Transfer Requests', false, String(error));
    }

    // Test: Fulfill Transfer Request
    try {
      const response = await mockWarehouseApi.fulfillTransferRequest('tr-001', 8, 'fulfilled', 'Test fulfillment');
      this.addTestResult('Fulfill Transfer Request', response.success);
    } catch (error) {
      this.addTestResult('Fulfill Transfer Request', false, String(error));
    }
  }

  private async testErrorHandling() {
    console.log('⚠️ Testing Error Handling...');

    // Test: Invalid Warehouse Creation
    try {
      await mockWarehouseApi.createWarehouse({ name: '', location: '', totalItems: 0, totalValue: 0, isMainWarehouse: false, isActive: true, image: '' });
      this.addTestResult('Invalid Warehouse Creation Error', false, 'Should have thrown an error');
    } catch (error) {
      this.addTestResult('Invalid Warehouse Creation Error', true);
    }

    // Test: Non-existent Warehouse
    try {
      await mockWarehouseApi.getWarehouse('non-existent');
      this.addTestResult('Non-existent Warehouse Error', false, 'Should have thrown an error');
    } catch (error) {
      this.addTestResult('Non-existent Warehouse Error', true);
    }

    // Test: Invalid Transfer Request
    try {
      await mockWarehouseApi.createTransferRequest({
        fromWarehouse: '',
        toWarehouse: '',
        productId: '',
        requestedQuantity: 0,
      });
      this.addTestResult('Invalid Transfer Request Error', false, 'Should have thrown an error');
    } catch (error) {
      this.addTestResult('Invalid Transfer Request Error', true);
    }
  }

  private addTestResult(name: string, passed: boolean, error?: string) {
    this.testResults.push({ name, passed, error });
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${name}${error ? ` - ${error}` : ''}`);
  }

  private displayResults() {
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    const percentage = Math.round((passed / total) * 100);

    console.log('\n📊 Test Results Summary:');
    console.log(`${passed}/${total} tests passed (${percentage}%)`);
    
    if (passed === total) {
      console.log('🎉 All tests passed! Warehouse system is ready.');
      toast.success(`Warehouse system tests passed: ${passed}/${total}`);
    } else {
      console.log('⚠️ Some tests failed. Check console for details.');
      toast.warning(`Warehouse system tests: ${passed}/${total} passed`);
    }

    // Display failed tests
    const failedTests = this.testResults.filter(r => !r.passed);
    if (failedTests.length > 0) {
      console.log('\n❌ Failed Tests:');
      failedTests.forEach(test => {
        console.log(`- ${test.name}: ${test.error || 'Unknown error'}`);
      });
    }
  }
}

// Performance testing utilities
export class WarehousePerformanceTest {
  async testApiResponseTimes() {
    console.log('⚡ Testing API Response Times...');

    const tests = [
      { name: 'Get Warehouses', fn: () => mockWarehouseApi.getWarehouses() },
      { name: 'Get Products', fn: () => mockWarehouseApi.getProducts() },
      { name: 'Get Transfer Requests', fn: () => mockWarehouseApi.getTransferRequests() },
      { name: 'Get Warehouse Metrics', fn: () => mockWarehouseApi.getWarehouseMetrics() },
    ];

    const results = [];

    for (const test of tests) {
      const startTime = performance.now();
      try {
        await test.fn();
        const endTime = performance.now();
        const duration = endTime - startTime;
        results.push({ name: test.name, duration, success: true });
        console.log(`✅ ${test.name}: ${duration.toFixed(2)}ms`);
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        results.push({ name: test.name, duration, success: false, error });
        console.log(`❌ ${test.name}: ${duration.toFixed(2)}ms (Failed)`);
      }
    }

    const avgResponseTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    console.log(`📈 Average Response Time: ${avgResponseTime.toFixed(2)}ms`);

    return results;
  }
}

// Data validation utilities
export const validateWarehouseData = (data: Partial<Warehouse>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.name || data.name.length < 3) {
    errors.push('Warehouse name must be at least 3 characters long');
  }

  if (!data.location || data.location.length < 5) {
    errors.push('Location must be at least 5 characters long');
  }

  if (data.totalItems !== undefined && data.totalItems < 0) {
    errors.push('Total items cannot be negative');
  }

  if (data.totalValue !== undefined && data.totalValue < 0) {
    errors.push('Total value cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateProductData = (data: Partial<Product>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.name || data.name.length < 3) {
    errors.push('Product name must be at least 3 characters long');
  }

  if (!data.category || !['solar', 'battery', 'inverter', 'accessory'].includes(data.category)) {
    errors.push('Valid category is required');
  }

  if (data.stockLevel !== undefined && data.stockLevel < 0) {
    errors.push('Stock level cannot be negative');
  }

  if (data.salePrice !== undefined && data.salePrice <= 0) {
    errors.push('Sale price must be greater than 0');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateTransferData = (data: Partial<TransferRequest>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.fromWarehouse) {
    errors.push('From warehouse is required');
  }

  if (!data.toWarehouse) {
    errors.push('To warehouse is required');
  }

  if (data.fromWarehouse === data.toWarehouse) {
    errors.push('From and to warehouses cannot be the same');
  }

  if (!data.productId) {
    errors.push('Product is required');
  }

  if (!data.requestedQuantity || data.requestedQuantity <= 0) {
    errors.push('Requested quantity must be greater than 0');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Development utilities
export const warehouseDevUtils = {
  // Run comprehensive tests
  runTests: async () => {
    const testRunner = new WarehouseTestRunner();
    return await testRunner.runAllTests();
  },

  // Run performance tests
  runPerformanceTests: async () => {
    const perfTest = new WarehousePerformanceTest();
    return await perfTest.testApiResponseTimes();
  },

  // Clear all data (development only)
  clearAllData: () => {
    if (import.meta.env.MODE === 'development') {
      localStorage.removeItem('warehouse-data');
      sessionStorage.removeItem('warehouse-cache');
      console.log('🗑️ All warehouse data cleared');
      toast.info('Warehouse data cleared');
    } else {
      console.warn('⚠️ Data clearing is only available in development mode');
    }
  },

  // Generate test data
  generateTestData: () => {
    console.log('🎲 Generating test data...');
    // This would generate additional test warehouses, products, and transfers
    toast.info('Test data generated');
  },

  // Export system state
  exportSystemState: () => {
    const state = {
      timestamp: new Date().toISOString(),
      environment: import.meta.env.MODE,
      config: {
        useMockApi: true,
        features: {
          realTimeUpdates: true,
          bulkOperations: true,
          analytics: true,
        },
      },
    };

    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `warehouse-system-state-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('System state exported');
  },
};

// Make test utilities available globally in development
if (import.meta.env.MODE === 'development') {
  (window as any).warehouseDevUtils = warehouseDevUtils;
  console.log('🛠️ Warehouse dev utilities available at window.warehouseDevUtils');
}