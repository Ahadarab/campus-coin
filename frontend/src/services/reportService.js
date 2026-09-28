import api from './api';

const clean = (filters = {}) => Object.fromEntries(
  Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== '')
);

export const reportService = {
  getMonthlyReport: (filters = {}) => api.get('/reports/monthly', clean(filters)),
  getSixMonthsReport: (filters = {}) => api.get('/reports/six-months', clean(filters)),
  getDailyReport: (filters = {}) => api.get('/reports/daily', clean(filters)),
  getWeeklyReport: (filters = {}) => api.get('/reports/weekly', clean(filters)),
  downloadReportPdf: async (filters = {}) => {
    const params = clean(filters);
    const blob = await api.downloadBlob('/reports/export', params);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const period = params.month || 'filtered';
    link.setAttribute('download', `CampusCoin_Report_${period}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};

export default reportService;
