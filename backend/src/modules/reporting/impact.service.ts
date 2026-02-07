import prisma from '../../config/db';

export class ImpactService {
  /**
   * Aggregate impact metrics across all events and collections.
   */
  async getOverallImpact() {
    const [totalEvents, totalReadings, totalBatches, totalOrders] = await Promise.all([
      prisma.event.count(),
      prisma.collectionReading.aggregate({
        _sum: {
          lanyardCount: true,
          plasticCount: true,
          metalCount: true,
          glassCount: true,
          otherCount: true,
          totalWeightKg: true,
        },
      }),
      prisma.batch.aggregate({
        _sum: { weightKg: true },
        _count: true,
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        _count: true,
      }),
    ]);

    return {
      totalEvents,
      collection: {
        totalLanyards: totalReadings._sum.lanyardCount || 0,
        totalPlastic: totalReadings._sum.plasticCount || 0,
        totalMetal: totalReadings._sum.metalCount || 0,
        totalGlass: totalReadings._sum.glassCount || 0,
        totalOther: totalReadings._sum.otherCount || 0,
        totalWeightKg: totalReadings._sum.totalWeightKg || 0,
      },
      processing: {
        totalBatches: totalBatches._count,
        totalProcessedKg: totalBatches._sum.weightKg || 0,
      },
      sales: {
        totalOrders: totalOrders._count,
        totalRevenue: totalOrders._sum.totalAmount || 0,
      },
    };
  }

  /**
   * Get impact metrics for a specific event.
   */
  async getEventImpact(eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        participants: true,
        collectionPoints: {
          include: {
            readings: true,
          },
        },
      },
    });

    if (!event) throw new Error('Event not found');

    const readings = event.collectionPoints.flatMap(cp => cp.readings);
    return {
      eventId: event.id,
      title: event.title,
      participantCount: event.participants.length,
      collectionPointCount: event.collectionPoints.length,
      totalReadings: readings.length,
      totalWeightKg: readings.reduce((sum, r) => sum + (r.totalWeightKg || 0), 0),
      totalLanyards: readings.reduce((sum, r) => sum + r.lanyardCount, 0),
      totalPlastic: readings.reduce((sum, r) => sum + r.plasticCount, 0),
      totalMetal: readings.reduce((sum, r) => sum + r.metalCount, 0),
      totalGlass: readings.reduce((sum, r) => sum + r.glassCount, 0),
    };
  }
}
