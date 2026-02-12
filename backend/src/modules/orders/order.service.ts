import prisma from '../../config/db';

export class OrderService {
  async create(data: {
    buyerName: string;
    buyerEmail: string;
    notes?: string;
    items: { inventoryItemId: string; quantity: number; unitPrice: number }[];
  }) {
    const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    return prisma.order.create({
      data: {
        buyerName: data.buyerName,
        buyerEmail: data.buyerEmail,
        notes: data.notes,
        totalAmount,
        items: {
          create: data.items,
        },
      },
      include: { items: true },
    });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        skip,
        take: limit,
        include: { items: { include: { inventoryItem: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count(),
    ]);
    return { orders, total, page, limit };
  }

  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: { items: { include: { inventoryItem: true } } },
    });
  }

  async updateStatus(id: string, status: string) {
    return prisma.order.update({ where: { id }, data: { status } });
  }
}
