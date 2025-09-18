// Centralized state management for Finance Simulator

import { FinanceEngine } from './finance-engine';
import { FinancialDataValidator, ValidationResult } from './validation';

export interface AppState {
  data: any;
  scenarios: Record<string, any>;
  currentScenario: string;
  computationResult: any;
  validationResults: ValidationResult[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string;
}

export interface StateUpdate {
  type: 'DATA_UPDATE' | 'SCENARIO_UPDATE' | 'COMPUTATION_UPDATE' | 'VALIDATION_UPDATE' | 'ERROR_UPDATE' | 'LOADING_UPDATE';
  payload: any;
}

export class StateManager {
  private state: AppState;
  private financeEngine: FinanceEngine;
  private subscribers: Array<(state: AppState) => void> = [];
  private validationCache: Map<string, ValidationResult> = new Map();

  constructor() {
    this.financeEngine = new FinanceEngine();
    this.state = this.getInitialState();
    this.initializeState();
  }

  private getInitialState(): AppState {
    return {
      data: null,
      scenarios: {},
      currentScenario: 'base',
      computationResult: null,
      validationResults: [],
      isLoading: false,
      error: null,
      lastUpdated: new Date().toISOString()
    };
  }

  private initializeState(): void {
    try {
      this.financeEngine.init();
      const data = this.financeEngine.getData();
      const scenarios = this.financeEngine.getScenarios();
      
      this.updateState({
        type: 'DATA_UPDATE',
        payload: { data, scenarios }
      });
      
      this.computeAndValidate();
    } catch (error) {
      this.updateState({
        type: 'ERROR_UPDATE',
        payload: { error: `Failed to initialize: ${error.message}` }
      });
    }
  }

  // State management methods
  updateState(update: StateUpdate): void {
    try {
      const previousState = { ...this.state };
      
      switch (update.type) {
        case 'DATA_UPDATE':
          this.state.data = update.payload.data;
          this.state.scenarios = update.payload.scenarios;
          break;
          
        case 'SCENARIO_UPDATE':
          this.state.currentScenario = update.payload.scenarioId;
          break;
          
        case 'COMPUTATION_UPDATE':
          this.state.computationResult = update.payload.result;
          break;
          
        case 'VALIDATION_UPDATE':
          this.state.validationResults = update.payload.results;
          break;
          
        case 'ERROR_UPDATE':
          this.state.error = update.payload.error;
          this.state.isLoading = false;
          break;
          
        case 'LOADING_UPDATE':
          this.state.isLoading = update.payload.isLoading;
          if (update.payload.isLoading) {
            this.state.error = null;
          }
          break;
      }
      
      this.state.lastUpdated = new Date().toISOString();
      
      // Notify subscribers
      this.notifySubscribers();
      
      // Auto-save on data changes
      if (update.type === 'DATA_UPDATE') {
        this.autoSave();
      }
    } catch (error) {
      console.error('Error updating state:', error);
      this.updateState({
        type: 'ERROR_UPDATE',
        payload: { error: `State update failed: ${error.message}` }
      });
    }
  }

  // Subscription management
  subscribe(callback: (state: AppState) => void): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback(this.state);
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    });
  }

  // Data management methods
  updateMenu(menuId: string, updates: any): void {
    try {
      this.updateState({ type: 'LOADING_UPDATE', payload: { isLoading: true } });
      
      // Validate updates
      const validationResult = FinancialDataValidator.validateMenuItem(updates);
      if (!validationResult.isValid) {
        this.updateState({
          type: 'ERROR_UPDATE',
          payload: { error: `Menu validation failed: ${validationResult.errors.join(', ')}` }
        });
        return;
      }
      
      this.financeEngine.updateMenu(menuId, updates);
      const data = this.financeEngine.getData();
      
      this.updateState({
        type: 'DATA_UPDATE',
        payload: { data, scenarios: this.state.scenarios }
      });
      
      this.computeAndValidate();
    } catch (error) {
      this.updateState({
        type: 'ERROR_UPDATE',
        payload: { error: `Failed to update menu: ${error.message}` }
      });
    }
  }

  updateSalesModel(updates: any): void {
    try {
      this.updateState({ type: 'LOADING_UPDATE', payload: { isLoading: true } });
      
      // Validate updates
      const validationResult = FinancialDataValidator.validateSalesModel(updates);
      if (!validationResult.isValid) {
        this.updateState({
          type: 'ERROR_UPDATE',
          payload: { error: `Sales model validation failed: ${validationResult.errors.join(', ')}` }
        });
        return;
      }
      
      this.financeEngine.updateSalesModel(updates);
      const data = this.financeEngine.getData();
      
      this.updateState({
        type: 'DATA_UPDATE',
        payload: { data, scenarios: this.state.scenarios }
      });
      
      this.computeAndValidate();
    } catch (error) {
      this.updateState({
        type: 'ERROR_UPDATE',
        payload: { error: `Failed to update sales model: ${error.message}` }
      });
    }
  }

  updateUtilities(utilities: any[]): void {
    try {
      this.updateState({ type: 'LOADING_UPDATE', payload: { isLoading: true } });
      
      // Validate each utility
      const validationResults = utilities.map(utility => 
        FinancialDataValidator.validateUtilityItem(utility)
      );
      
      const hasErrors = validationResults.some(result => !result.isValid);
      if (hasErrors) {
        const errors = validationResults
          .filter(result => !result.isValid)
          .flatMap(result => result.errors);
        
        this.updateState({
          type: 'ERROR_UPDATE',
          payload: { error: `Utility validation failed: ${errors.join(', ')}` }
        });
        return;
      }
      
      this.financeEngine.updateUtilities(utilities);
      const data = this.financeEngine.getData();
      
      this.updateState({
        type: 'DATA_UPDATE',
        payload: { data, scenarios: this.state.scenarios }
      });
      
      this.computeAndValidate();
    } catch (error) {
      this.updateState({
        type: 'ERROR_UPDATE',
        payload: { error: `Failed to update utilities: ${error.message}` }
      });
    }
  }

  updateLabor(labor: any[]): void {
    try {
      this.updateState({ type: 'LOADING_UPDATE', payload: { isLoading: true } });
      
      // Validate each labor item
      const validationResults = labor.map(item => 
        FinancialDataValidator.validateLaborItem(item)
      );
      
      const hasErrors = validationResults.some(result => !result.isValid);
      if (hasErrors) {
        const errors = validationResults
          .filter(result => !result.isValid)
          .flatMap(result => result.errors);
        
        this.updateState({
          type: 'ERROR_UPDATE',
          payload: { error: `Labor validation failed: ${errors.join(', ')}` }
        });
        return;
      }
      
      this.financeEngine.updateLabor(labor);
      const data = this.financeEngine.getData();
      
      this.updateState({
        type: 'DATA_UPDATE',
        payload: { data, scenarios: this.state.scenarios }
      });
      
      this.computeAndValidate();
    } catch (error) {
      this.updateState({
        type: 'ERROR_UPDATE',
        payload: { error: `Failed to update labor: ${error.message}` }
      });
    }
  }

  updateFixedCosts(fixedCosts: any[]): void {
    try {
      this.updateState({ type: 'LOADING_UPDATE', payload: { isLoading: true } });
      
      // Validate each fixed cost
      const validationResults = fixedCosts.map(cost => 
        FinancialDataValidator.validateFixedCost(cost)
      );
      
      const hasErrors = validationResults.some(result => !result.isValid);
      if (hasErrors) {
        const errors = validationResults
          .filter(result => !result.isValid)
          .flatMap(result => result.errors);
        
        this.updateState({
          type: 'ERROR_UPDATE',
          payload: { error: `Fixed cost validation failed: ${errors.join(', ')}` }
        });
        return;
      }
      
      this.financeEngine.updateFixedCosts(fixedCosts);
      const data = this.financeEngine.getData();
      
      this.updateState({
        type: 'DATA_UPDATE',
        payload: { data, scenarios: this.state.scenarios }
      });
      
      this.computeAndValidate();
    } catch (error) {
      this.updateState({
        type: 'ERROR_UPDATE',
        payload: { error: `Failed to update fixed costs: ${error.message}` }
      });
    }
  }

  // Computation and validation
  private computeAndValidate(): void {
    try {
      // Compute financial metrics
      const computationResult = this.financeEngine.compute();
      
      this.updateState({
        type: 'COMPUTATION_UPDATE',
        payload: { result: computationResult }
      });
      
      // Validate all data
      this.validateAllData();
      
      this.updateState({ type: 'LOADING_UPDATE', payload: { isLoading: false } });
    } catch (error) {
      this.updateState({
        type: 'ERROR_UPDATE',
        payload: { error: `Computation failed: ${error.message}` }
      });
    }
  }

  private validateAllData(): void {
    try {
      const dataHash = JSON.stringify(this.state.data);
      const cachedResult = this.validationCache.get(dataHash);
      
      if (cachedResult) {
        this.updateState({
          type: 'VALIDATION_UPDATE',
          payload: { results: [cachedResult] }
        });
        return;
      }
      
      const validationResult = FinancialDataValidator.validateAllData(this.state.data);
      
      // Cache the result
      this.validationCache.set(dataHash, validationResult);
      
      this.updateState({
        type: 'VALIDATION_UPDATE',
        payload: { results: [validationResult] }
      });
    } catch (error) {
      console.error('Validation failed:', error);
    }
  }

  // Import/Export methods
  importData(jsonString: string): { success: boolean; error?: string } {
    try {
      this.updateState({ type: 'LOADING_UPDATE', payload: { isLoading: true } });
      
      const result = this.financeEngine.importJSON(jsonString);
      
      if (result.success) {
        const data = this.financeEngine.getData();
        const scenarios = this.financeEngine.getScenarios();
        
        this.updateState({
          type: 'DATA_UPDATE',
          payload: { data, scenarios }
        });
        
        this.computeAndValidate();
        
        // Clear validation cache
        this.validationCache.clear();
      } else {
        this.updateState({
          type: 'ERROR_UPDATE',
          payload: { error: result.error || 'Import failed' }
        });
      }
      
      return result;
    } catch (error) {
      this.updateState({
        type: 'ERROR_UPDATE',
        payload: { error: `Import failed: ${error.message}` }
      });
      return { success: false, error: error.message };
    }
  }

  exportData(): string {
    try {
      return this.financeEngine.exportJSON();
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  // Auto-save functionality
  private autoSave(): void {
    try {
      this.financeEngine.save();
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  // Getters
  getState(): AppState {
    return { ...this.state };
  }

  getData(): any {
    return this.state.data;
  }

  getComputationResult(): any {
    return this.state.computationResult;
  }

  getValidationResults(): ValidationResult[] {
    return this.state.validationResults;
  }

  getError(): string | null {
    return this.state.error;
  }

  isLoading(): boolean {
    return this.state.isLoading;
  }

  // Scenario management
  setCurrentScenario(scenarioId: string): void {
    if (this.state.scenarios[scenarioId]) {
      this.updateState({
        type: 'SCENARIO_UPDATE',
        payload: { scenarioId }
      });
    } else {
      this.updateState({
        type: 'ERROR_UPDATE',
        payload: { error: `Scenario ${scenarioId} not found` }
      });
    }
  }

  getCurrentScenario(): string {
    return this.state.currentScenario;
  }

  getScenarios(): Record<string, any> {
    return this.state.scenarios;
  }

  // Error handling
  clearError(): void {
    this.updateState({
      type: 'ERROR_UPDATE',
      payload: { error: null }
    });
  }

  // Reset functionality
  reset(): void {
    try {
      this.updateState({ type: 'LOADING_UPDATE', payload: { isLoading: true } });
      
      // Clear localStorage
      localStorage.removeItem('finance_data');
      localStorage.removeItem('finance_scenarios');
      
      // Reinitialize
      this.financeEngine = new FinanceEngine();
      this.financeEngine.init();
      
      const data = this.financeEngine.getData();
      const scenarios = this.financeEngine.getScenarios();
      
      this.updateState({
        type: 'DATA_UPDATE',
        payload: { data, scenarios }
      });
      
      this.computeAndValidate();
      
      // Clear validation cache
      this.validationCache.clear();
    } catch (error) {
      this.updateState({
        type: 'ERROR_UPDATE',
        payload: { error: `Reset failed: ${error.message}` }
      });
    }
  }
}
