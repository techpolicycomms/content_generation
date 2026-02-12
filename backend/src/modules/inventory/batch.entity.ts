/**
 * Batch - a processed batch of recyclable material.
 *
 * Prisma model reference:
 *
 * model Batch {
 *   id           String   @id @default(cuid())
 *   materialType String   // "plastic" | "metal" | "glass" | "lanyard" | "mixed"
 *   weightKg     Float
 *   source       String   // Description of collection source
 *   eventId      String?
 *   processedAt  DateTime @default(now())
 *   status       String   @default("received") // received | processing | ready | sold
 *   items        InventoryItem[]
 *   createdAt    DateTime @default(now())
 *   updatedAt    DateTime @updatedAt
 * }
 */

export interface Batch {
  id: string;
  materialType: string;
  weightKg: number;
  source: string;
  eventId?: string;
  processedAt: Date;
  status: 'received' | 'processing' | 'ready' | 'sold';
  createdAt: Date;
  updatedAt: Date;
}
