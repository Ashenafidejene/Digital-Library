import { Router } from 'express';
import { authenticate } from '../middleware';
import { EventRepository } from '../repositories/EventRepository';
import { AnnouncementRepository } from '../repositories/AnnouncementRepository';

const router = Router();
const eventRepository = new EventRepository();
const announcementRepository = new AnnouncementRepository();

router.use(authenticate);

router.get('/events', async (req, res) => {
  try {
    const { events } = await eventRepository.findAll({});
    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events' });
  }
});

router.get('/announcements', async (req, res) => {
  try {
    const { announcements } = await announcementRepository.findAll({});
    res.json({ announcements });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching announcements' });
  }
});

export default router;
