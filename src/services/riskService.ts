import apiClient from '../lib/apiClient';

export const riskService = {
  getRisks: async (params?: any) => {
    const response = await apiClient.get('/risks', { params });
    return response.data;
  },

  getRiskById: async (id: string) => {
    const response = await apiClient.get(`/risks/${id}`);
    return response.data;
  },

  createRisk: async (data: any) => {
    const response = await apiClient.post('/risks', data);
    return response.data;
  },

  updateRisk: async (id: string, data: any) => {
    const response = await apiClient.put(`/risks/${id}`, data);
    return response.data;
  },

  submitRisk: async (id: string, submitterNote?: string) => {
    const response = await apiClient.post(`/risks/${id}/submit`, { submitter_note: submitterNote });
    return response.data;
  }
};
