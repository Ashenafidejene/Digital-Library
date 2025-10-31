import { BookRepository, BookQuery } from '../repositories/BookRepository';
import { SocketService } from './SocketService';
import { IBook } from '../entities/Book';
import { AppError, BookStatus, PaginationQuery } from '../types';
import mongoose from 'mongoose';
import { Console } from 'console';
import { randomUUID } from 'crypto';

export interface CreateBookData {
  id : string ;
  title: string;
  author: string;
  description: string;
  category: string;
  isbn?: string;
  code?: string;
  publisher?: string;
  publishedDate?: Date;
  pageCount?: number;
  language?: string;
  tags?: string[];
  coverImage?: string;
  availability: {
    totalCopies: number;
    availableCopies: number;
  };
  location: {
    shelf: string;
    section: string;
    floor?: string;
  };
}

export interface UpdateBookData {
  title?: string;
  author?: string;
  description?: string;
  category?: string;
  isbn?: string;
  code?: string;
  publisher?: string;
  publishedDate?: Date;
  pageCount?: number;
  language?: string;
  tags?: string[];
  coverImage?: string;
  status?: BookStatus;
  availability?: {
    totalCopies?: number;
    availableCopies?: number;
    reservedCopies?: number;
  };
  location?: {
    shelf?: string;
    section?: string;
    floor?: string;
  };
}

export class BookService {
  private bookRepository: BookRepository;
  private socketService: SocketService;

  constructor() {
    this.bookRepository = new BookRepository();
    // Initialize SocketService only if socket manager is available
    try {
      this.socketService = new SocketService();
    } catch (error) {
      // Socket manager not initialized yet, will be set later
    }
  }

  private getSocketService(): SocketService | null {
    try {
      if (!this.socketService) {
        this.socketService = new SocketService();
      }
      return this.socketService;
    } catch (error) {
      return null;
    }
  }

async createBook(data: CreateBookData, addedBy: string): Promise<IBook> {
  // Check if ISBN already exists
  if (data.isbn) {
    const existingBook = await this.bookRepository.findByISBN(data.isbn);
    if (existingBook) {
      throw new AppError('A book with this ISBN already exists', 409);
    }
  }

  console.log("Creating book...");

  // Generate a unique code if not provided
  const code = data.code ?? `BOOK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Generate a MongoDB ObjectId string
  const id = randomUUID();
  
  // Ensure availableCopies = totalCopies
  const totalCopies = data.availability?.totalCopies ?? 1;

  const bookData = {
    ...data,
   // id:id, // This is a string version of ObjectId
    code,
    availability: {
      totalCopies,
      availableCopies: totalCopies,
      reservedCopies: 0,
    },
    metadata: {
      addedBy: new mongoose.Types.ObjectId(addedBy),
      totalBookings: 0,
      popularityScore: 0,
    },
  };

  // Save book
  const book = await this.bookRepository.create(bookData);
  console.log("Book created successfully:", book);

  // Emit real-time event
  const socketService = this.getSocketService();
  if (socketService) {
    await socketService.notifyBookAdded(book);
  }

  return book;
}

  async getBookById(id: string): Promise<IBook> {
    const book = await this.bookRepository.findByIdWithDetails(id);
    if (!book) {
      throw new AppError('Book not found', 404);
    }
    return book;
  }

  async updateBook(id: string, updateData: UpdateBookData, updatedBy: string): Promise<IBook> {
    // Check if book exists
    const existingBook = await this.bookRepository.findById(id);
    if (!existingBook) {
      throw new AppError('Book not found', 404);
    }

    // If ISBN is being updated, check if it's already taken
    if (updateData.isbn && updateData.isbn !== existingBook.isbn) {
      const isbnExists = await this.bookRepository.exists(updateData.isbn);
      if (isbnExists) {
        throw new AppError('A book with this ISBN already exists', 409);
      }
    }

    // Prepare the update data with proper typing
    const updatedBookData: any = {
      ...updateData,
      metadata: {
        ...existingBook.metadata,
        lastUpdatedBy: new mongoose.Types.ObjectId(updatedBy),
      },
    };

    // Handle availability field properly - ensure all required fields are present if availability is being updated
    if (updateData.availability) {
      updatedBookData.availability = {
        totalCopies: updateData.availability.totalCopies ?? existingBook.availability.totalCopies,
        availableCopies: updateData.availability.availableCopies ?? existingBook.availability.availableCopies,
        reservedCopies: updateData.availability.reservedCopies ?? existingBook.availability.reservedCopies,
      };
    }

    const updatedBook = await this.bookRepository.update(id, updatedBookData);
    if (!updatedBook) {
      throw new AppError('Failed to update book', 500);
    }

    return updatedBook;
  }

  async deleteBook(id: string): Promise<void> {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    // Check if book has any active bookings
    // This would require checking the booking repository
    // For now, we'll just delete the book

    const deleted = await this.bookRepository.delete(id);
    if (!deleted) {
      throw new AppError('Failed to delete book', 500);
    }
  }

  async getAllBooks(query: BookQuery) {
    return await this.bookRepository.findAll(query);
  }

  async getAvailableBooks(query: PaginationQuery) {
    return await this.bookRepository.findAvailable(query);
  }

  async getPopularBooks(query: PaginationQuery) {
    return await this.bookRepository.findPopular(query);
  }

  async getRecentlyAddedBooks(query: PaginationQuery) {
    return await this.bookRepository.findRecentlyAdded(query);
  }

  async searchBooks(searchTerm: string, query: PaginationQuery) {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new AppError('Search term is required', 400);
    }

    return await this.bookRepository.search(searchTerm.trim(), query);
  }

  async getBooksByCategory(category: string, query: PaginationQuery) {
    return await this.bookRepository.findByCategory(category, query);
  }

  async getBooksByStatus(status: BookStatus, query: PaginationQuery) {
    return await this.bookRepository.findByStatus(status, query);
  }

  async updateBookStatus(id: string, status: BookStatus): Promise<IBook> {
    console.log("here from update");
    const book = await this.bookRepository.findById(id);
    if (!book) {
      console.log("this id i dont found ",id );
      throw new AppError('Book not found', 404);
      
    }

    const updatedBook = await this.bookRepository.update(id, { status });
    if (!updatedBook) {
      throw new AppError('Failed to update book status', 500);
    }

    return updatedBook;
  }

  async updateBookAvailability(id: string, change: number): Promise<IBook> {
    const book = await this.bookRepository.updateAvailability(id, change);
    if (!book) {
      throw new AppError('Book not found or failed to update availability', 404);
    }

    return book;
  }

  async getBookStats() {
    return await this.bookRepository.getBookStats();
  }

  async getCategories(): Promise<string[]> {
    return await this.bookRepository.getCategories();
  }

  async getCategoryStats() {
    return await this.bookRepository.getCategoryStats();
  }

  async checkBookAvailability(id: string): Promise<{ available: boolean; availableCopies: number }> {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    return {
      available: book.isAvailable(),
      availableCopies: book.availability.availableCopies,
    };
  }

  async reserveBook(id: string): Promise<IBook> {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    if (!book.isAvailable()) {
      throw new AppError('Book is not available for reservation', 400);
    }

    // Decrease available copies by 1
    const updatedBook = await this.bookRepository.updateAvailability(id, -1);
    if (!updatedBook) {
      throw new AppError('Failed to reserve book', 500);
    }

    // Increment booking count
    await this.bookRepository.incrementBookingCount(id);

    return updatedBook;
  }

  async releaseBook(id: string): Promise<IBook> {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    // Increase available copies by 1
    const updatedBook = await this.bookRepository.updateAvailability(id, 1);
    if (!updatedBook) {
      throw new AppError('Failed to release book', 500);
    }

    return updatedBook;
  }

  async getBookByISBN(isbn: string): Promise<IBook> {
    const book = await this.bookRepository.findByISBN(isbn);
    if (!book) {
      throw new AppError('Book not found', 404);
    }
    return book;
  }

  async getFeaturedBooks(query: any) {
    const popularBooks = await this.getPopularBooks(query);
    const recentlyAddedBooks = await this.getRecentlyAddedBooks(query);
    // Assuming you have a method for recommended books
    const recommendedBooks = await this.getPopularBooks(query); // Placeholder

    return {
      popularBooks: popularBooks.books,
      recentlyAddedBooks: recentlyAddedBooks.books,
      recommendedBooks: recommendedBooks.books,
    };
  }

  async getBookCount(): Promise<number> {
    return await this.bookRepository.countDocuments();
  }

  async getCategoryCount(): Promise<number> {
    const categories = await this.bookRepository.getCategories();
    return categories.length;
  }
}
