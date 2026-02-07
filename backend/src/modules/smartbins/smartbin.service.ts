import prisma from '../../config/db';

export class SmartBinService {
  async register(data: {
    deviceId: string;
    apiKey: string;
    name: string;
    latitude: number;
    longitude: number;
    binType: string;
  }) {
    return prisma.smartBin.create({ data });
  }

  async findAll(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [bins, total] = await Promise.all([
      prisma.smartBin.findMany({
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.smartBin.count(),
    ]);
    return { bins, total, page, limit };
  }

  async findByDeviceId(deviceId: string) {
    return prisma.smartBin.findUnique({ where: { deviceId } });
  }

  async updateFillLevel(deviceId: string, fillLevel: number) {
    return prisma.smartBin.update({
      where: { deviceId },
      data: { fillLevel, lastPingAt: new Date() },
    });
  }

  async recordEvent(binId: string, eventType: string, payload: Record<string, unknown>) {
    return prisma.smartBinEvent.create({
      data: { binId, eventType, payload },
    });
  }

  async getEvents(binId: string, limit = 100) {
    return prisma.smartBinEvent.findMany({
      where: { binId },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(deviceId: string, status: string) {
    return prisma.smartBin.update({
      where: { deviceId },
      data: { status },
    });
  }
}
