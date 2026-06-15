import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const brandApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

brandApi.interceptors.request.use((config) => {
  const brandKey = localStorage.getItem('brandApiKey');
  if (brandKey) {
    config.headers['X-Brand-API-Key'] = brandKey;
  }
  return config;
});

export const useBrandOverview = () => {
  return useQuery({
    queryKey: ['brandOverview'],
    queryFn: async () => {
      const { data } = await brandApi.get('/v1/partner/analytics/overview');
      return data.data;
    },
  });
};

export const useBrandSkinDistribution = (filters) => {
  return useQuery({
    queryKey: ['brandDistribution', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters).toString();
      const { data } = await brandApi.get(`/v1/partner/analytics/skin-distribution?${params}`);
      return data.data;
    },
  });
};
