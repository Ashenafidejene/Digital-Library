import { Announcement, IAnnouncement } from '../entities/Announcement';

export class AnnouncementRepository {
  async findAll(options: any): Promise<{ announcements: IAnnouncement[]; pagination: any }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, status, type } = options;
    const query: any = {};

    if (search) {
      query.$or = [{ title: { $regex: search, $options: 'i' } }, { content: { $regex: search, $options: 'i' } }];
    }

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    const [announcements, total] = await Promise.all([
      Announcement.find(query)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      Announcement.countDocuments(query),
    ]);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    };

    return { announcements, pagination };
  }

  async findById(id: string): Promise<IAnnouncement | null> {
    return Announcement.findById(id).exec();
  }

  async create(data: Partial<IAnnouncement>): Promise<IAnnouncement> {
    return Announcement.create(data);
  }

  async update(id: string, data: Partial<IAnnouncement>): Promise<IAnnouncement | null> {
    return Announcement.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await Announcement.findByIdAndDelete(id).exec();
  }
}
