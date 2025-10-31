import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { EventRepository } from '../repositories/EventRepository';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { UserRepository } from '../repositories/UserRepository';
import AppError from '../utils/AppError';
import { ResponseUtil } from '../utils/response';

const eventRepository = new EventRepository();
const notificationRepository = new NotificationRepository();
const userRepository = new UserRepository();

export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, date, location, organizer, authorId, authorName } = req.body;
  const imageUrl = req.file
    ? req.file.path
    : 'https://res.cloudinary.com/dtkg4wfr2/image/upload/v1721898579/digital-library/events/default-event_axo12k.jpg';

  const event = await eventRepository.create({
    title,
    description,
    date,
    location,
    organizer,
    status: 'upcoming', // Explicitly set status
    authorId,
    authorName,
    image: imageUrl,
  });

  const { users } = await userRepository.findAll({});
  for (const user of users) {
    if (user && user._id) {
      await notificationRepository.create(user._id.toString(), `New event: ${title}`);
    } else {
      console.warn('Attempted to create notification for a user with a missing ID.');
    }
  }

  ResponseUtil.created(res, event, 'Event created successfully');
});

export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
    const { title, description, date, location, organizer, status } = req.body;
    const imageUrl = req.file ? req.file.path : undefined;

    const updatedEvent = await eventRepository.update(id, {
      title,
      description,
      date,
      location,
      organizer,
      status,
      image: imageUrl,
    });

    if (!updatedEvent) {
      throw new AppError('Event not found', 404);
    }

  ResponseUtil.updated(res, updatedEvent, 'Event updated successfully');
});

export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
    await eventRepository.delete(id);
  ResponseUtil.deleted(res, 'Event deleted successfully');
});

export const getEventById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
    const event = await eventRepository.findById(id);

    if (!event) {
      throw new AppError('Event not found', 404);
    }

  ResponseUtil.success(res, event);
});

export const getAllEvents = asyncHandler(async (req: Request, res: Response) => {
  const { events } = await eventRepository.findAll(req.query);
  ResponseUtil.success(res, events, 'Events retrieved successfully');
});
