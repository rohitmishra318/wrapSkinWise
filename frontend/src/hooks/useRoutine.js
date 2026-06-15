import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

export const useRoutine = (type) => {
  return useQuery({
    queryKey: ['routine', type],
    queryFn: async () => {
      const { data } = await api.get(`/routine?type=${type}`);
      return data.data;
    },
    enabled: !!type,
  });
};

export const useGenerateRoutine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/routine/generate', payload);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['routine', variables.routineType] });
      queryClient.invalidateQueries({ queryKey: ['routine', 'all'] });
    },
  });
};
