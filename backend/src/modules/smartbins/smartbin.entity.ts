/**
 * SmartBin - IoT-enabled waste collection bin with sensors.
 *
 * Prisma model reference:
 *
 * model SmartBin {
 *   id           String   @id @default(cuid())
 *   deviceId     String   @unique // Hardware device identifier
 *   apiKey       String   // API key for device authentication
 *   name         String
 *   latitude     Float
 *   longitude    Float
 *   binType      String   // "recycling" | "compost" | "landfill" | "mixed"
 *   fillLevel    Float    @default(0) // 0-100 percentage
 *   batteryLevel Float?   // 0-100 percentage
 *   lastPingAt   DateTime?
 *   status       String   @default("active") // active | maintenance | offline
 *   events       SmartBinEvent[]
 *   createdAt    DateTime @default(now())
 *   updatedAt    DateTime @updatedAt
 * }
 *
 * model SmartBinEvent {
 *   id        String   @id @default(cuid())
 *   binId     String
 *   eventType String   // "fill_update" | "collection" | "error" | "classification"
 *   payload   Json     // Flexible JSON payload from sensor
 *   bin       SmartBin @relation(fields: [binId], references: [id])
 *   createdAt DateTime @default(now())
 * }
 */

export interface SmartBin {
  id: string;
  deviceId: string;
  name: string;
  latitude: number;
  longitude: number;
  binType: 'recycling' | 'compost' | 'landfill' | 'mixed';
  fillLevel: number;
  batteryLevel?: number;
  lastPingAt?: Date;
  status: 'active' | 'maintenance' | 'offline';
  createdAt: Date;
  updatedAt: Date;
}
