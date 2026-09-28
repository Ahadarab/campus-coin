import api from './api';

export const adminService = {
  getUsers: (params) => api.get('/admin/users', params),
  toggleDisableUser: (id) => api.put(`/admin/users/${id}/disable`),

  getDefaultCategories: () => api.get('/admin/categories'),
  createDefaultCategory: (data) => api.post('/admin/categories', data),
  updateDefaultCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteDefaultCategory: (id) => api.delete(`/admin/categories/${id}`),

  getTipTemplates: () => api.get('/admin/tips'),
  createTipTemplate: (data) => api.post('/admin/tips', data),
  updateTipTemplate: (id, data) => api.put(`/admin/tips/${id}`, data),
  deleteTipTemplate: (id) => api.delete(`/admin/tips/${id}`),

  getAnnouncements: () => api.get('/admin/announcements'),
  createAnnouncement: (data) => api.post('/admin/announcements', data),
  updateAnnouncement: (id, data) => api.put(`/admin/announcements/${id}`, data),
  deleteAnnouncement: (id) => api.delete(`/admin/announcements/${id}`),

  getStatistics: () => api.get('/admin/statistics')
};

export default adminService;
