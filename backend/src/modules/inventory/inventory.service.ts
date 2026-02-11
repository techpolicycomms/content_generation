import prisma from '../../config/db';

export class InventoryService {
  // Batch operations
  async createBatch(data: {
    materialType: string;
    weightKg: number;
    source: string;
    eventId?: string;
  }) {
    return prisma.batch.create({ data });
  }

  async listBatches(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [batches, total] = await Promise.all([
      prisma.batch.findMany({
        skip,
        take: limit,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.batch.count(),
    ]);
    return { batches, total, page, limit };
  }

  async updateBatchStatus(id: string, status: string) {
    return prisma.batch.update({ where: { id }, data: { status } });
  }

  // Inventory item operations
  async createItem(data: {
    batchId: string;
    sku: string;
    name: string;
    description?: string;
    quantity: number;
    unitPrice?: number;
    location?: string;
  }) {
    return prisma.inventoryItem.create({ data });
  }

  async listItems(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        skip,
        take: limit,
        include: { batch: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.inventoryItem.count(),
    ]);
    return { items, total, page, limit };
  }

  async getItem(id: string) {
    return prisma.inventoryItem.findUnique({
      where: { id },
      include: { batch: true },
    });
  }

  async updateItem(id: string, data: Partial<{ quantity: number; unitPrice: number; location: string }>) {
    return prisma.inventoryItem.update({ where: { id }, data });
  }
}
