import api from './api';

export const bookmarkService = {
  getBookmarks: () => api.get('/bookmarks'),
  createBookmark: (data) => api.post('/bookmarks', data),
  deleteBookmark: (id) => api.delete(`/bookmarks/${id}`)
};

export default bookmarkService;
