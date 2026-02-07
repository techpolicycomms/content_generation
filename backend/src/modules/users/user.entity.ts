/**
 * User entity / Prisma schema reference.
 *
 * Prisma model (defined in schema.prisma):
 *
 * model User {
 *   id        String     @id @default(cuid())
 *   email     String     @unique
 *   password  String?    // null for OAuth-only users
 *   name      String
 *   provider  String     @default("local") // "local" | "google" | "apple"
 *   providerId String?   // External provider user ID
 *   avatarUrl  String?
 *   createdAt DateTime   @default(now())
 *   updatedAt DateTime   @updatedAt
 *   roles     UserRole[]
 *   events    EventParticipant[]
 *   collections CollectionReading[]
 * }
 *
 * model UserRole {
 *   id     String @id @default(cuid())
 *   userId String
 *   role   String // "volunteer" | "organiser" | "ops_manager" | "city_official" | "admin"
 *   user   User   @relation(fields: [userId], references: [id])
 *   @@unique([userId, role])
 * }
 */

export type UserRole = 'volunteer' | 'organiser' | 'ops_manager' | 'city_official' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string | null;
  provider: string;
  providerId?: string | null;
  avatarUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  roles: { role: UserRole }[];
}
