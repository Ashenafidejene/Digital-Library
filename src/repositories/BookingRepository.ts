import { Booking, IBooking } from '../entities/Booking';
import { BookingStatus, PaginationQuery } from '../types';
import { PaginationUtil } from '../utils/pagination';
import mongoose from 'mongoose';

export interface BookingQuery extends PaginationQuery {
  userId?: string;
  bookId?: string;
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
}

export class BookingRepository {
  async create(bookingData: Partial<IBooking>): Promise<IBooking> {
    const booking = new Booking(bookingData);
    return await booking.save();
  }

  async findById(id: string): Promise<IBooking | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Booking.findById(id)
      .populate('userId', 'name email')
      .populate('bookId', 'title author category');
  }

  async findByIdWithDetails(id: string): Promise<IBooking | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Booking.findById(id)
      .populate('userId', 'name email phoneNumber')
      .populate('bookId', 'title author category isbn location')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email');
  }

  async update(id: string, updateData: Partial<IBooking>): Promise<IBooking | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    
    return await Booking.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email')
      .populate('bookId', 'title author category');
  }

  async delete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    
    const result = await Booking.findByIdAndDelete(id);
    return !!result;
  }

  async findAll(query: BookingQuery) {
    const { page, limit, skip, sortBy, sortOrder } = PaginationUtil.parseQuery(query);
    
    // Build filter
    const filter: any = {};
    
    if (query.userId) {
      filter.userId = query.userId;
    }
    
    if (query.bookId) {
      filter.bookId = query.bookId;
    }
    
    if (query.status) {
      filter.status = query.status;
    }

    // Date range filter
    if (query.startDate || query.endDate) {
      filter.requestDate = {};
      if (query.startDate) {
        filter.requestDate.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        filter.requestDate.$lte = new Date(query.endDate);
      }
    }

    // Build sort
    const sort = PaginationUtil.buildSortObject(sortBy, sortOrder);

    // Execute queries
    const [bookings, totalItems] = await Promise.all([
      Booking.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email')
        .populate('bookId', 'title author category')
        .populate('approvedBy', 'name email')
        .populate('rejectedBy', 'name email')
        .lean(),
      Booking.countDocuments(filter),
    ]);

    const pagination = PaginationUtil.calculatePagination(totalItems, page, limit);

    return {
      bookings,
      pagination,
    };
  }

  async findByUserId(userId: string, query: PaginationQuery) {
    const bookingQuery: BookingQuery = {
      ...query,
      userId,
    };
    return this.findAll(bookingQuery);
  }

  async findByBookId(bookId: string, query: PaginationQuery) {
    const bookingQuery: BookingQuery = {
      ...query,
      bookId,
    };
    return this.findAll(bookingQuery);
  }

  async findByStatus(status: BookingStatus, query: PaginationQuery) {
    const statusQuery: BookingQuery = {
      ...query,
      status,
    };
    return this.findAll(statusQuery);
  }

  async findPendingBookings(query: PaginationQuery) {
    return this.findByStatus(BookingStatus.PENDING, query);
  }

  async findOverdueBookings(query: PaginationQuery) {
    const { page, limit, skip, sortBy, sortOrder } = PaginationUtil.parseQuery(query);
    
    const filter = {
      status: BookingStatus.APPROVED,
      dueDate: { $lt: new Date() },
    };

    const sort = PaginationUtil.buildSortObject(sortBy, sortOrder);

    const [bookings, totalItems] = await Promise.all([
      Booking.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email phoneNumber')
        .populate('bookId', 'title author category')
        .lean(),
      Booking.countDocuments(filter),
    ]);

    const pagination = PaginationUtil.calculatePagination(totalItems, page, limit);

    return {
      bookings,
      pagination,
    };
  }

  async findActiveBookingForUserAndBook(userId: string, bookId: string): Promise<IBooking | null> {
    return await Booking.findOne({
      userId,
      bookId,
      status: { $in: [BookingStatus.PENDING, BookingStatus.APPROVED] },
    });
  }

  async countByStatus(status: BookingStatus): Promise<number> {
    return await Booking.countDocuments({ status });
  }

  async countOverdueBookings(): Promise<number> {
    return await Booking.countDocuments({
      status: BookingStatus.APPROVED,
      dueDate: { $lt: new Date() },
    });
  }

  async getBookingStats() {
    const [totalBookings, pendingBookings, approvedBookings, rejectedBookings, returnedBookings, overdueBookings] = await Promise.all([
      Booking.countDocuments({}),
      this.countByStatus(BookingStatus.PENDING),
      this.countByStatus(BookingStatus.APPROVED),
      this.countByStatus(BookingStatus.REJECTED),
      this.countByStatus(BookingStatus.RETURNED),
      this.countOverdueBookings(),
    ]);

    return {
      totalBookings,
      pendingBookings,
      approvedBookings,
      rejectedBookings,
      returnedBookings,
      overdueBookings,
    };
  }

  async findBookingsDueSoon(days: number = 3): Promise<IBooking[]> {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);

    return await Booking.find({
      status: BookingStatus.APPROVED,
      dueDate: { $lte: dueDate, $gte: new Date() },
    })
      .populate('userId', 'name email phoneNumber')
      .populate('bookId', 'title author')
      .sort({ dueDate: 1 });
  }

  async getUserBookingHistory(userId: string, query: PaginationQuery) {
    const { page, limit, skip, sortBy, sortOrder } = PaginationUtil.parseQuery(query);
    
    const filter = { userId };
    const sort = PaginationUtil.buildSortObject(sortBy, sortOrder);

    const [bookings, totalItems] = await Promise.all([
      Booking.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('bookId', 'title author category coverImage')
        .lean(),
      Booking.countDocuments(filter),
    ]);

    const pagination = PaginationUtil.calculatePagination(totalItems, page, limit);

    return {
      bookings,
      pagination,
    };
  }

  async getPopularBooks(query: PaginationQuery) {
    const { page, limit, skip } = PaginationUtil.parseQuery(query);

    const popularBooks = await Booking.aggregate([
      {
        $group: {
          _id: '$bookId',
          bookingCount: { $sum: 1 },
          lastBooking: { $max: '$requestDate' },
        },
      },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'book',
        },
      },
      {
        $unwind: '$book',
      },
      {
        $sort: { bookingCount: -1, lastBooking: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $project: {
          book: 1,
          bookingCount: 1,
          lastBooking: 1,
        },
      },
    ]);

    const totalItems = await Booking.aggregate([
      {
        $group: {
          _id: '$bookId',
        },
      },
      {
        $count: 'total',
      },
    ]);

    const total = totalItems.length > 0 ? totalItems[0].total : 0;
    const pagination = PaginationUtil.calculatePagination(total, page, limit);

    return {
      books: popularBooks,
      pagination,
    };
  }

  async updateOverdueBookings(): Promise<number> {
    const result = await Booking.updateMany(
      {
        status: BookingStatus.APPROVED,
        dueDate: { $lt: new Date() },
      },
      {
        $set: { status: BookingStatus.OVERDUE },
      }
    );

    return result.modifiedCount;
  }
}
