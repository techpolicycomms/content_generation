import prisma from '../../config/db';

export class EventService {
  async create(data: {
    title: string;
    description?: string;
    date: Date;
    location: string;
    latitude?: number;
    longitude?: number;
    organiserId: string;
  }) {
    return prisma.event.create({ data });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        skip,
        take: limit,
        include: { organiser: { select: { id: true, name: true } } },
        orderBy: { date: 'desc' },
      }),
      prisma.event.count(),
    ]);
    return { events, total, page, limit };
  }

  async findById(id: string) {
    return prisma.event.findUnique({
      where: { id },
      include: {
        organiser: { select: { id: true, name: true } },
        participants: { include: { user: { select: { id: true, name: true } } } },
        collectionPoints: true,
      },
    });
  }

  async update(id: string, data: Partial<{ title: string; description: string; date: Date; location: string; status: string }>) {
    return prisma.event.update({ where: { id }, data });
  }

  async addParticipant(eventId: string, userId: string, role = 'volunteer') {
    return prisma.eventParticipant.create({
      data: { eventId, userId, role },
    });
  }

  async removeParticipant(eventId: string, userId: string) {
    return prisma.eventParticipant.delete({
      where: { eventId_userId: { eventId, userId } },
    });
  }
}
