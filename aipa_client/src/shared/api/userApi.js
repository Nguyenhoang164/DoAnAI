import httpClient from './httpClient';

export async function fetchMeApi() {
  const response = await httpClient.get('/api/user/me');
  return response.data;
}
