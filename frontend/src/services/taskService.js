import API from '../api/axios';

export const taskService = {
  getByProject: (projectId, params) => API.get(`/projects/${projectId}/tasks`, { params }),
  getById: (taskId) => API.get(`/tasks/${taskId}`),
  create: (projectId, data) => API.post(`/projects/${projectId}/tasks`, data),
  update: (taskId, data) => API.put(`/tasks/${taskId}`, data),
  delete: (taskId) => API.delete(`/tasks/${taskId}`),
};
