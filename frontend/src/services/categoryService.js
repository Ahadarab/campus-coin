import api from './api';

export const categoryService = {
  getCategories: (type) => api.get('/categories', type ? { type } : {}),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`)
};

export default categoryService;
