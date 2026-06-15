import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

export const useAnalysis = (id) => {
  return useQuery({
    queryKey: ['analysis', id],
    queryFn: async () => {
      const { data } = await api.get(`/analyze/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};
