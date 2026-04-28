import api from './axios';

export const authApi = {
  register: (data) => api.post('/api/auth/register', data),
  login:    (data) => api.post('/api/auth/login', data),
  me:       ()     => api.get('/api/auth/me'),
};

export const usersApi = {
  getAll:     ()         => api.get('/api/users'),
  updateRole: (id, role) => api.put(`/api/users/${id}/role`, { role }),
};

export const petsApi = {
  getAll:  (params) => api.get('/api/pets', { params }),
  getById: (id)     => api.get(`/api/pets/${id}`),
  create:  (data)   => api.post('/api/pets', data),
  update:  (id, d)  => api.put(`/api/pets/${id}`, d),
};

export const adoptionsApi = {
  create:       (data)         => api.post('/api/adoptions', data),
  getAll:       (params)       => api.get('/api/adoptions', { params }),
  updateStatus: (id, data)     => api.put(`/api/adoptions/${id}/status`, data),
};

export const productsApi = {
  getAll:  (params) => api.get('/api/products', { params }),
  create:  (data)   => api.post('/api/products', data),
  update:  (id, d)  => api.put(`/api/products/${id}`, d),
};

export const ordersApi = {
  create:       (data)     => api.post('/api/orders', data),
  getAll:       ()         => api.get('/api/orders'),
  updateStatus: (id, data) => api.put(`/api/orders/${id}/status`, data),
};

export const servicesApi = {
  getAll:  ()     => api.get('/api/services'),
  create:  (data) => api.post('/api/services', data),
};

export const appointmentsApi = {
  create:       (data)     => api.post('/api/appointments', data),
  getAll:       (params)   => api.get('/api/appointments', { params }),
  updateStatus: (id, data) => api.put(`/api/appointments/${id}/status`, data),
};

export const medicalApi = {
  getByPet: (petId) => api.get(`/api/medical-records/${petId}`),
  create:   (data)  => api.post('/api/medical-records', data),
};
