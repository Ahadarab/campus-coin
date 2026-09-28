import api from './api';

export const tipService = {
  getTips: () => api.get('/tips'),
  pinTip: (id) => api.post(`/tips/${id}/pin`),
  dismissTip: (id) => api.post(`/tips/${id}/dismiss`)
};

export default tipService;
