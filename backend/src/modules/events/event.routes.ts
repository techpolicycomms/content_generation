import { Router, Request, Response, NextFunction } from 'express';
import { EventService } from './event.service';
import { roleGuard } from '../../middleware/role-guard';

const router = Router();
const eventService = new EventService();

// List events
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await eventService.findAll(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get event by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await eventService.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (error) {
    next(error);
  }
});

// Create event (organiser or admin)
router.post('/', roleGuard('organiser'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const event = await eventService.create({ ...req.body, organiserId: userId });
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
});

// Update event
router.patch('/:id', roleGuard('organiser'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await eventService.update(req.params.id, req.body);
    res.json(event);
  } catch (error) {
    next(error);
  }
});

// Join event
router.post('/:id/join', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const participant = await eventService.addParticipant(req.params.id, userId);
    res.status(201).json(participant);
  } catch (error) {
    next(error);
  }
});

// Leave event
router.delete('/:id/leave', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    await eventService.removeParticipant(req.params.id, userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
