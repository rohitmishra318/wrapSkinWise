import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

export const useAdminAnalytics = () => {
  return useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: async () => {
      const { data } = await api.get('/admin/analytics');
      return data.data;
    },
  });
};
