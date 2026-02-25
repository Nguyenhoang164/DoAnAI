import axios from 'axios';
import { API_BASE_URL } from '../config/env';
import { getStoredAuth } from '../services/authStorage';

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use((config) => {
  const auth = getStoredAuth();
  if (auth?.accessToken) {
    config.headers.Authorization = `${auth.tokenType || 'Bearer'} ${auth.accessToken}`;
  }
  return config;
});

export default httpClient;
