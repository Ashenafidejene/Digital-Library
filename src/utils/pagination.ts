import { PaginationQuery } from '../types';

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface PaginationResult {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export class PaginationUtil {
  static parseQuery(query: PaginationQuery): PaginationOptions {
    const page = Math.max(1, parseInt(query.page?.toString() || '1', 10));
    const limit = Math.min(500, Math.max(1, parseInt(query.limit?.toString() || '500', 10)));
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    return {
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
    };
  }

  static calculatePagination(
    totalItems: number,
    currentPage: number,
    itemsPerPage: number
  ): PaginationResult {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    return {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      hasNextPage,
      hasPrevPage,
    };
  }

  static buildSortObject(sortBy: string, sortOrder: 'asc' | 'desc'): Record<string, 1 | -1> {
    return {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };
  }

  static buildSearchFilter(searchTerm?: string, searchFields: string[] = []): Record<string, any> {
    if (!searchTerm || searchFields.length === 0) {
      return {};
    }

    const searchRegex = new RegExp(searchTerm, 'i');
    
    return {
      $or: searchFields.map(field => ({
        [field]: searchRegex,
      })),
    };
  }

  static buildDateRangeFilter(
    startDate?: string,
    endDate?: string,
    dateField: string = 'createdAt'
  ): Record<string, any> {
    const filter: Record<string, any> = {};

    if (startDate || endDate) {
      filter[dateField] = {};
      
      if (startDate) {
        filter[dateField].$gte = new Date(startDate);
      }
      
      if (endDate) {
        filter[dateField].$lte = new Date(endDate);
      }
    }

    return filter;
  }

  static combineFilters(...filters: Record<string, any>[]): Record<string, any> {
    return filters.reduce((combined, filter) => {
      return { ...combined, ...filter };
    }, {});
  }
}
