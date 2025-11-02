import { Request, Response, NextFunction } from 'express';
import { BookService } from '../services/BookService';
import { ResponseUtil } from '../utils/response';
import { catchAsync } from '../middleware/errorHandler';
import { AppError, BookStatus } from '../types';
import { Console } from 'console';

export class BookController {
  private bookService: BookService;

  constructor() {
    this.bookService = new BookService();
  }

  createBook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    console.log(req);
    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const bookData = req.body;
    const book = await this.bookService.createBook(bookData, userId);

    ResponseUtil.created(res, book, 'Book created successfully');
  });

  getBookById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const book = await this.bookService.getBookById(id);

    ResponseUtil.success(res, book, 'Book retrieved successfully');
  });

  updateBook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const updateData = req.body;
    const updatedBook = await this.bookService.updateBook(id, updateData, userId);

    ResponseUtil.updated(res, updatedBook, 'Book updated successfully');
  });

  deleteBook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    await this.bookService.deleteBook(id);
    ResponseUtil.deleted(res, 'Book deleted successfully');
  });

  getAllBooks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    console.log('[User Book Controller] Getting all books. Query:', req.query);
    try {
      const query = req.query;
      const result = await this.bookService.getAllBooks(query);
      console.log(`[User Book Controller] Found ${result.books.length} books.`);
      console.log('[User Book Controller] Sample book data:', result.books.length > 0 ? result.books[0] : 'No books found');

      ResponseUtil.paginated(
        res,
        result.books,
        result.pagination,
        'Books retrieved successfully'
      );
    } catch (error) {
      console.error('[User Book Controller] Error in getAllBooks:', error);
      next(error);
    }
  });

  getAvailableBooks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await this.bookService.getAvailableBooks(query);

    ResponseUtil.paginated(
      res,
      result.books,
      result.pagination,
      'Available books retrieved successfully'
    );
  });

  getPopularBooks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await this.bookService.getPopularBooks(query);

    ResponseUtil.paginated(
      res,
      result.books,
      result.pagination,
      'Popular books retrieved successfully'
    );
  });

  getRecentlyAddedBooks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await this.bookService.getRecentlyAddedBooks(query);

    ResponseUtil.paginated(
      res,
      result.books,
      result.pagination,
      'Recently added books retrieved successfully'
    );
  });

  searchBooks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { search } = req.query;

    if (!search || typeof search !== 'string') {
      return next(new AppError('Search term is required', 400));
    }

    const result = await this.bookService.searchBooks(search, req.query);

    ResponseUtil.paginated(
      res,
      result.books,
      result.pagination,
      'Book search completed successfully'
    );
  });

  getBooksByCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { category } = req.params;
    const result = await this.bookService.getBooksByCategory(category, req.query);

    ResponseUtil.paginated(
      res,
      result.books,
      result.pagination,
      `Books in category ${category} retrieved successfully`
    );
  });

  getBooksByStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.params;

    if (!Object.values(BookStatus).includes(status as BookStatus)) {
      return next(new AppError('Invalid book status', 400));
    }

    const result = await this.bookService.getBooksByStatus(status as BookStatus, req.query);

    ResponseUtil.paginated(
      res,
      result.books,
      result.pagination,
      `Books with status ${status} retrieved successfully`
    );
  });

  updateBookStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(BookStatus).includes(status)) {
      return next(new AppError('Invalid book status', 400));
    }

    const updatedBook = await this.bookService.updateBookStatus(id, status);
    ResponseUtil.updated(res, updatedBook, 'Book status updated successfully');
  });

  getBookStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await this.bookService.getBookStats();
    ResponseUtil.success(res, stats, 'Book statistics retrieved successfully');
  });

  getCategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const categories = await this.bookService.getCategories();
    ResponseUtil.success(res, categories, 'Categories retrieved successfully');
  });

  getCategoryStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await this.bookService.getCategoryStats();
    ResponseUtil.success(res, stats, 'Category statistics retrieved successfully');
  });

  checkBookAvailability = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const availability = await this.bookService.checkBookAvailability(id);

    ResponseUtil.success(res, availability, 'Book availability checked successfully');
  });

  getBookByISBN = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { isbn } = req.params;
    const book = await this.bookService.getBookByISBN(isbn);

    ResponseUtil.success(res, book, 'Book retrieved by ISBN successfully');
  });

  getFeaturedBooks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await this.bookService.getFeaturedBooks(req.query);
    ResponseUtil.success(res, result, 'Featured books retrieved successfully');
  });
}
