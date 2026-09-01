import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { FilterParams, FilterOptions, DatasetStatus } from '../types';
import { api } from '../lib/api';

interface FilterContextType {
  filters: FilterParams;
  filterOptions: FilterOptions | null;
  datasetStatus: DatasetStatus | null;
  isLoadingOptions: boolean;
  activeFilterCount: number;
  setFilters: React.Dispatch<React.SetStateAction<FilterParams>>;
  updateFilter: <K extends keyof FilterParams>(key: K, value: FilterParams[K]) => void;
  toggleMultiFilter: (key: 'regions' | 'categories' | 'segments', value: string) => void;
  resetFilters: () => void;
  refreshData: () => Promise<void>;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [datasetStatus, setDatasetStatus] = useState<DatasetStatus | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState<boolean>(true);

  const refreshData = useCallback(async () => {
    try {
      setIsLoadingOptions(true);
      const [opts, status] = await Promise.all([
        api.getFilterOptions(),
        api.getDataStatus()
      ]);
      setFilterOptions(opts);
      setDatasetStatus(status);
    } catch (err) {
      console.error('Failed to load dataset status / options:', err);
    } finally {
      setIsLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const updateFilter = useCallback(<K extends keyof FilterParams>(key: K, value: FilterParams[K]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const toggleMultiFilter = useCallback((key: 'regions' | 'categories' | 'segments', value: string) => {
    setFilters((prev) => {
      const current = prev[key] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return {
        ...prev,
        [key]: updated.length > 0 ? updated : undefined,
      };
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.start_date || filters.end_date) count++;
    if (filters.regions && filters.regions.length > 0) count += filters.regions.length;
    if (filters.categories && filters.categories.length > 0) count += filters.categories.length;
    if (filters.segments && filters.segments.length > 0) count += filters.segments.length;
    if (filters.states && filters.states.length > 0) count += filters.states.length;
    if (filters.sub_categories && filters.sub_categories.length > 0) count += filters.sub_categories.length;
    return count;
  }, [filters]);

  return (
    <FilterContext.Provider
      value={{
        filters,
        filterOptions,
        datasetStatus,
        isLoadingOptions,
        activeFilterCount,
        setFilters,
        updateFilter,
        toggleMultiFilter,
        resetFilters,
        refreshData,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};
