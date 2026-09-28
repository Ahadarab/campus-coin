import api from './api';

export const aiService = {
  categorize: (description, type = 'expense') => api.post('/ai/categorize', { description, type }),
  monthlyInsight: (month) => api.post('/ai/monthly-insight', { month })
};

export default aiService;
