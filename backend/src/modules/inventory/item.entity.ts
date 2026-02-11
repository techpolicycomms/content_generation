/**
 * InventoryItem - individual tracked items from processed batches.
 *
 * Prisma model reference:
 *
 * model InventoryItem {
 *   id          String  @id @default(cuid())
 *   batchId     String
 *   sku         String  @unique
 *   name        String
 *   description String?
 *   quantity    Int
 *   unitPrice   Float?
 *   location    String? // Warehouse location
 *   batch       Batch   @relation(fields: [batchId], references: [id])
 *   orderItems  OrderItem[]
 *   createdAt   DateTime @default(now())
 *   updatedAt   DateTime @updatedAt
 * }
 */

export interface InventoryItem {
  id: string;
  batchId: string;
  sku: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice?: number;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}
