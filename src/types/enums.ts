export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum BookStatus {
  AVAILABLE = 'available',
  BOOKED = 'booked',
  RESERVED = 'reserved',
  MAINTENANCE = 'maintenance',
  REMOVED = 'removed',
}

export enum BookingStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
}
