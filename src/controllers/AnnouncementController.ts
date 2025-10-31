import { Request, Response } from 'express';
import { AnnouncementRepository } from '../repositories/AnnouncementRepository';
import { uploadImage } from '../utils/cloudinary';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { UserRepository } from '../repositories/UserRepository';
import AppError from '../utils/AppError';
import fs from 'fs';

const announcementRepository = new AnnouncementRepository();
const notificationRepository = new NotificationRepository();
const userRepository = new UserRepository();

export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const { title, content, type, priority, status, publishDate, expiryDate, authorId, authorName, targetAudience } = req.body;
    let imageUrl;

    if (req.file) {
      try {
        const cloudinaryUrl = await uploadImage(req.file.path);
        fs.unlinkSync(req.file.path); // Delete the temporary file
        imageUrl = cloudinaryUrl;
      } catch (error) {
        throw new AppError('Error uploading image', 500);
      }
    } else {
      imageUrl = 'https://res.cloudinary.com/dtkg4wfr2/image/upload/v1721898579/digital-library/announcements/default-announcement_y12j4g.jpg';
    }

    const announcement = await announcementRepository.create({
      title,
      content,
      type,
      priority,
      status,
      publishDate,
      expiryDate,
      authorId,
      authorName,
      targetAudience,
      image: imageUrl,
    });

    const { users } = await userRepository.findAll({});
    for (const user of users) {
      await notificationRepository.create(user.id, `New announcement: ${title}`);
    }

    res.status(201).json(announcement);
  } catch (error) {
    throw new AppError('Error creating announcement', 500);
  }
};

export const getAllAnnouncements = async (req: Request, res: Response) => {
  try {
    const { announcements } = await announcementRepository.findAll(req.query);
    res.status(200).json({
      success: true,
      message: 'Announcements retrieved successfully',
      data: announcements,
    });
  } catch (error) {
    throw new AppError('Error fetching announcements', 500);
  }
};

export const getAnnouncementById = async (req: Request, res: Response) => {
  try {
    const announcement = await announcementRepository.findById(req.params.id);
    if (!announcement) {
      throw new AppError('Announcement not found', 404);
    }
    res.status(200).json(announcement);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Error fetching announcement', 500);
  }
};

export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, type, priority, status, publishDate, expiryDate, authorId, authorName, targetAudience } = req.body;
    let imageUrl;

    if (req.file) {
      try {
        const cloudinaryUrl = await uploadImage(req.file.path);
        fs.unlinkSync(req.file.path); // Delete the temporary file
        imageUrl = cloudinaryUrl;
      } catch (error) {
        throw new AppError('Error uploading image', 500);
      }
    }

    const updatedAnnouncement = await announcementRepository.update(id, {
      title,
      content,
      type,
      priority,
      status,
      publishDate,
      expiryDate,
      authorId,
      authorName,
      targetAudience,
      image: imageUrl,
    });

    if (!updatedAnnouncement) {
      throw new AppError('Announcement not found', 404);
    }

    res.status(200).json(updatedAnnouncement);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Error updating announcement', 500);
  }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await announcementRepository.delete(id);
    res.status(200).json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Error deleting announcement', 500);
  }
};
