import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

export const useAnalysisHistory = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['analysisHistory', page, limit],
    queryFn: async () => {
      const { data } = await api.get(`/analyze/history?page=${page}&limit=${limit}`);
      return data.data;
    },
  });
};
