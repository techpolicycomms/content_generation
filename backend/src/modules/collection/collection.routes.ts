import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { CollectionService } from './collection.service';
import { roleGuard } from '../../middleware/role-guard';

const router = Router();
const collectionService = new CollectionService();

// Ensure uploads directory exists
const UPLOADS_DIR = path.resolve(__dirname, '../../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Upload an image for CV analysis
router.post('/upload', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Content-Type must be multipart/form-data' });
    }

    // Collect raw body chunks (works with Express without multer)
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    await new Promise<void>((resolve) => req.on('end', resolve));
    const body = Buffer.concat(chunks);

    // Extract boundary from content-type header
    const boundary = contentType.split('boundary=')[1];
    if (!boundary) {
      return res.status(400).json({ error: 'Missing multipart boundary' });
    }

    // Parse the multipart body to find the image part
    const bodyStr = body.toString('latin1');
    const parts = bodyStr.split(`--${boundary}`);
    let imageBuffer: Buffer | null = null;
    let filename = `upload-${Date.now()}.jpg`;

    for (const part of parts) {
      if (part.includes('Content-Disposition') && part.includes('name="image"')) {
        const filenameMatch = part.match(/filename="(.+?)"/);
        if (filenameMatch) filename = `${Date.now()}-${filenameMatch[1]}`;

        // Find the blank line separating headers from body
        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd !== -1) {
          const dataStart = headerEnd + 4;
          const dataEnd = part.endsWith('\r\n') ? part.length - 2 : part.length;
          imageBuffer = Buffer.from(part.substring(dataStart, dataEnd), 'latin1');
        }
        break;
      }
    }

    if (!imageBuffer) {
      return res.status(400).json({ error: 'No image field found in upload' });
    }

    // Save to uploads directory
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = path.join(UPLOADS_DIR, safeName);
    fs.writeFileSync(filePath, imageBuffer);

    // Return a URL the frontend and CV service can use
    const imageUrl = `/uploads/${safeName}`;
    res.status(201).json({ imageUrl });
  } catch (error) {
    next(error);
  }
});

// Create a collection point for an event
router.post('/points', roleGuard('organiser'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const point = await collectionService.createCollectionPoint(req.body);
    res.status(201).json(point);
  } catch (error) {
    next(error);
  }
});

// Get collection points for an event
router.get('/points/event/:eventId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const points = await collectionService.getCollectionPointsByEvent(req.params.eventId);
    res.json(points);
  } catch (error) {
    next(error);
  }
});

// Submit a collection reading (volunteer or organiser)
router.post('/readings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const reading = await collectionService.submitReading({ ...req.body, userId });
    res.status(201).json(reading);
  } catch (error) {
    next(error);
  }
});

// Get readings for a collection point
router.get('/readings/point/:pointId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const readings = await collectionService.getReadingsByPoint(req.params.pointId);
    res.json(readings);
  } catch (error) {
    next(error);
  }
});

// Verify a reading (organiser or admin)
router.patch('/readings/:id/verify', roleGuard('organiser'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reading = await collectionService.verifyReading(req.params.id);
    res.json(reading);
  } catch (error) {
    next(error);
  }
});

export default router;
