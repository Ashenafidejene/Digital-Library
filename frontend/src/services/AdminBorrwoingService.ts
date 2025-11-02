import api from './api';

const API_URL = '/admin/borrowing'; // Corrected from /borrowings

export interface Borrowing {
  id: string;
  userId: string;
  bookId: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt?: string;
  status: 'pending' | 'approved' | 'borrowed' | 'returned' | 'overdue';
  user: {
    name: string;
    email: string;
  };
  book: {
    title: string;
    author: string;
  };
  fineAmount: number;
  requestDate: string;
  borrowPeriodDays: number;
}

export const getBorrowedBooks = async (token: string, searchQuery: string, selectedStatus: string): Promise<Borrowing[]> => {
  const params = new URLSearchParams();
  if (searchQuery) params.append('search', searchQuery);
  if (selectedStatus) params.append('status', selectedStatus);
  
  const response = await api.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  //console.log(response.data.data.records);
  console.log("this the data i am expect")
  console.log(response);
  return response.data.data.bookings || [];
};

export const approveRequest = async (recordId: string, token: string): Promise<any> => {
  const response = await api.post(`${API_URL}/${recordId}/approve`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(response.data);
  return response.data;
};

export const rejectRequest = async (recordId: string, reason: string, token: string): Promise<any> => {
  const response = await api.post(`${API_URL}/${recordId}/reject`, { reason }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const returnBook = async (borrowingId: string, token: string): Promise<void> => {
  await api.post(`${API_URL}/${borrowingId}/return`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getUserBorrowingHistory = async (userId: string, token: string): Promise<Borrowing[]> => {
  const response = await api.get(`/admin/users/${userId}/borrowing-history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data?.records || response.data.records || response.data || [];
};
