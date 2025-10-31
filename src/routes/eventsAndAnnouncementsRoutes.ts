import { Router } from 'express';
import { authenticate, authorize, validateObjectId, handleValidationErrors } from '../middleware';
import { EventRepository } from '../repositories/EventRepository';
import { createEvent, getAllEvents } from '../controllers/EventController';
import {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/AnnouncementController';
import { upload } from '../middleware/upload';
import { UserRole } from '../types';

const router = Router();
const eventRepository = new EventRepository();

// All routes require authentication
router.use(authenticate);

// Event routes
router.get('/events', getAllEvents);

router.post('/events', authorize(UserRole.ADMIN), upload.single('image'), createEvent);

// Announcement routes
router.get('/announcements', getAllAnnouncements);
router.get(
  '/announcements/:id',
  validateObjectId('id'),
  handleValidationErrors,
  getAnnouncementById
);
router.post(
  '/announcements',
  authorize(UserRole.ADMIN),
  upload.single('image'),
  createAnnouncement
);
router.put(
  '/announcements/:id',
  authorize(UserRole.ADMIN),
  validateObjectId('id'),
  upload.single('image'),
  handleValidationErrors,
  updateAnnouncement
);
router.delete(
  '/announcements/:id',
  authorize(UserRole.ADMIN),
  validateObjectId('id'),
  handleValidationErrors,
  deleteAnnouncement
);

export default router;
