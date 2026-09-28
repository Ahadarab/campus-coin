import api from './api';

export const insightService = {
  getInsights: () => api.get('/insights'),
  generateInsight: (month) => api.post('/insights/generate', month ? { month } : {}),
  toggleBookmark: (id) => api.post(`/insights/${id}/bookmark`)
};

export default insightService;
