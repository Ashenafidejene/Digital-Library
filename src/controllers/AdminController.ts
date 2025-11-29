import { Request, Response } from 'express';
import { AdminService } from '../services/AdminService';
import { asyncHandler } from '../utils/asyncHandler';
import { EventRepository } from '../repositories/EventRepository';
import { AnnouncementRepository } from '../repositories/AnnouncementRepository';
import { uploadToCloudinary } from '../utils/cloudinary';
import { Settings } from '../entities/Settings';

const adminService = new AdminService();
const eventRepository = new EventRepository();
const announcementRepository = new AnnouncementRepository();

export class AdminController {
  // Dashboard
  getDashboard = asyncHandler(async (req: Request, res: Response) => {
    const data = await adminService.getDashboardStats();
    res.status(200).json({ success: true, data });
  });

  getStats = asyncHandler(async (req: Request, res: Response) => {
    const data = await adminService.getSystemStats();
    res.status(200).json({ success: true, data });
  });

  getSystemActivity = asyncHandler(async (req: Request, res: Response) => {
    const data = await adminService.getSystemActivity();
    res.status(200).json({ success: true, data });
  });

  getSystemHealth = asyncHandler(async (req: Request, res: Response) => {
    const data = await adminService.getSystemHealth();
    res.status(200).json({ success: true, data });
  });

  getAuditLog = asyncHandler(async (req: Request, res: Response) => {
    const data = await adminService.getAuditLog(req.query);
    res.status(200).json({ success: true, data });
  });

  // User Management
  getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const data = await adminService.getAllUsers(req.query);
    res.status(200).json({ success: true, data });
  });

  promoteUserToAdmin = asyncHandler(async (req: Request, res: Response) => {
    const data = await adminService.promoteUserToAdmin(req.params.userId);
    res.status(200).json({ success: true, data });
  });

  demoteAdminToUser = asyncHandler(async (req: Request, res: Response) => {
    const data = await adminService.demoteAdminToUser(req.params.userId);
    res.status(200).json({ success: true, data });
  });

  blockUser = asyncHandler(async (req: Request, res: Response) => {
    const data = await adminService.blockUser(req.params.userId);
    res.status(200).json({ success: true, data });
  });

  unblockUser = asyncHandler(async (req: Request, res: Response) => {
    const data = await adminService.unblockUser(req.params.userId);
    res.status(200).json({ success: true, data });
  });

  getUserBorrowingHistory = asyncHandler(async (req: Request, res: Response) => {
    const data = await adminService.getUserBorrowingHistory(req.params.userId);
    res.status(200).json({ success: true, data });
  });

  bulkUpdateUsers = asyncHandler(async (req: Request, res: Response) => {
    await adminService.bulkUpdateUserStatus(req.body.userIds, req.body.status);
    res.status(200).json({ success: true });
  });

  resetUserPassword = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { newPassword } = req.body;
    const data = await adminService.resetUserPassword(userId, newPassword);
    res.status(200).json({ success: true, data, message: 'Password reset successfully' });
  });

  // Borrowing Management
  getBorrowingRecords = asyncHandler(async (req: Request, res: Response) => {
   
    const data = await adminService.getBorrowingRecords(req.query);
    console.log("you are right you are here",data);
    res.status(200).json({ success: true, data });
  });

  approveBorrowingRequest = asyncHandler(async (req: Request, res: Response) => {
    const data = await adminService.approveBorrowingRequest(req.params.recordId, req.user.id);
    res.status(200).json({ success: true, data });
  });

  rejectBorrowingRequest = asyncHandler(async (req: Request, res: Response) => {
    const data = await adminService.rejectBorrowingRequest(req.params.recordId, req.body.reason, req.user.id);
    res.status(200).json({ success: true, data });
  });

  returnBook = asyncHandler(async (req: Request, res: Response) => {
    const data = await adminService.returnBook(req.params.recordId);
    res.status(200).json({ success: true, data });
  });

  // Book Management
  getAllBooks = asyncHandler(async (req: Request, res: Response) => {
    const data = await adminService.getAllBooks(req.query);
    res.status(200).json({ success: true, data });
  });

  createBook = asyncHandler(async (req: Request, res: Response) => {
    const data = await adminService.createBook(req.body);
    res.status(201).json({ success: true, data });
  });

  updateBookStatus = asyncHandler(async (req: Request, res: Response) => {
    const data = await adminService.updateBookStatus(req.params.bookId, req.body.status);
    res.status(200).json({ success: true, data });
  });

  bulkUpdateBooks = asyncHandler(async (req: Request, res: Response) => {
    await adminService.bulkUpdateBookStatus(req.body.bookIds, req.body.status);
    res.status(200).json({ success: true });
  });

  // Export
  exportUsers = asyncHandler(async (req: Request, res: Response) => {
    const data = await adminService.exportUserData(req.query.format as 'json' | 'csv');
    res.status(200).json({ success: true, data });
  });

  exportBooks = asyncHandler(async (req: Request, res: Response) => {
    const data = await adminService.exportBookData(req.query.format as 'json' | 'csv');
    res.status(200).json({ success: true, data });
  });

  // Event Management
  getEvents = asyncHandler(async (req: Request, res: Response) => {
    const { events } = await eventRepository.findAll(req.query);
    res.status(200).json({ success: true, data: events });
  });

  createEvent = asyncHandler(async (req: Request, res: Response) => {
    const image = req.file ? await uploadToCloudinary(req.file.path) : undefined;
    const event = await eventRepository.create({ ...req.body, image });
    res.status(201).json({ success: true, data: event });
  });

  updateEvent = asyncHandler(async (req: Request, res: Response) => {
    const image = req.file ? await uploadToCloudinary(req.file.path) : undefined;
    const event = await eventRepository.update(req.params.eventId, { ...req.body, image });
    res.status(200).json({ success: true, data: event });
  });

  deleteEvent = asyncHandler(async (req: Request, res: Response) => {
    await eventRepository.delete(req.params.eventId);
    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  });

  // Announcement Management
  getAnnouncements = asyncHandler(async (req: Request, res: Response) => {
    const { announcements } = await announcementRepository.findAll(req.query);
    res.status(200).json({ success: true, data: announcements });
  });

  createAnnouncement = asyncHandler(async (req: Request, res: Response) => {
    const image = req.file ? await uploadToCloudinary(req.file.path) : undefined;
    const announcement = await announcementRepository.create({ ...req.body, image });
    res.status(201).json({ success: true, data: announcement });
  });

  updateAnnouncement = asyncHandler(async (req: Request, res: Response) => {
    const image = req.file ? await uploadToCloudinary(req.file.path) : undefined;
    const announcement = await announcementRepository.update(req.params.announcementId, { ...req.body, image });
    res.status(200).json({ success: true, data: announcement });
  });

  deleteAnnouncement = asyncHandler(async (req: Request, res: Response) => {
    await announcementRepository.delete(req.params.announcementId);
    res.status(200).json({ success: true, message: 'Announcement deleted successfully' });
  });

  toggleAnnouncementStatus = asyncHandler(async (req: Request, res: Response) => {
    const announcement = await announcementRepository.findById(req.params.announcementId);
    if (announcement) {
      announcement.status = announcement.status === 'published' ? 'draft' : 'published';
      await announcement.save();
      res.status(200).json({ success: true, data: announcement });
    } else {
      res.status(404).json({ success: false, message: 'Announcement not found' });
    }
  });

  // Settings Management
  getSettings = asyncHandler(async (req: Request, res: Response) => {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json({ success: true, data: settings });
  });

  updateSettings = asyncHandler(async (req: Request, res: Response) => {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    res.status(200).json({ success: true, data: settings, message: 'Settings updated successfully' });
  });
}
