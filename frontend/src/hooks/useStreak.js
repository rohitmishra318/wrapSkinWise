import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

export const useStreak = () => {
  return useQuery({
    queryKey: ['streakData'],
    queryFn: async () => {
      // In a real implementation this would fetch from a specific endpoint
      // For now we'll assume it returns default structure if not found
      try {
        const { data } = await api.get('/routine/streak');
        return data.data || { currentStreak: 0, longestStreak: 0 };
      } catch (err) {
        return { currentStreak: 0, longestStreak: 0 };
      }
    },
  });
};
