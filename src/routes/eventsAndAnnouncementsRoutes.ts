import { Router } from 'express';
import { authenticate, authorize, validateObjectId, handleValidationErrors, optionalAuth } from '../middleware';
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

// Public routes (no authentication required)
router.get('/events', getAllEvents);
router.get('/announcements', getAllAnnouncements);
router.get(
  '/announcements/:id',
  validateObjectId('id'),
  handleValidationErrors,
  getAnnouncementById
);

// Protected routes (authentication required)
router.use(authenticate);

router.post('/events', authorize(UserRole.ADMIN), upload.single('image'), createEvent);
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
