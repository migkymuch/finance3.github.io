// React hook for Finance State Management

import { useState, useEffect, useCallback, useRef } from 'react';
import { StateManager, AppState } from '../lib/state-manager';

let globalStateManager: StateManager | null = null;

// Singleton pattern for state manager
const getStateManager = (): StateManager => {
  if (!globalStateManager) {
    globalStateManager = new StateManager();
  }
  return globalStateManager;
};

export const useFinanceState = () => {
  const [state, setState] = useState<AppState>(() => {
    const stateManager = getStateManager();
    return stateManager.getState();
  });
  
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const stateManager = getStateManager();
    
    // Subscribe to state changes
    unsubscribeRef.current = stateManager.subscribe((newState) => {
      setState(newState);
    });

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const stateManager = getStateManager();

  // Memoized actions to prevent unnecessary re-renders
  const actions = {
    updateMenu: useCallback((menuId: string, updates: any) => {
      stateManager.updateMenu(menuId, updates);
    }, [stateManager]),

    updateSalesModel: useCallback((updates: any) => {
      stateManager.updateSalesModel(updates);
    }, [stateManager]),

    updateUtilities: useCallback((utilities: any[]) => {
      stateManager.updateUtilities(utilities);
    }, [stateManager]),

    updateLabor: useCallback((labor: any[]) => {
      stateManager.updateLabor(labor);
    }, [stateManager]),

    updateFixedCosts: useCallback((fixedCosts: any[]) => {
      stateManager.updateFixedCosts(fixedCosts);
    }, [stateManager]),

    importData: useCallback((jsonString: string) => {
      return stateManager.importData(jsonString);
    }, [stateManager]),

    exportData: useCallback(() => {
      return stateManager.exportData();
    }, [stateManager]),

    setCurrentScenario: useCallback((scenarioId: string) => {
      stateManager.setCurrentScenario(scenarioId);
    }, [stateManager]),

    clearError: useCallback(() => {
      stateManager.clearError();
    }, [stateManager]),

    reset: useCallback(() => {
      stateManager.reset();
    }, [stateManager])
  };

  return {
    ...state,
    ...actions
  };
};

// Hook for specific data access
export const useFinanceData = () => {
  const { data, isLoading, error } = useFinanceState();
  
  return {
    data,
    isLoading,
    error,
    menus: data?.menus || [],
    salesModel: data?.salesModel || {},
    utilities: data?.utilities || [],
    labor: data?.labor || [],
    fixedCosts: data?.fixedCosts || []
  };
};

// Hook for computation results
export const useComputationResults = () => {
  const { computationResult, isLoading, error } = useFinanceState();
  
  return {
    pnl: computationResult?.pnl || null,
    kpis: computationResult?.kpis || null,
    menus: computationResult?.menus || [],
    sensitivity: computationResult?.sensitivity || null,
    isLoading,
    error,
    computedAt: computationResult?.computedAt || null,
    dataVersion: computationResult?.dataVersion || null
  };
};

// Hook for validation results
export const useValidationResults = () => {
  const { validationResults, isLoading, error } = useFinanceState();
  
  const hasErrors = validationResults.some(result => !result.isValid);
  const hasWarnings = validationResults.some(result => result.warnings.length > 0);
  
  const allErrors = validationResults.flatMap(result => result.errors);
  const allWarnings = validationResults.flatMap(result => result.warnings);
  
  return {
    validationResults,
    hasErrors,
    hasWarnings,
    allErrors,
    allWarnings,
    isLoading,
    error
  };
};

// Hook for scenarios
export const useScenarios = () => {
  const { scenarios, currentScenario, setCurrentScenario } = useFinanceState();
  
  return {
    scenarios,
    currentScenario,
    setCurrentScenario,
    scenarioOptions: Object.values(scenarios).map(scenario => ({
      value: scenario.id,
      label: scenario.name
    }))
  };
};
