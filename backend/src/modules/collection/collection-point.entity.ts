/**
 * CollectionPoint - a physical waste-sorting station at an event.
 *
 * Prisma model reference:
 *
 * model CollectionPoint {
 *   id        String   @id @default(cuid())
 *   eventId   String
 *   name      String
 *   latitude  Float
 *   longitude Float
 *   type      String   // "manual" | "smart_bin"
 *   binId     String?  // linked smart bin ID, if applicable
 *   event     Event    @relation(fields: [eventId], references: [id])
 *   readings  CollectionReading[]
 *   createdAt DateTime @default(now())
 * }
 */

export interface CollectionPoint {
  id: string;
  eventId: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'manual' | 'smart_bin';
  binId?: string;
  createdAt: Date;
}
