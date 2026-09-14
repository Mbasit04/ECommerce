import api from './api';

export const getCustomerProfile = async () => {
  const response = await api.get('/Customer/profile');
  return response.data;
};

export const updateCustomerProfile = async (profileData) => {
  const response = await api.put('/Customer/profile', profileData);
  return response.data;
};

export const changeCustomerPassword = async (payload) => {
  const response = await api.put('/Customer/change-password', payload);
  return response.data;
};

export const getCustomerProducts = async (params) => {
  const response = await api.get('/Customer/products', { params });
  return response.data;
};

export const getCustomerProductById = async (id) => {
  const response = await api.get(`/Customer/products/${id}`);
  return response.data;
};
