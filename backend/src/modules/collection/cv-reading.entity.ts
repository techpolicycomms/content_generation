/**
 * CollectionReading - a CV-analysed or manual reading of collected waste.
 *
 * Prisma model reference:
 *
 * model CollectionReading {
 *   id               String   @id @default(cuid())
 *   collectionPointId String
 *   userId           String
 *   imageUrl         String?  // URL of uploaded photo
 *   lanyardCount     Int      @default(0)
 *   plasticCount     Int      @default(0)
 *   metalCount       Int      @default(0)
 *   glassCount       Int      @default(0)
 *   otherCount       Int      @default(0)
 *   totalWeightKg    Float?
 *   cvConfidence     Float?   // Confidence score from CV service
 *   verified         Boolean  @default(false)
 *   collectionPoint  CollectionPoint @relation(fields: [collectionPointId], references: [id])
 *   user             User     @relation(fields: [userId], references: [id])
 *   createdAt        DateTime @default(now())
 * }
 */

export interface CollectionReading {
  id: string;
  collectionPointId: string;
  userId: string;
  imageUrl?: string;
  lanyardCount: number;
  plasticCount: number;
  metalCount: number;
  glassCount: number;
  otherCount: number;
  totalWeightKg?: number;
  cvConfidence?: number;
  verified: boolean;
  createdAt: Date;
}
