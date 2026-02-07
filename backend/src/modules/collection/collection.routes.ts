import { Router, Request, Response, NextFunction } from 'express';
import { CollectionService } from './collection.service';
import { roleGuard } from '../../middleware/role-guard';

const router = Router();
const collectionService = new CollectionService();

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
