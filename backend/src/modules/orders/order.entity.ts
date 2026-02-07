/**
 * Order entities - purchase/sale of recycled materials.
 *
 * Prisma model reference:
 *
 * model Order {
 *   id          String   @id @default(cuid())
 *   buyerName   String
 *   buyerEmail  String
 *   status      String   @default("pending") // pending | confirmed | shipped | delivered | cancelled
 *   totalAmount Float
 *   notes       String?
 *   items       OrderItem[]
 *   createdAt   DateTime @default(now())
 *   updatedAt   DateTime @updatedAt
 * }
 *
 * model OrderItem {
 *   id              String  @id @default(cuid())
 *   orderId         String
 *   inventoryItemId String
 *   quantity        Int
 *   unitPrice       Float
 *   order           Order         @relation(fields: [orderId], references: [id])
 *   inventoryItem   InventoryItem @relation(fields: [inventoryItemId], references: [id])
 * }
 */

export interface Order {
  id: string;
  buyerName: string;
  buyerEmail: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
