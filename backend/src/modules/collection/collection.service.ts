import prisma from '../../config/db';
import { config } from '../../config/env';

export class CollectionService {
  async createCollectionPoint(data: {
    eventId: string;
    name: string;
    latitude: number;
    longitude: number;
    type: string;
    binId?: string;
  }) {
    return prisma.collectionPoint.create({ data });
  }

  async getCollectionPointsByEvent(eventId: string) {
    return prisma.collectionPoint.findMany({
      where: { eventId },
      include: { readings: true },
    });
  }

  async submitReading(data: {
    collectionPointId: string;
    userId: string;
    imageUrl?: string;
    totalWeightKg?: number;
  }) {
    let cvResult = {
      lanyardCount: 0,
      plasticCount: 0,
      metalCount: 0,
      glassCount: 0,
      otherCount: 0,
      cvConfidence: undefined as number | undefined,
    };

    // If an image was uploaded, send it to the CV service for analysis
    if (data.imageUrl) {
      try {
        const response = await fetch(`${config.CV_SERVICE_URL}/analyze-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: data.imageUrl }),
        });
        if (response.ok) {
          cvResult = await response.json();
        }
      } catch (error) {
        console.error('CV service unavailable, storing reading without CV data');
      }
    }

    return prisma.collectionReading.create({
      data: {
        collectionPointId: data.collectionPointId,
        userId: data.userId,
        imageUrl: data.imageUrl,
        totalWeightKg: data.totalWeightKg,
        ...cvResult,
      },
    });
  }

  async getReadingsByPoint(collectionPointId: string) {
    return prisma.collectionReading.findMany({
      where: { collectionPointId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async verifyReading(readingId: string) {
    return prisma.collectionReading.update({
      where: { id: readingId },
      data: { verified: true },
    });
  }
}
