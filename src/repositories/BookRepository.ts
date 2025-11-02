import { Book, IBook } from '../entities/Book';
import { BookStatus, PaginationQuery } from '../types';
import { PaginationUtil } from '../utils/pagination';
import mongoose, { SortOrder } from 'mongoose';

export interface BookQuery extends PaginationQuery {
  search?: string;
  category?: string;
  status?: BookStatus;
  author?: string;
}

export class BookRepository {
  async create(bookData: Partial<IBook>): Promise<IBook> {
    const book = new Book(bookData);
    return await book.save();
  }

  async findById(id: string): Promise<IBook | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Book.findById(id).populate('metadata.addedBy', 'name email');
  }

  async findByIdWithDetails(id: string): Promise<IBook | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Book.findById(id)
      .populate('metadata.addedBy', 'name email')
      .populate('metadata.lastUpdatedBy', 'name email');
  }

  async update(id: string, updateData: Partial<IBook>): Promise<IBook | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    
    return await Book.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('metadata.addedBy', 'name email');
  }

  async delete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    
    const result = await Book.findByIdAndDelete(id);
    return !!result;
  }

  async findAll(query: BookQuery) {
    const { page, limit, skip, sortBy, sortOrder } = PaginationUtil.parseQuery(query);
    
    // Build filter
    const filter: any = {};
    
    if (query.category) {
      filter.category = query.category;
    }
    
    if (query.status) {
      filter.status = query.status;
    }
    
    if (query.author) {
      const authorRegex = new RegExp(query.author, 'i');
      filter.author = authorRegex;
    }
    
    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter.$or = [
        { title: searchRegex },
        { author: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
      ];
    }

    // Build sort
    const sort = PaginationUtil.buildSortObject(sortBy, sortOrder);

    // Execute queries
    const [books, totalBooks] = await Promise.all([
      Book.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('metadata.addedBy', 'name email'),
      Book.countDocuments(filter),
    ]);

    const pagination = PaginationUtil.calculatePagination(totalBooks, page, limit);
    
    return {
      books,
      pagination,
    };
  }

  async findByCategory(category: string, query: PaginationQuery) {
    const categoryQuery: BookQuery = {
      ...query,
      category,
    };
    return this.findAll(categoryQuery);
  }

  async findByStatus(status: BookStatus, query: PaginationQuery) {
    const statusQuery: BookQuery = {
      ...query,
      status,
    };
    return this.findAll(statusQuery);
  }

  async search(searchTerm: string, query: PaginationQuery) {
    const searchQuery: BookQuery = {
      ...query,
      search: searchTerm,
    };
    return this.findAll(searchQuery);
  }

  async findAvailable(query: PaginationQuery) {
    const availableQuery: BookQuery = {
      ...query,
      status: BookStatus.AVAILABLE,
    };
    return this.findAll(availableQuery);
  }

  async findPopular(query: PaginationQuery) {
    const { page, limit, skip } = PaginationUtil.parseQuery(query);
    
    const filter = { status: BookStatus.AVAILABLE };
    const sort: { [key: string]: SortOrder } = { 'metadata.popularityScore': -1 as SortOrder, 'metadata.totalBookings': -1 as SortOrder };

    const [books, totalItems] = await Promise.all([
      Book.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('metadata.addedBy', 'name email'),
      Book.countDocuments(filter),
    ]);

    const pagination = PaginationUtil.calculatePagination(totalItems, page, limit);

    return {
      books,
      pagination,
    };
  }

  async findRecentlyAdded(query: PaginationQuery) {
    const { page, limit, skip } = PaginationUtil.parseQuery(query);
    
    const filter = { status: BookStatus.AVAILABLE };
    const sort: { [key: string]: SortOrder } = { createdAt: -1 as SortOrder };

    const [books, totalItems] = await Promise.all([
      Book.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('metadata.addedBy', 'name email'),
      Book.countDocuments(filter),
    ]);

    const pagination = PaginationUtil.calculatePagination(totalItems, page, limit);

    return {
      books,
      pagination,
    };
  }

  async updateAvailability(id: string, change: number): Promise<IBook | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const book = await Book.findById(id);
    if (!book) {
      return null;
    }

    await book.updateAvailability(change);
    return book;
  }

  async incrementBookingCount(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return;
    }

    await Book.findByIdAndUpdate(
      id,
      { $inc: { 'metadata.totalBookings': 1 } }
    );
  }

  async getBookStats() {
    const [totalBooks, availableBooks, bookedBooks, maintenanceBooks, copyStats, allBooks] = await Promise.all([
      Book.countDocuments({}),
      Book.countDocuments({ status: BookStatus.AVAILABLE }),
      Book.countDocuments({ status: BookStatus.BOOKED }),
      Book.countDocuments({ status: BookStatus.MAINTENANCE }),
      Book.aggregate([
        {
          $match: {
            'availability.totalCopies': { $type: 'number', $gte: 0, $lte: 1000 },
            'availability.availableCopies': { $type: 'number', $gte: 0, $lte: 1000 }
          }
        },
        {
          $group: {
            _id: null,
            totalCopies: { $sum: '$availability.totalCopies' },
            availableCopies: { $sum: '$availability.availableCopies' },
          }
        }
      ]),
      Book.find({}).select('title availability').limit(10)
    ]);

    const copies = copyStats[0] || { totalCopies: 0, availableCopies: 0 };

    console.log('📊 Book Stats Debug:');
    console.log('Total Books:', totalBooks);
    console.log('All Sample Books:', allBooks.map(b => ({
      title: b.title,
      totalCopies: b.availability?.totalCopies,
      totalCopiesType: typeof b.availability?.totalCopies,
      availableCopies: b.availability?.availableCopies,
      availableCopiesType: typeof b.availability?.availableCopies
    })));
    console.log('Aggregated Total Copies:', copies.totalCopies);
    console.log('Aggregated Available Copies:', copies.availableCopies);

    return {
      totalBooks,
      availableBooks,
      bookedBooks,
      maintenanceBooks,
      totalCopies: copies.totalCopies,
      availableCopies: copies.availableCopies,
      borrowedCopies: copies.totalCopies - copies.availableCopies,
    };
  }

  async getCategories(): Promise<string[]> {
    const categories = await Book.distinct('category');
    return categories.sort();
  }

  async getCategoryStats() {
    const stats = await Book.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          available: {
            $sum: {
              $cond: [{ $eq: ['$status', BookStatus.AVAILABLE] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    return stats.map(stat => ({
      category: stat._id,
      totalBooks: stat.count,
      availableBooks: stat.available,
    }));
  }

  async findByISBN(isbn: string): Promise<IBook | null> {
    return await Book.findOne({ isbn });
  }

  async exists(isbn: string): Promise<boolean> {
    const book = await Book.findOne({ isbn });
    return !!book;
  }

  async countDocuments(filter: any = {}): Promise<number> {
    return await Book.countDocuments(filter);
  }

  async getFeaturedBooks(query: any) {
    const popularBooks = await this.findPopular(query);
    const recentlyAddedBooks = await this.findRecentlyAdded(query);
    // Assuming you have a method for recommended books
    const recommendedBooks = await this.findPopular(query); // Placeholder

    return {
      popularBooks: popularBooks.books,
      recentlyAddedBooks: recentlyAddedBooks.books,
      recommendedBooks: recommendedBooks.books,
    };
  }
}
