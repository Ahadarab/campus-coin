import api from './api';

export const csvService = {
  previewCsv: (formData) => api.upload('/import/csv/preview', formData),
  importCsv: (rows) => api.post('/import/csv', { rows })
};

export default csvService;
