import {
  FilterParams, FilterOptions, KpiSummary, TrendResponse,
  BreakdownResponse, AlertItem, DiagnosticResult,
  OpportunityResponse, ExecutiveReport, DatasetStatus
} from '../types';

const API_BASE = '/api';

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
  getHealth: () => fetchJson<{ status: string }>('/health'),

  getDataStatus: () => fetchJson<DatasetStatus>('/data/status'),

  getFilterOptions: () => fetchJson<FilterOptions>('/filters/options'),

  resetDataset: () =>
    fetchJson<{ success: boolean; message: string }>('/data/reset', {
      method: 'POST',
    }),

  uploadDataset: async (file: File) => {
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

  getKpis: (params?: FilterParams) =>
    fetchJson<KpiSummary>('/kpis', {
      method: 'POST',
      body: JSON.stringify(params || {}),
    }),

  getTrends: (params?: FilterParams, granularity: 'month' | 'quarter' = 'month') =>
    fetchJson<TrendResponse>(`/trends?granularity=${granularity}`, {
      method: 'POST',
      body: JSON.stringify(params || {}),
    }),

  getBreakdown: (dimension: string, params?: FilterParams, limit: number = 50) =>
    fetchJson<BreakdownResponse>(`/breakdown?dimension=${dimension}&limit=${limit}`, {
      method: 'POST',
      body: JSON.stringify(params || {}),
    }),

  getAlerts: (params?: FilterParams) =>
    fetchJson<AlertItem[]>('/alerts', {
      method: 'POST',
      body: JSON.stringify(params || {}),
    }),

  getDiagnostics: (dimension: string, entityName: string, params?: FilterParams) =>
    fetchJson<DiagnosticResult>(
      `/diagnose?dimension=${encodeURIComponent(dimension)}&entity_name=${encodeURIComponent(entityName)}`,
      {
        method: 'POST',
        body: JSON.stringify(params || {}),
      }
    ),

  getOpportunities: (params?: FilterParams) =>
    fetchJson<OpportunityResponse>('/opportunities', {
      method: 'POST',
      body: JSON.stringify(params || {}),
    }),

  getReport: (params?: FilterParams) =>
    fetchJson<ExecutiveReport>('/reports', {
      method: 'POST',
      body: JSON.stringify(params || {}),
    }),
};
