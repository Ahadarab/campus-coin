import api from './api';

export const transactionService = {
  getTransactions: (params) => api.get('/transactions', params),
  getTransactionById: (id) => api.get(`/transactions/${id}`),
  createTransaction: (data) => api.post('/transactions', data),
  updateTransaction: (id, data) => api.put(`/transactions/${id}`, data),
  deleteTransaction: (id) => api.delete(`/transactions/${id}`)
};

export default transactionService;
