import API from '../api/axios';

export const projectService = {
  getAll: () => API.get('/projects'),
  getById: (id) => API.get(`/projects/${id}`),
  create: (data) => API.post('/projects', data),
  update: (id, data) => API.put(`/projects/${id}`, data),
  delete: (id) => API.delete(`/projects/${id}`),
  addMember: (id, email, role) => API.post(`/projects/${id}/members`, { email, role }),
  removeMember: (projectId, userId) => API.delete(`/projects/${projectId}/members/${userId}`),
};
