import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

export const useTodayCheckin = () => {
  return useQuery({
    queryKey: ['todayCheckin'],
    queryFn: async () => {
      const { data } = await api.get('/users/checkin/today');
      return data.data;
    },
  });
};

export const useSubmitCheckin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (checkinData) => {
      const { data } = await api.post('/users/checkin', checkinData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayCheckin'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};
