import axios from 'axios';
import type { RFP, Vendor, Proposal, ComparisonData, Evaluation } from './types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// RFP APIs
export const rfpApi = {
  create: (requirements: string) => 
    api.post<{ success: boolean; data: RFP }>('/rfps', { requirements }),
  
  getAll: () => 
    api.get<{ success: boolean; data: RFP[]; count: number }>('/rfps'),
  
  getById: (id: string) => 
    api.get<{ success: boolean; data: RFP }>(`/rfps/${id}`),
  
  update: (id: string, data: Partial<RFP>) => 
    api.put<{ success: boolean; data: RFP }>(`/rfps/${id}`, data),
  
  delete: (id: string) => 
    api.delete<{ success: boolean }>(`/rfps/${id}`),
  
  send: (id: string, vendorIds: string[]) => 
    api.post<{ success: boolean; data: any }>(`/rfps/${id}/send`, { vendorIds }),
};

// Vendor APIs
export const vendorApi = {
  create: (data: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) => 
    api.post<{ success: boolean; data: Vendor }>('/vendors', data),
  
  getAll: () => 
    api.get<{ success: boolean; data: Vendor[]; count: number }>('/vendors'),
  
  getById: (id: string) => 
    api.get<{ success: boolean; data: Vendor }>(`/vendors/${id}`),
  
  update: (id: string, data: Partial<Vendor>) => 
    api.put<{ success: boolean; data: Vendor }>(`/vendors/${id}`, data),
  
  delete: (id: string) => 
    api.delete<{ success: boolean }>(`/vendors/${id}`),
};

// Proposal APIs
export const proposalApi = {
  getByRFP: (rfpId: string) => 
    api.get<{ success: boolean; data: Proposal[]; count: number }>(`/proposals/rfp/${rfpId}`),
  
  getById: (id: string) => 
    api.get<{ success: boolean; data: Proposal }>(`/proposals/${id}`),
  
  getComparison: (rfpId: string) => 
    api.get<{ success: boolean; data: ComparisonData }>(`/proposals/rfp/${rfpId}/comparison`),
  
  evaluate: (rfpId: string) => 
    api.post<{ success: boolean; data: Evaluation }>(`/proposals/rfp/${rfpId}/evaluate`),
};

// Email API
export const emailApi = {
  checkEmails: () => 
    api.post<{ success: boolean; data: any }>('/emails/check'),
};

export default api;