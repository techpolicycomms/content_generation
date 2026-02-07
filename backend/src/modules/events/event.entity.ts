/**
 * Event entity - represents a waste collection or recycling event.
 *
 * Prisma model reference:
 *
 * model Event {
 *   id          String   @id @default(cuid())
 *   title       String
 *   description String?
 *   date        DateTime
 *   location    String
 *   latitude    Float?
 *   longitude   Float?
 *   status      String   @default("planned") // planned | active | completed | cancelled
 *   organiserId String
 *   organiser   User     @relation(fields: [organiserId], references: [id])
 *   participants EventParticipant[]
 *   collectionPoints CollectionPoint[]
 *   createdAt   DateTime @default(now())
 *   updatedAt   DateTime @updatedAt
 * }
 *
 * model EventParticipant {
 *   id      String @id @default(cuid())
 *   eventId String
 *   userId  String
 *   role    String @default("volunteer") // volunteer | lead | observer
 *   event   Event  @relation(fields: [eventId], references: [id])
 *   user    User   @relation(fields: [userId], references: [id])
 *   @@unique([eventId, userId])
 * }
 */

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: Date;
  location: string;
  latitude?: number;
  longitude?: number;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  organiserId: string;
  createdAt: Date;
  updatedAt: Date;
}
