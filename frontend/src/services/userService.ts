import api from './api';

export const userService = {
  getFavoriteBooks: async () => {
    const response = await api.get('/users/favorites');
    return response.data;
  },

  addFavoriteBook: async (bookId: string) => {
    const response = await api.post('/users/favorites', { bookId });
    return response.data;
  },

  removeFavoriteBook: async (bookId: string) => {
    const response = await api.delete(`/users/favorites/${bookId}`);
    return response.data;
  },
};
