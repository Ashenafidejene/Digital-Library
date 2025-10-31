import { Booking, IBooking } from '../entities/Booking';
import { AppError, BookingStatus, PaginationQuery } from '../types';
import { escapeRegExp } from '../utils';
import { Types } from 'mongoose';
export interface BookingQuery extends PaginationQuery {
  status?: BookingStatus;
  userId?: string;
  bookId?: string;
  search?: string;
}

export class BookingRepository {
  private buildQuery(query: BookingQuery) {
    const dbQuery: any = {};

    if (query.status) {
      dbQuery.status = query.status;
    }
     if (query.userId && Types.ObjectId.isValid(query.userId)) {
    // Convert the string to a real ObjectId
    dbQuery.userId = new Types.ObjectId(query.userId);
     }
  if (query.bookId && Types.ObjectId.isValid(query.bookId)) {
    dbQuery.bookId = new Types.ObjectId(query.bookId);
  }
    if (query.search) {
      const searchRegex = new RegExp(escapeRegExp(query.search), 'i');
      dbQuery.$or = [{ 'user.name': searchRegex }, { 'book.title': searchRegex }];
    }

    return dbQuery;
  }

  public async findAll(query: BookingQuery) {
    console.log("this query " ,query);
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;
    const dbQuery = this.buildQuery(query);
    console.log("this query dbquery " ,dbQuery);
    const [records, totalItems] = await Promise.all([
      (Booking as any)
        .find(dbQuery)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email')
        .populate('book', 'title author'),
      (Booking as any).countDocuments(dbQuery),
    ]);
    console.log("this query records " ,records);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      records,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  public async findById(id: string): Promise<IBooking | null> {
    return await (Booking as any).findById(id);
  }

  public async findByIdWithDetails(id: string): Promise<IBooking | null> {
    return await (Booking as any)
      .findById(id)
      .populate('user', 'name email')
      .populate('book', 'title author');
  }

  public async findByUserId(userId: string, query: BookingQuery) {
    const { page = 1, limit = 1000, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const dbQuery: any = {
      userId: new Types.ObjectId(userId),
      status: query.status || { $in: [BookingStatus.APPROVED, BookingStatus.OVERDUE] },
    };

    const [records, totalItems] = await Promise.all([
      (Booking as any)
        .find(dbQuery)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit)
        .populate('book', 'title author coverImage'),
      (Booking as any).countDocuments(dbQuery),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    const formattedRecords = records.map((booking: any) => ({
      id: booking._id,
      title: booking.book.title,
      author: booking.book.author,
      coverImage: booking.book.coverImage,
      status: booking.status,
      borrowedDate: booking.borrowDate,
      returnedDate: booking.returnDate,
      reservedDate: booking.createdAt,
      dueDate: booking.dueDate,
      borrowPeriodDays: booking.borrowPeriodDays,
    }));

    return {
      records: formattedRecords,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  public async findByBookId(bookId: string, query: PaginationQuery) {
    return await this.findAll({ ...query, bookId });
  }

  public async findPendingBookings(query: PaginationQuery) {
    return await this.findAll({ ...query, status: BookingStatus.PENDING });
  }

  public async findOverdueBookings(query: PaginationQuery) {
    return await this.findAll({ ...query, status: BookingStatus.OVERDUE });
  }

  public async findActiveBookingForUserAndBook(
    userId: string,
    bookId: string
  ): Promise<IBooking | null> {
    return await (Booking as any).findOne({
      user: userId,
      book: bookId,
      status: { $in: [BookingStatus.PENDING, BookingStatus.APPROVED, BookingStatus.OVERDUE] },
    });
  }

  public async create(data: Partial<IBooking>): Promise<IBooking> {
    const booking = new (Booking as any)(data);
    await booking.save();
    return booking;
  }

  public async update(id: string, data: Partial<IBooking>): Promise<IBooking | null> {
    return await (Booking as any).findByIdAndUpdate(id, data, { new: true });
  }

  public async delete(id: string): Promise<boolean> {
    const result = await (Booking as any).deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  public async aggregate(pipeline: any[]): Promise<any[]> {
    return await (Booking as any).aggregate(pipeline);
  }

  public async getBookingStats() {
    const stats = await (Booking as any).aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      returned: 0,
      overdue: 0,
    };

    stats.forEach((stat: { _id: BookingStatus; count: number }) => {
      result[stat._id] = stat.count;
      result.total += stat.count;
    });

    return result;
  }

  public async getUserBookingHistory(userId: string, query: PaginationQuery) {
    return await this.findAll({
      ...query,
      userId,
      status: BookingStatus.RETURNED,
    });
  }

  public async getPopularBooks(query: PaginationQuery) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    return await (Booking as any).aggregate([
      { $group: { _id: '$book', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'bookDetails',
        },
      },
      { $unwind: '$bookDetails' },
      {
        $project: {
          book: '$bookDetails',
          borrowCount: '$count',
        },
      },
    ]);
  }

  public async findBookingsDueSoon(days: number) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);

    return await (Booking as any)
      .find({
        status: BookingStatus.APPROVED,
        dueDate: { $lte: dueDate },
      })
      .populate('user', 'name email')
      .populate('book', 'title');
  }

  public async findRecentUserBookings(userId: string, days: number) {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    return await (Booking as any)
      .find({
        user: userId,
        createdAt: { $gte: sinceDate },
      })
      .populate('user', 'name email')
      .populate('book', 'title')
      .sort({ createdAt: 'desc' });
  }

  public async updateOverdueBookings(): Promise<number> {
    const now = new Date();
    const result = await (Booking as any).updateMany(
      {
        status: BookingStatus.APPROVED,
        dueDate: { $lt: now },
      },
      {
        $set: { status: BookingStatus.OVERDUE },
      }
    );
    return result.modifiedCount;
  }
}
