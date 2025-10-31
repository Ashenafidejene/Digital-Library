import { apiService, ApiResponse } from './api';

export interface Book {
  _id?: string;
  id: string;
  title: string;
  author: string;
  isbn?: string;
  category: string;
  description: string;
  publisher?: string;
  publishedDate?: string;
  pageCount?: number;
  language: string;
  location: {
    shelf: string;
    section: string;
    floor?: string;
  };
  status: 'available' | 'borrowed' | 'maintenance' | 'lost';
  dueDate?: string;
  availability: {
    totalCopies: number;
    availableCopies: number;
    reservedCopies?: number;
  };
  rating?: {
    average: number;
    count: number;
  };
  coverImage?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isAvailable?: boolean;
}

export interface BookQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  author?: string;
  status?: string;
  language?: string;
  sortBy?: 'title' | 'author' | 'publicationDate' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  available?: boolean;
}

export interface BookStats {
  totalBooks: number;
  availableBooks: number;
  borrowedBooks: number;
  categories: Array<{
    name: string;
    count: number;
  }>;
  popularBooks: Book[];
  recentBooks: Book[];
}

export const bookService = {
  // Get all books with filtering and pagination
  async getBooks(query: BookQuery = {}): Promise<ApiResponse<Book[]>> {
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const endpoint = `/books?${params.toString()}`;
    console.log(`[User Book Service] Fetching books from endpoint: ${endpoint}`);

    try {
      const response = await apiService.get<Book[]>(endpoint);
      console.log('[User Book Service] Raw API Response:', response);
      return response;
    } catch (error) {
      console.error(`[User Book Service] Error fetching from ${endpoint}:`, error);
      throw error;
    }
  },

  // Get book by ID
  async getBookById(id: string): Promise<ApiResponse<Book>> {
    return apiService.get<Book>(`/books/${id}`);
  },

  // Search books
  async searchBooks(searchTerm: string, filters: Partial<BookQuery> = {}): Promise<ApiResponse<Book[]>> {
    const query = {
      search: searchTerm,
      ...filters,
    };
    return this.getBooks(query);
  },

  // Get available books
  async getAvailableBooks(query: Omit<BookQuery, 'available'> = {}): Promise<ApiResponse<Book[]>> {
    return this.getBooks({ ...query, available: true });
  },

  // Get popular books
  async getPopularBooks(limit: number = 10): Promise<ApiResponse<Book[]>> {
    return apiService.get<Book[]>(`/books/popular?limit=${limit}`);
  },

  // Get recent books
  async getRecentBooks(limit: number = 10): Promise<ApiResponse<Book[]>> {
    return apiService.get<Book[]>(`/books/recent?limit=${limit}`);
  },

  // Get books by category
  async getBooksByCategory(category: string, query: Omit<BookQuery, 'category'> = {}): Promise<ApiResponse<Book[]>> {
    return this.getBooks({ ...query, category });
  },

  // Get book categories
  async getCategories(): Promise<ApiResponse<string[]>> {
    return apiService.get<string[]>('/books/categories');
  },

  // Get book statistics
  async getBookStats(): Promise<ApiResponse<BookStats>> {
    return apiService.get<BookStats>('/books/stats');
  },

  // Admin functions
  async getAdminBooks(query: BookQuery = {}): Promise<ApiResponse<Book[]>> {
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const endpoint = `/admin/books?${params.toString()}`;
    console.log(`[Admin Book Service] Fetching books from endpoint: ${endpoint}`);

    try {
      const response = await apiService.get<Book[]>(endpoint);
      console.log('[Admin Book Service] Raw API Response:', response);
      return response;
    } catch (error) {
      console.error(`[Admin Book Service] Error fetching from ${endpoint}:`, error);
      throw error;
    }
  },

  async createBook(bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Book>> {
    return apiService.post<Book>('/books', bookData);
  },

  async updateBook(id: string, bookData: Partial<Book>): Promise<ApiResponse<Book>> {
    return apiService.put<Book>(`/books/${id}`, bookData);
  },

  async deleteBook(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/books/${id}`);
  },

  // Bulk operations
  async bulkUpdateBooks(updates: Array<{ id: string; data: Partial<Book> }>): Promise<ApiResponse<Book[]>> {
    return apiService.put<Book[]>('/books/bulk', { updates });
  },

  async bulkDeleteBooks(ids: string[]): Promise<ApiResponse<void>> {
    return apiService.delete<void>('/books/bulk', { data: { ids } });
  },

  // Import/Export
  async exportBooks(format: 'json' | 'csv' = 'json'): Promise<ApiResponse<string>> {
    return apiService.get<string>(`/books/export?format=${format}`);
  },

  async importBooks(file: File): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiService.post<{ imported: number; errors: string[] }>('/books/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const getFeaturedBooks = async (params: any): Promise<{ popularBooks: Book[], recentlyAddedBooks: Book[], recommendedBooks: Book[] }> => {
  const response = await apiService.get<{ popularBooks: Book[], recentlyAddedBooks: Book[], recommendedBooks: Book[] }>('/books/featured', { params });
  return response.data;
};

export default bookService;
