import api from './api';

export const budgetService = {
  getBudgets: (month) => api.get('/budgets', month ? { month } : {}),
  createBudget: (data) => api.post('/budgets', data),
  updateBudget: (id, data) => api.put(`/budgets/${id}`, data),
  deleteBudget: (id) => api.delete(`/budgets/${id}`)
};

export default budgetService;
