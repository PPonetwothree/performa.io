import {
  FilterParams,
  FilterOptions,
  KpiSummary,
  TrendResponse,
  BreakdownResponse,
  AlertItem,
  DiagnosticResult,
  OpportunityResponse,
  ExecutiveReport,
  DatasetStatus,
} from '../types';
import { clientAnalytics, clientDemoData } from './clientAnalytics';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let errorMsg = `API request failed with status ${res.status}`;
    try {
      const errData = await res.json();
      if (errData.detail) {
        errorMsg = errData.detail;
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  getHealth: async (): Promise<{ status: string }> => {
    try {
      return await fetchJson<{ status: string }>('/health');
    } catch {
      return { status: 'ok (client-mode)' };
    }
  },

  getDataStatus: async (): Promise<DatasetStatus> => {
    try {
      return await fetchJson<DatasetStatus>('/data/status');
    } catch {
      return clientDemoData.status;
    }
  },

  getFilterOptions: async (): Promise<FilterOptions> => {
    try {
      return await fetchJson<FilterOptions>('/filters/options');
    } catch {
      return clientDemoData.filterOptions;
    }
  },

  resetDataset: async (): Promise<{ success: boolean; message: string }> => {
    try {
      return await fetchJson<{ success: boolean; message: string }>('/data/reset', {
        method: 'POST',
      });
    } catch {
      return { success: true, message: 'Reset to default Kaggle Superstore demo dataset.' };
    }
  },

  uploadDataset: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/data/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      let errorMsg = `Upload failed with status ${res.status}`;
      try {
        const errData = await res.json();
        if (errData.detail) errorMsg = errData.detail;
      } catch {
        // ignore
      }
      throw new Error(errorMsg);
    }

    return res.json();
  },

  getKpis: async (params?: FilterParams): Promise<KpiSummary> => {
    try {
      return await fetchJson<KpiSummary>('/kpis', {
        method: 'POST',
        body: JSON.stringify(params || {}),
      });
    } catch {
      return clientAnalytics.getKpis(params);
    }
  },

  getTrends: async (
    params?: FilterParams,
    granularity: 'month' | 'quarter' = 'month'
  ): Promise<TrendResponse> => {
    try {
      return await fetchJson<TrendResponse>(`/trends?granularity=${granularity}`, {
        method: 'POST',
        body: JSON.stringify(params || {}),
      });
    } catch {
      return clientAnalytics.getTrends(params, granularity);
    }
  },

  getBreakdown: async (
    dimension: string,
    params?: FilterParams,
    limit: number = 50
  ): Promise<BreakdownResponse> => {
    try {
      return await fetchJson<BreakdownResponse>(
        `/breakdown?dimension=${dimension}&limit=${limit}`,
        {
          method: 'POST',
          body: JSON.stringify(params || {}),
        }
      );
    } catch {
      return clientAnalytics.getBreakdown(dimension);
    }
  },

  getAlerts: async (params?: FilterParams): Promise<AlertItem[]> => {
    try {
      return await fetchJson<AlertItem[]>('/alerts', {
        method: 'POST',
        body: JSON.stringify(params || {}),
      });
    } catch {
      return clientAnalytics.getAlerts();
    }
  },

  getDiagnostics: async (
    dimension: string,
    entityName: string,
    params?: FilterParams
  ): Promise<DiagnosticResult> => {
    try {
      return await fetchJson<DiagnosticResult>(
        `/diagnose?dimension=${encodeURIComponent(dimension)}&entity_name=${encodeURIComponent(entityName)}`,
        {
          method: 'POST',
          body: JSON.stringify(params || {}),
        }
      );
    } catch {
      return clientAnalytics.getDiagnostics(dimension, entityName);
    }
  },

  getOpportunities: async (params?: FilterParams): Promise<OpportunityResponse> => {
    try {
      return await fetchJson<OpportunityResponse>('/opportunities', {
        method: 'POST',
        body: JSON.stringify(params || {}),
      });
    } catch {
      return clientAnalytics.getOpportunities();
    }
  },

  getReport: async (params?: FilterParams): Promise<ExecutiveReport> => {
    try {
      return await fetchJson<ExecutiveReport>('/reports', {
        method: 'POST',
        body: JSON.stringify(params || {}),
      });
    } catch {
      return clientAnalytics.getReport();
    }
  },
};
