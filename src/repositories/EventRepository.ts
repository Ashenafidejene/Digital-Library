import { Event, IEvent } from '../entities/Event';

export class EventRepository {
  async findAll(options: any): Promise<{ events: IEvent[]; pagination: any }> {
    const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'asc', search, status } = options;
    const query: any = {};

    if (search) {
      query.$or = [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
    }

    if (status) {
      query.status = status;
    }

    const [events, total] = await Promise.all([
      Event.find(query)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      Event.countDocuments(query),
    ]);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    };

    return { events, pagination };
  }

  async findById(id: string): Promise<IEvent | null> {
    return Event.findById(id).exec();
  }

  async create(data: Partial<IEvent>): Promise<IEvent> {
    return Event.create(data);
  }

  async update(id: string, data: Partial<IEvent>): Promise<IEvent | null> {
    return Event.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await Event.findByIdAndDelete(id).exec();
  }
}
