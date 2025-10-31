import api from './api';

export interface HomePageStats {
  totalBooks: number;
  totalMembers: number;
  totalCategories: number;
}

export const getHomePageStats = async (): Promise<HomePageStats> => {
  try {
    const response = await api.get('/dashboard/home-stats');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching home page stats:', error);
    throw error;
  }
};
